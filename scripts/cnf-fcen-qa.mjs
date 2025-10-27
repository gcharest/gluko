#!/usr/bin/env node
/* eslint-env node */
// 'use strict' removed to allow usage of global 'console'
/* global process */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { ensureDir, createLogger, almostEqual, getFoodId } from './lib/utils.js'
import { extractFctGluc } from './lib/formatters.js'
import { computeFctGluc } from './lib/compute.js'
import { loadFileSync, loadSamplePathSync } from './lib/loaders.js'

// derive repository workspace root from this script file location so the
// script works when invoked from `scripts` (or any CWD)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const workspaceRoot = path.resolve(__dirname, '..')
const defaultShardsDir = path.join(workspaceRoot, 'scripts', 'tmp', 'shards')
const defaultSamplePath = path.join(workspaceRoot, 'src', 'assets', 'canadian_nutrient_file.json')
const defaultCanonicalPath = path.join(
  workspaceRoot,
  'src',
  'assets',
  'canadian_nutrient_file.json'
)
const defaultOutReport = path.join(workspaceRoot, 'scripts', 'tmp', 'cnf-fcen-qa_report.json')

// logger (can be reconfigured in main based on --debug)
let logger = createLogger('info')

function usage() {
  logger.info('Usage: node scripts/cnf-fcen-qa.mjs [options]')
  logger.info('')
  logger.info('Options:')
  logger.info('  --shards-dir <path>       Path to a directory of shards (NDJSON/.br/.gz).')
  logger.info('  --sample-path <path>      Path to a single sample file (JSON/NDJSON/.gz/.br).')
  logger.info(
    '  --canonical <path>        Path to the canonical JSON file (array) to compare against.'
  )
  logger.info(
    '  --out <path>              Output path for the QA JSON report. (default: scripts/tmp/cnf-fcen-qa_report.json)'
  )
  logger.info(
    '  --tol <number>            Numeric tolerance for approximate matches (default: 1e-6).'
  )
  logger.info(
    '  --max-examples <n>        Max mismatch examples to include in report (default: 20).'
  )
  logger.info('  --debug, -v               Enable debug logging.')
  logger.info(
    '  --fields <f1,f2,...>      Comma-separated list of fields to compare (default: FctGluc).'
  )
  logger.info('')
  logger.info('Schema & legacy support:')
  logger.info(
    '  --sample-schema <auto|canonical|full|legacy>     Hint for the sample schema. "auto" (default) will try to detect.'
  )
  logger.info(
    '  --canonical-schema <auto|canonical|full|legacy>  Hint for the canonical schema. "auto" (default) will try to detect.'
  )
  logger.info('')
  logger.info('Legacy nutrition IDs (when comparing legacy flattened records):')
  logger.info(
    '  --chocdf-id <id>         Nutrient id used for available carbohydrate (CHOCDF) in legacy files (e.g. "205").'
  )
  logger.info(
    '  --fibtg-id <id>          Nutrient id used for total fibre (FIBTG) in legacy files (e.g. "555").'
  )
  logger.info('')
  logger.info('Behavior notes:')
  logger.info(
    '  - The script extracts FctGluc from Derived.FctGluc.value or top-level FctGluc when present.'
  )
  logger.info(
    '  - If FctGluc is not present but the record has TagIndex + NutrientsById, the script will compute FctGluc'
  )
  logger.info(
    '    using the ETL formula: (CHOCDF - FIBTG) / 100 via the existing computeFctGluc helper.'
  )
  logger.info(
    '  - For legacy flattened records (numeric nutrient keys at top-level), pass --chocdf-id and --fibtg-id to compute'
  )
  logger.info(
    '    FctGluc as (CHOCDF - FIBTG) / 100 when needed. If not provided, legacy numeric keys are not interpreted automatically.'
  )
  logger.info('')
  logger.info('Examples:')
  logger.info('  # compare shards to canonical (auto-detect schemas)')
  logger.info(
    '  node scripts/cnf-fcen-qa.mjs --shards-dir scripts/tmp/shards --canonical src/assets/canadian_nutrient_file.json --out scripts/tmp/report.json'
  )
  logger.info('')
  logger.info('  # compare legacy flattened shards (CHOCDF=205, FIBTG=555) to canonical')
  logger.info(
    '  node scripts/cnf-fcen-qa.mjs --shards-dir legacy/shards --canonical src/assets/canadian_nutrient_file.json --chocdf-id 205 --fibtg-id 555 --out scripts/tmp/report.json'
  )
}

function compare(
  sampleArr,
  canonicalArr,
  tol = 1e-6,
  maxExamples = 20,
  sampleSchema = 'auto',
  canonicalSchema = 'auto',
  chocdfId = null,
  fibtgId = null,
  fields = ['FctGluc']
) {
  // build canonical map keyed by food id for fast lookup
  const canMap = new Map()
  for (const c of canonicalArr) {
    const id = getFoodId(c)
    if (id) canMap.set(String(id), c)
  }

  // prepare per-field result buckets
  const fieldResults = {}
  for (const f of fields) {
    fieldResults[f] = {
      totalSampled: sampleArr.length,
      matched: 0,
      missingInCanonical: 0,
      missingInSample: 0,
      exactMatches: 0,
      withinTolerance: 0,
      mismatches: 0,
      examples: []
    }
  }

  const sampleIds = new Set()

  // helper: get value for arbitrary field name; reuse existing FctGluc logic where appropriate
  function getFieldValue(item, fieldName, schemaHint) {
    if (!item || !fieldName) return null
    // special-case FctGluc to retain existing extraction/compute behavior
    if (fieldName === 'FctGluc' || fieldName.toLowerCase() === 'fctgluc') {
      return getFctValue(item, schemaHint, { chocdfId, fibtgId })
    }

    // Attempt generic extraction patterns:
    // 1) Derived.<Field>.value
    try {
      if (item.Derived && Object.prototype.hasOwnProperty.call(item.Derived, fieldName)) {
        const d = item.Derived[fieldName]
        if (d && (typeof d.value !== 'undefined' || typeof d.Value !== 'undefined')) {
          return typeof d.value !== 'undefined' ? d.value : d.Value
        }
      }
    } catch {
      // ignore
    }

    // 2) top-level property
    if (Object.prototype.hasOwnProperty.call(item, fieldName)) return item[fieldName]

    // 3) NutrientsById[fieldName] -> try common shapes (.Value, .value, numeric)
    try {
      if (
        item.NutrientsById &&
        Object.prototype.hasOwnProperty.call(item.NutrientsById, fieldName)
      ) {
        const n = item.NutrientsById[fieldName]
        if (n && (typeof n.Value !== 'undefined' || typeof n.value !== 'undefined')) {
          return typeof n.value !== 'undefined' ? n.value : n.Value
        }
        if (typeof n === 'number') return n
      }
    } catch {
      // ignore
    }

    // 4) legacy flattened numeric key (if fieldName is numeric id) handled by getFctValue when schema=legacy;
    //    for generic fields we can also return numeric top-level when present
    if (/^[0-9]+$/.test(fieldName) && Object.prototype.hasOwnProperty.call(item, fieldName)) {
      const v = Number(item[fieldName])
      if (!Number.isNaN(v)) return v
    }

    return null
  }

  for (const s of sampleArr) {
    const id = getFoodId(s)
    if (id) sampleIds.add(String(id))
    const c = id ? canMap.get(String(id)) : null

    for (const f of fields) {
      const bucket = fieldResults[f]
      const sVal = getFieldValue(s, f, sampleSchema)
      if (!c) {
        bucket.missingInCanonical++
        continue
      }
      bucket.matched++
      const cVal = getFieldValue(c, f, canonicalSchema)
      if (sVal === cVal) {
        bucket.exactMatches++
      } else if (sVal === null && cVal === null) {
        bucket.exactMatches++
      } else if (
        typeof sVal === 'number' &&
        typeof cVal === 'number' &&
        almostEqual(sVal, cVal, tol)
      ) {
        bucket.withinTolerance++
      } else {
        bucket.mismatches++
        if (bucket.examples.length < maxExamples) {
          bucket.examples.push({
            FoodID: id,
            field: f,
            sample: sVal,
            canonical: cVal,
            diff: typeof sVal === 'number' && typeof cVal === 'number' ? sVal - cVal : null
          })
        }
      }
    }
  }

  // canonical entries missing from sample (per-field)
  for (const c of canonicalArr) {
    const id = getFoodId(c)
    if (!id) continue
    if (!sampleIds.has(String(id))) {
      for (const f of fields) {
        fieldResults[f].missingInSample++
      }
    }
  }

  // maintain backward compatibility: return single results object when only one field requested
  if (fields.length === 1) {
    return fieldResults[fields[0]]
  }

  return { fields, fieldResults }
}

// Heuristic schema detection: returns 'canonical' | 'full' | 'legacy'
function detectSchema(item) {
  if (!item || typeof item !== 'object') return 'canonical'
  if (item.TagIndex || item.NutrientsById || item.Derived) return 'canonical'
  // legacy flattened: presence of numeric top-level keys
  for (const k of Object.keys(item)) {
    if (/^[0-9]+$/.test(k)) return 'legacy'
  }
  return 'canonical'
}

// Get FctGluc value for a record, using schema hints and optional legacy nutrient ids
function getFctValue(item, schemaHint = 'auto', opts = {}) {
  // 1) try explicit extractor
  const v = extractFctGluc(item)
  if (v !== null && typeof v !== 'undefined') return v

  // 2) if structure supports computeFctGluc, try it
  try {
    if (item && item.TagIndex && item.NutrientsById) {
      const c = computeFctGluc(item)
      if (typeof c === 'number') return c
    }
  } catch {
    // ignore
  }

  // 3) legacy flattened support: if schemaHint says legacy or auto-detected legacy,
  //    compute using provided nutrient ids (chocdfId and fibtgId)
  const schema = schemaHint === 'auto' ? detectSchema(item) : schemaHint
  if (schema === 'legacy') {
    const { chocdfId, fibtgId } = opts
    if (chocdfId && fibtgId && Object.prototype.hasOwnProperty.call(item, chocdfId)) {
      const choc = Number(item[chocdfId])
      const fib = Number(item[fibtgId])
      if (!Number.isNaN(choc) && !Number.isNaN(fib)) return (choc - fib) / 100
    }
  }

  return null
}

function writeReport(outPath, reportObj) {
  const dir = path.dirname(outPath)
  // reuse ensureDir helper for consistent directory creation behavior
  ensureDir(dir)
  fs.writeFileSync(outPath, JSON.stringify(reportObj, null, 2), 'utf8')
}

function formatBytes(bytes) {
  if (bytes === null || typeof bytes === 'undefined') return null
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function computeSizeComparison(sampleSourcePath, canonicalPath) {
  let jsonSize = null
  try {
    if (canonicalPath && fs.existsSync(canonicalPath)) {
      const s = fs.statSync(canonicalPath)
      if (s.isFile()) jsonSize = s.size
    }
  } catch {
    jsonSize = null
  }

  let brSize = 0
  let brCount = 0
  try {
    if (sampleSourcePath && fs.existsSync(sampleSourcePath)) {
      const s = fs.statSync(sampleSourcePath)
      if (s.isDirectory()) {
        const items = fs.readdirSync(sampleSourcePath, { withFileTypes: true })
        for (const it of items) {
          if (it.isFile() && it.name.toLowerCase().endsWith('.br')) {
            const p = path.join(sampleSourcePath, it.name)
            try {
              brSize += fs.statSync(p).size
              brCount++
            } catch {
              // ignore file-level errors
            }
          }
        }
      } else if (s.isFile()) {
        if (sampleSourcePath.toLowerCase().endsWith('.br')) {
          brSize = s.size
          brCount = 1
        } else {
          const brPath = `${sampleSourcePath}.br`
          if (fs.existsSync(brPath)) {
            const s2 = fs.statSync(brPath)
            if (s2.isFile()) {
              brSize = s2.size
              brCount = 1
            }
          }
        }
      }
    }
  } catch {
    brSize = brSize || 0
    brCount = brCount || 0
  }

  const savings = jsonSize !== null ? jsonSize - brSize : null
  const percent = jsonSize ? (savings / jsonSize) * 100 : null

  return {
    jsonSizeBytes: jsonSize,
    jsonSizeHuman: formatBytes(jsonSize),
    brSizeBytes: brSize,
    brSizeHuman: formatBytes(brSize),
    brFiles: brCount,
    savingsBytes: savings,
    savingsHuman: formatBytes(savings),
    percentSaved: percent !== null ? Number(percent.toFixed(2)) : null
  }
}

function main() {
  const argv = process.argv.slice(2)
  let shardsDir = null
  let samplePath = null
  let canonical = null
  let out = null
  let sampleSchema = 'auto'
  let canonicalSchema = 'auto'
  let chocdfId = null
  let fibtgId = null
  let tol = 1e-6
  let maxExamples = 20
  let debug = false
  let fields = ['FctGluc']

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--shards-dir' || a === '-s') {
      shardsDir = argv[++i]
    } else if (a === '--sample-path') {
      samplePath = argv[++i]
    } else if (a === '--canonical' || a === '-c') {
      canonical = argv[++i]
    } else if (a === '--out' || a === '-o') {
      out = argv[++i]
    } else if (a === '--tol') {
      tol = Number(argv[++i])
    } else if (a === '--max-examples') {
      maxExamples = Number(argv[++i])
    } else if (a === '--debug' || a === '-v') {
      debug = true
    } else if (a === '--sample-schema') {
      sampleSchema = argv[++i]
    } else if (a === '--canonical-schema') {
      canonicalSchema = argv[++i]
    } else if (a === '--fields') {
      const raw = argv[++i] || ''
      fields = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (a === '--chocdf-id') {
      chocdfId = argv[++i]
    } else if (a === '--fibtg-id') {
      fibtgId = argv[++i]
    } else if (a === '--help' || a === '-h') {
      usage()
      process.exit(0)
    }
  }

  // decide sample source: shards dir preferred, then samplePath, then default sample file
  let sampleSource = null
  if (shardsDir) sampleSource = path.resolve(shardsDir)
  else if (samplePath) sampleSource = path.resolve(samplePath)
  else if (fs.existsSync(defaultShardsDir)) sampleSource = defaultShardsDir
  else sampleSource = defaultSamplePath

  const canonicalPath = canonical ? path.resolve(canonical) : defaultCanonicalPath
  const outPath = out ? path.resolve(out) : defaultOutReport

  if (debug) {
    logger = createLogger('debug')
    logger.debug('Options:')
    logger.debug('  sampleSource:', sampleSource)
    logger.debug('  canonicalPath:', canonicalPath)
    logger.debug('  outPath:', outPath)
    logger.debug('  tol:', tol)
    logger.debug('  maxExamples:', maxExamples)
    logger.debug('  fields:', fields)
  }

  if (!fs.existsSync(sampleSource)) {
    logger.error('Sample source not found:', sampleSource)
    process.exit(2)
  }
  if (!fs.existsSync(canonicalPath)) {
    logger.error('Canonical file not found:', canonicalPath)
    process.exit(2)
  }

  let sample = []
  try {
    // let loader helper decide whether sampleSource is a file or a shards dir
    sample = loadSamplePathSync(sampleSource, debug)
  } catch {
    logger.error('Failed to load sample:')
    process.exit(2)
  }

  let canonicalArr = []
  try {
    canonicalArr = loadFileSync(canonicalPath, debug)
  } catch {
    logger.error('Failed to load canonical:')
    process.exit(2)
  }

  const report = compare(
    sample,
    canonicalArr,
    tol,
    maxExamples,
    sampleSchema,
    canonicalSchema,
    chocdfId,
    fibtgId,
    fields
  )
  report.generatedAt = new Date().toISOString()
  report.tolerance = tol
  // include size comparison (JSON canonical vs .br compressed shards/files)
  try {
    report.sizeComparison = computeSizeComparison(sampleSource, canonicalPath)
  } catch {
    report.sizeComparison = null
  }

  try {
    writeReport(outPath, report)
    logger.info('QA report written to', outPath)
  } catch (e) {
    logger.error('Failed to write report:', e && e.message)
    process.exit(1)
  }

  // console summary — support single-field legacy shape and multi-field results
  if (report && report.fieldResults) {
    // multi-field
    for (const f of report.fields) {
      const r = report.fieldResults[f]
      logger.info(
        `Summary for ${f}: total sample:`,
        r.totalSampled,
        'matched:',
        r.matched,
        'exact:',
        r.exactMatches,
        'withinTol:',
        r.withinTolerance,
        'mismatches:',
        r.mismatches,
        'missingInCanonical:',
        r.missingInCanonical,
        'missingInSample:',
        r.missingInSample
      )
      if (r.examples && r.examples.length) {
        logger.info('Examples (first', r.examples.length + '):')
        for (const e of r.examples) logger.info(e)
      }
    }
  } else {
    // single-field legacy shape
    logger.info(
      'Summary: total sample:',
      report.totalSampled,
      'matched:',
      report.matched,
      'exact:',
      report.exactMatches,
      'withinTol:',
      report.withinTolerance,
      'mismatches:',
      report.mismatches,
      'missingInCanonical:',
      report.missingInCanonical,
      'missingInSample:',
      report.missingInSample
    )
    if (report.examples && report.examples.length) {
      logger.info('Examples (first', report.examples.length + '):')
      for (const e of report.examples) logger.info(e)
    }
  }
}

// If executed directly, run main()
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main()
}

export default main
