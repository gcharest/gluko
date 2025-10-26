#!/usr/bin/env node
/* eslint-env node */
'use strict'
/*
  qa_fctgluc.cjs

  Standalone QA script to compare FctGluc values between a sharded gzipped
  NDJSON dataset (or single JSON/NDJSON file) and the canonical unsharded
  JSON dataset.

  Features
  - Load shards from a directory (gzipped .gz files containing NDJSON or a JSON array)
  - Load canonical JSON file (array)
  - Compare FctGluc values (Derived.FctGluc.value or top-level FctGluc)
  - Report missing entries in either dataset, mismatches, and summary stats
  - Write a JSON report to disk

  Usage
    node scripts/qa_fctgluc.cjs [--shards-dir <path>] [--canonical <path>] [--out <path>] [--tol <number>] [--max-examples <n>] [--debug]

*/

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const workspaceRoot = process.cwd()
const defaultShardsDir = path.join(workspaceRoot, 'scripts', 'tmp', 'shards')
const defaultSamplePath = path.join(workspaceRoot, 'src', 'assets', 'canadian_nutrient_file.json')
const defaultCanonicalPath = path.join(
  workspaceRoot,
  'src',
  'assets',
  'canadian_nutrient_file.json'
)
const defaultOutReport = path.join(workspaceRoot, 'scripts', 'tmp', 'qa_fctgluc_report.json')

function usage() {
  console.log(
    'Usage: node scripts/qa_fctgluc.cjs [--shards-dir <path>] [--sample-path <path>] [--canonical <path>] [--out <path>] [--tol <number>] [--max-examples <n>] [--debug]'
  )
}

function readJsonSync(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function getFctFromItem(item) {
  if (!item) return null
  if (item.Derived && item.Derived.FctGluc && typeof item.Derived.FctGluc.value !== 'undefined')
    return item.Derived.FctGluc.value
  if (typeof item.FctGluc !== 'undefined') return item.FctGluc
  return null
}

function getFoodId(item) {
  if (!item) return null
  if (item.FoodID !== undefined && item.FoodID !== null && String(item.FoodID).trim() !== '')
    return String(item.FoodID)
  if (item.FoodCode !== undefined && item.FoodCode !== null && String(item.FoodCode).trim() !== '')
    return String(item.FoodCode)
  return null
}

function almostEqual(a, b, tol = 1e-6) {
  if (a === null || b === null) return false
  if (Number.isNaN(a) || Number.isNaN(b)) return false
  return Math.abs(a - b) <= tol
}

function loadFileSync(p, debug = false) {
  const lower = p.toLowerCase()
  if (lower.endsWith('.gz')) {
    const buf = fs.readFileSync(p)
    const un = zlib.gunzipSync(buf).toString('utf8')
    const t = un.trim()
    if (t.startsWith('[')) {
      try {
        return JSON.parse(t)
      } catch (e) {
        if (debug) console.warn('Failed to parse gz JSON array', p, e && e.message)
      }
    }
    // NDJSON
    const out = []
    for (const l of t.split('\n')) {
      if (!l || !l.trim()) continue
      try {
        out.push(JSON.parse(l))
      } catch (e) {
        if (debug) console.warn('Skipping invalid JSON line in', p)
      }
    }
    return out
  }
  if (lower.endsWith('.json')) {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  }
  // assume NDJSON
  const txt = fs.readFileSync(p, 'utf8')
  const out = []
  for (const l of txt.split('\n')) {
    if (!l || !l.trim()) continue
    try {
      out.push(JSON.parse(l))
    } catch (e) {
      if (debug) console.warn('Skipping invalid JSON line in', p)
    }
  }
  return out
}

function loadShardsDirSync(dir, debug = false) {
  if (!fs.existsSync(dir)) throw new Error('Shards dir not found: ' + dir)
  const files = fs.readdirSync(dir).sort()
  const all = []
  for (const f of files) {
    const fp = path.join(dir, f)
    const st = fs.statSync(fp)
    if (!st.isFile()) continue
    try {
      const res = loadFileSync(fp, debug)
      if (Array.isArray(res)) all.push(...res)
      else all.push(res)
    } catch (e) {
      if (debug) console.warn('Skipping file', fp, e && e.message)
    }
  }
  return all
}

function loadSamplePathSync(samplePath, debug = false) {
  if (!fs.existsSync(samplePath)) throw new Error('Sample path not found: ' + samplePath)
  const st = fs.statSync(samplePath)
  if (st.isDirectory()) {
    // treat as shards dir
    return loadShardsDirSync(samplePath, debug)
  }
  return loadFileSync(samplePath, debug)
}

function compare(sampleArr, canonicalArr, tol = 1e-6, maxExamples = 20) {
  const canMap = new Map()
  for (const c of canonicalArr) {
    const id = getFoodId(c)
    if (id) canMap.set(String(id), c)
  }

  const results = {
    totalSampled: sampleArr.length,
    matched: 0,
    missingInCanonical: 0,
    missingInSample: 0,
    exactMatches: 0,
    withinTolerance: 0,
    mismatches: 0,
    examples: []
  }

  const sampleIds = new Set()

  for (const s of sampleArr) {
    const id = getFoodId(s)
    if (id) sampleIds.add(String(id))
    const sVal = getFctFromItem(s)
    const c = id ? canMap.get(String(id)) : null
    if (!c) {
      results.missingInCanonical++
      continue
    }
    results.matched++
    const cVal =
      typeof c.FctGluc !== 'undefined'
        ? c.FctGluc
        : c.Derived && c.Derived.FctGluc
          ? c.Derived.FctGluc.value
          : null
    if (sVal === cVal) {
      results.exactMatches++
    } else if (sVal === null && cVal === null) {
      results.exactMatches++
    } else if (
      typeof sVal === 'number' &&
      typeof cVal === 'number' &&
      almostEqual(sVal, cVal, tol)
    ) {
      results.withinTolerance++
    } else {
      results.mismatches++
      if (results.examples.length < maxExamples) {
        results.examples.push({
          FoodID: id,
          sample: sVal,
          canonical: cVal,
          diff: typeof sVal === 'number' && typeof cVal === 'number' ? sVal - cVal : null
        })
      }
    }
  }

  // canonical entries missing from sample
  for (const c of canonicalArr) {
    const id = getFoodId(c)
    if (!id) continue
    if (!sampleIds.has(String(id))) results.missingInSample++
  }

  return results
}

function writeReport(outPath, reportObj) {
  const dir = path.dirname(outPath)
  try {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(outPath, JSON.stringify(reportObj, null, 2), 'utf8')
  } catch (e) {
    throw e
  }
}

function main() {
  const argv = process.argv.slice(2)
  let shardsDir = null
  let samplePath = null
  let canonical = null
  let out = null
  let tol = 1e-6
  let maxExamples = 20
  let debug = false

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
    console.log('Options:')
    console.log('  sampleSource:', sampleSource)
    console.log('  canonicalPath:', canonicalPath)
    console.log('  outPath:', outPath)
    console.log('  tol:', tol)
    console.log('  maxExamples:', maxExamples)
  }

  if (!fs.existsSync(sampleSource)) {
    console.error('Sample source not found:', sampleSource)
    process.exit(2)
  }
  if (!fs.existsSync(canonicalPath)) {
    console.error('Canonical file not found:', canonicalPath)
    process.exit(2)
  }

  let sample = []
  try {
    // if sampleSource is a directory, treat as shards dir
    const st = fs.statSync(sampleSource)
    if (st.isDirectory()) sample = loadShardsDirSync(sampleSource, debug)
    else sample = loadFileSync(sampleSource, debug)
  } catch (e) {
    console.error('Failed to load sample:', e && e.message)
    process.exit(2)
  }

  let canonicalArr = []
  try {
    canonicalArr = readJsonSync(canonicalPath)
  } catch (e) {
    console.error('Failed to load canonical:', e && e.message)
    process.exit(2)
  }

  const report = compare(sample, canonicalArr, tol, maxExamples)
  report.generatedAt = new Date().toISOString()
  report.tolerance = tol

  try {
    writeReport(outPath, report)
    console.log('QA report written to', outPath)
  } catch (e) {
    console.error('Failed to write report:', e && e.message)
    process.exit(1)
  }

  // console summary
  console.log(
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
    console.log('Examples (first', report.examples.length + '):')
    for (const e of report.examples) console.log(e)
  }
}

if (require.main === module) main()
