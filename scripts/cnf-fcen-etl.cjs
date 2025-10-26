#!/usr/bin/env node
/**
 * Canadian Nutrient File ETL Script
 *
 * This script processes the Canadian Nutrient File (CNF) CSV datasets,
 * applies updates from "update" CSVs, and outputs sharded, gzipped NDJSON files
 * for efficient downstream use. It also exports provenance and empty records if requested.
 *
 * Features:
 * - Loads and merges nutrient metadata, food names, conversion factors, and nutrient amounts.
 * - Applies changes, additions, and deletions from update CSVs.
 * - Computes derived fields (e.g., FctGluc: available carbohydrate).
 * - Shards output records by FoodID, with configurable shard size and max shard bytes.
 * - Exports provenance of updates and empty records as gzipped NDJSON.
 * - Provides CLI options for sample size, output directory, logging, and more.
 *
 * Usage:
 *   node scripts/cnf-fcen-etl.cjs [options] [sampleLimit]
 *
 * Options:
 *   --help, -h                Show help and exit
 *   --full, -f                Process full dataset (sampleLimit=0)
 *   --dry-run, -d             Run without writing output files
 *   --shard-size, -s <N>      Number of FoodIDs per shard (default 10000)
 *   --out-dir, -o <path>      Output directory (default scripts/tmp)
 *   --log-level, -l <level>   Log level: error,warn,info,debug (default info)
 *   --max-shard-size, -M <s>  Max uncompressed shard size (e.g. 512K, 1M)
 *   --csv-dir <path>          Override input CSV directory
 *   --update-dir <path>       Override update CSV directory
 *   --export-provenance, -e   Export provenance updates to gzipped NDJSON
 *
 * Main Functions:
 * - run(options): Executes the ETL pipeline with provided options.
 * - computeFctGluc(s): Computes available carbohydrate (FctGluc) for a food record.
 * - safeTrimId(v): Safely trims and normalizes IDs.
 * - makeNutrientProvKeys(foodId, nutrientIdRaw): Generates provenance keys for nutrient updates.
 *
 * Output:
 * - Sharded gzipped NDJSON files containing processed food records.
 * - Manifest JSON describing shards and metadata.
 * - Optional provenance and empty-record NDJSON exports.
 *
 * Environment:
 * - Node.js
 * - Requires csv-parse, zlib, and crypto modules.
 *
 * @module cnf-fcen-etl
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse')
const zlib = require('zlib')
const crypto = require('crypto')

const workspaceRoot = process.cwd()

// ---------- Logger -------------------------------------------------------
function createLogger(level = 'info') {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 }
  const cur = levels[level] != null ? levels[level] : levels.info
  const stamp = () => new Date().toISOString()
  return {
    error: (...args) => {
      if (cur >= levels.error) console.error('[ERROR]', stamp(), ...args)
    },
    warn: (...args) => {
      if (cur >= levels.warn) console.warn('[WARN]', stamp(), ...args)
    },
    info: (...args) => {
      if (cur >= levels.info) console.log('[INFO]', stamp(), ...args)
    },
    debug: (...args) => {
      if (cur >= levels.debug) console.log('[DEBUG]', stamp(), ...args)
    }
  }
}

let logger = createLogger('info')

// Dedupe sets used by update processing (same semantics as original)
const warnedConversionAddKeys = new Set()
const warnedFoodNameAddIds = new Set()
const warnedNutrientNameAddIds = new Set()

// Default input dirs (can be overridden by CLI parse)
let csvDir = path.join(workspaceRoot, 'nutrient_file_raw', 'cnf-fcen-csv')
let updateDir = path.join(workspaceRoot, 'nutrient_file_raw', 'cnf-fcen-csv-update-miseajour')

// ---------- Small helpers ------------------------------------------------
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function mergeNonEmpty(target, src) {
  for (const k of Object.keys(src)) {
    const v = src[k]
    if (v !== '' && typeof v !== 'undefined') target[k] = v
  }
}

function safeTrimId(v) {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function normalizeProvKeys(keys) {
  if (!keys || typeof keys !== 'object') return keys
  const out = {}
  for (const k of Object.keys(keys)) {
    const v = keys[k]
    if (v === 0) {
      out[k] = '0'
      continue
    }
    const s = safeTrimId(v)
    if (s !== null) out[k] = s
  }
  return out
}

function makeProvEvent(file, action, table, keys) {
  return {
    file,
    action,
    table,
    keys: normalizeProvKeys(keys),
    timestamp: new Date().toISOString()
  }
}

function makeNutrientProvKeys(foodId, nutrientIdRaw) {
  const keys = { FoodID: String(foodId) }
  const n = safeTrimId(nutrientIdRaw)
  if (n) keys.NutrientID = n
  return normalizeProvKeys(keys)
}

// CSV stream helpers (fallback to empty stream if file missing)
function csvStream(fileName) {
  const p = path.join(csvDir, fileName)
  if (!fs.existsSync(p)) {
    const { Readable } = require('stream')
    return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
  }
  return fs.createReadStream(p).pipe(parse({ columns: true, skip_empty_lines: true }))
}

function updateCsvStream(fileName) {
  const p = path.join(updateDir, fileName)
  if (!fs.existsSync(p)) {
    const { Readable } = require('stream')
    return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
  }
  return fs.createReadStream(p).pipe(parse({ columns: true, skip_empty_lines: true }))
}

function existsInUpdateDir(fileName) {
  try {
    return fs.existsSync(path.join(updateDir, fileName))
  } catch (e) {
    return false
  }
}

// Parse user-friendly size strings into bytes
function parseSizeToBytes(s) {
  if (s === undefined || s === null) return null
  if (typeof s === 'number') return Number(s)
  const str = String(s).trim().toLowerCase()
  const m = str.match(/^([0-9]+(?:\.[0-9]+)?)(k|kb|m|mb)?$/)
  if (!m) return null
  const num = Number(m[1])
  const unit = m[2]
  if (!unit) return Math.round(num * 1024)
  if (unit === 'k' || unit === 'kb') return Math.round(num * 1024)
  if (unit === 'm' || unit === 'mb') return Math.round(num * 1024 * 1024)
  return null
}

function printHelp() {
  console.log('\nUsage: node scripts/cnf-fcen-etl.cjs [options] [sampleLimit]\n')
  console.log('Options:')
  console.log('  --help, -h                Show this help and exit')
  console.log('  --full, -f                Process full dataset (sampleLimit=0)')
  console.log('  --dry-run, -d            Run without writing output files')
  console.log('  --shard-size, -s <N>     Number of FoodIDs per shard (default 10000)')
  console.log('  --out-dir, -o <path>     Output directory (default scripts/tmp)')
  console.log('  --log-level, -l <level>  Log level: error,warn,info,debug (default info)')
  console.log('  --max-shard-size, -M <s> Max uncompressed shard size (e.g. 512K, 1M)')
  console.log(
    '  --format, -F <full|canonical>  Output object shape: full (internal) or canonical (canonical JSON)'
  )
  console.log('  --inspect <N>            Print N transformed sample records (implies --dry-run)')
  console.log('  --csv-dir <path>         Override input CSV directory')
  console.log('  --update-dir <path>      Override update CSV directory')
  console.log('  --export-provenance, -e  Export provenance updates to a gzipped NDJSON')
  console.log('\nExamples:')
  console.log('  node scripts/cnf-fcen-etl.cjs           # run sample (50)')
  console.log('  node scripts/cnf-fcen-etl.cjs 0         # full run')
  console.log('  node scripts/cnf-fcen-etl.cjs -d -o out --shard-size 5000\n')
}

// ---------- Data loaders and update appliers -----------------------------
async function loadNutrientName() {
  const map = new Map()
  return new Promise((resolve, reject) => {
    const s = csvStream('NUTRIENT NAME.csv')
    s.on('data', (row) => {
      const id = String(row.NutrientID).trim()
      map.set(id, {
        id,
        code: row.NutrientCode,
        symbol: row.NutrientSymbol,
        unit: row.NutrientUnit,
        name: row.NutrientName,
        tag: row.Tagname ? row.Tagname.trim().toUpperCase() : null,
        decimals: row.NutrientDecimals ? Number(row.NutrientDecimals) : null
      })
    })
    s.on('end', () => resolve(map))
    s.on('error', reject)
  })
}

async function applyNutrientNameUpdates(map) {
  const changeFile = 'NUTRIENT NAME CHANGE.csv'
  const addFile = 'NUTRIENT NAME ADD.csv'
  const deleteFile = 'NUTRIENT NAME DELETE.csv'

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(changeFile)
      s.on('data', (row) => {
        const id = String(row.NutrientID).trim()
        const newObj = {
          id,
          code: row.NutrientCode,
          symbol: row.NutrientSymbol,
          unit: row.NutrientUnit,
          name: row.NutrientName,
          tag: row.Tagname ? row.Tagname.trim().toUpperCase() : null,
          decimals: row.NutrientDecimals ? Number(row.NutrientDecimals) : null
        }
        if (map.has(id)) {
          const existing = map.get(id)
          mergeNonEmpty(existing, newObj)
          map.set(id, existing)
        } else {
          map.set(id, newObj)
        }
      })
      s.on('end', res)
      s.on('error', rej)
    })
  }

  if (existsInUpdateDir(addFile)) {
    let nutrientAddOverwriteCount = 0
    await new Promise((res, rej) => {
      const s = updateCsvStream(addFile)
      s.on('data', (row) => {
        const id = String(row.NutrientID).trim()
        const newObj = {
          id,
          code: row.NutrientCode,
          symbol: row.NutrientSymbol,
          unit: row.NutrientUnit,
          name: row.NutrientName,
          tag: row.Tagname ? row.Tagname.trim().toUpperCase() : null,
          decimals: row.NutrientDecimals ? Number(row.NutrientDecimals) : null
        }
        if (map.has(id)) {
          if (!warnedNutrientNameAddIds.has(id)) {
            warnedNutrientNameAddIds.add(id)
            nutrientAddOverwriteCount++
          }
        }
        map.set(id, newObj)
      })
      s.on('end', res)
      s.on('error', rej)
    })
    if (nutrientAddOverwriteCount > 0)
      logger.info(
        'NUTRIENT NAME ADD overwrote %s existing entries (details suppressed)',
        nutrientAddOverwriteCount
      )
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(deleteFile)
      s.on('data', (row) => {
        const id = String(row.NutrientID).trim()
        if (map.has(id)) map.delete(id)
      })
      s.on('end', res)
      s.on('error', rej)
    })
  }
}

async function loadFoodNames(sampleLimit) {
  const map = new Map()
  return new Promise((resolve, reject) => {
    const s = csvStream('FOOD NAME.csv')
    s.on('data', (row) => {
      const id = String(row.FoodID).trim()
      if (sampleLimit && map.size >= sampleLimit) return
      map.set(id, {
        FoodID: id,
        FoodCode: row.FoodCode,
        FoodDescription: row.FoodDescription,
        FoodDescriptionF: row.FoodDescriptionF,
        FoodGroupID: row.FoodGroupID,
        FoodSourceID: row.FoodSourceID
      })
    })
    s.on('end', () => resolve(map))
    s.on('error', reject)
  })
}

async function applyFoodNameUpdates(map) {
  const changeFile = 'FOOD NAME CHANGE.csv'
  const addFile = 'FOOD NAME ADD.csv'
  const deleteFile = 'FOOD NAME DELETE.csv'
  const events = []

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(changeFile)
      s.on('data', (row) => {
        const id = String(row.FoodID).trim()
        if (!map.has(id)) {
          map.set(id, {
            FoodID: id,
            FoodCode: row.FoodCode,
            FoodDescription: row.FoodDescription,
            FoodDescriptionF: row.FoodDescriptionF,
            FoodGroupID: row.FoodGroupID,
            FoodSourceID: row.FoodSourceID
          })
          events.push(makeProvEvent(changeFile, 'CHANGE', 'FOOD NAME', { FoodID: id }))
        } else {
          const existing = map.get(id)
          mergeNonEmpty(existing, {
            FoodCode: row.FoodCode,
            FoodDescription: row.FoodDescription,
            FoodDescriptionF: row.FoodDescriptionF,
            FoodGroupID: row.FoodGroupID,
            FoodSourceID: row.FoodSourceID
          })
          map.set(id, existing)
        }
        events.push(makeProvEvent(changeFile, 'CHANGE', 'FOOD NAME', { FoodID: id }))
      })
      s.on('end', res)
      s.on('error', rej)
    })
  }

  if (existsInUpdateDir(addFile)) {
    let foodAddOverwriteCount = 0
    await new Promise((res, rej) => {
      const s = updateCsvStream(addFile)
      s.on('data', (row) => {
        const id = String(row.FoodID).trim()
        if (map.has(id)) {
          if (!warnedFoodNameAddIds.has(id)) {
            warnedFoodNameAddIds.add(id)
            foodAddOverwriteCount++
          }
        }
        map.set(id, {
          FoodID: id,
          FoodCode: row.FoodCode,
          FoodDescription: row.FoodDescription,
          FoodDescriptionF: row.FoodDescriptionF,
          FoodGroupID: row.FoodGroupID,
          FoodSourceID: row.FoodSourceID
        })
        events.push(makeProvEvent(addFile, 'ADD', 'FOOD NAME', { FoodID: id }))
      })
      s.on('end', res)
      s.on('error', rej)
    })
    if (foodAddOverwriteCount > 0)
      logger.info(
        'FOOD NAME ADD overwrote %s existing entries (details suppressed)',
        foodAddOverwriteCount
      )
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(deleteFile)
      s.on('data', (row) => {
        const id = String(row.FoodID).trim()
        if (map.has(id)) map.delete(id)
        events.push(makeProvEvent(deleteFile, 'DELETE', 'FOOD NAME', { FoodID: id }))
      })
      s.on('end', res)
      s.on('error', rej)
    })
  }
  return events
}

async function loadConversionFactors() {
  const byFood = new Map()
  return new Promise((resolve, reject) => {
    const s = csvStream('CONVERSION FACTOR.csv')
    s.on('data', (row) => {
      const foodId = String(row.FoodID).trim()
      const measureId = String(row.MeasureID).trim()
      const entry = {
        MeasureID: measureId,
        ConversionFactorValue: Number(row.ConversionFactorValue) || null,
        ConvFactorDateOfEntry: row.ConvFactorDateOfEntry || null
      }
      if (!byFood.has(foodId)) byFood.set(foodId, [])
      byFood.get(foodId).push(entry)
    })
    s.on('end', () => resolve(byFood))
    s.on('error', reject)
  })
}

async function applyConversionFactorUpdates(byFood) {
  const changeFile = 'CONVERSION FACTOR CHANGE.csv'
  const addFile = 'CONVERSION FACTOR ADD.csv'
  const deleteFile = 'CONVERSION FACTOR DELETE.csv'
  const events = []
  let convAddOverwriteCount = 0

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(changeFile)
      s.on('data', (row) => {
        const foodId = String(row.FoodID).trim()
        const measureId = String(row.MeasureID).trim()
        const entry = {
          MeasureID: measureId,
          ConversionFactorValue: Number(row.ConversionFactorValue) || null,
          ConvFactorDateOfEntry: row.ConvFactorDateOfEntry || null
        }
        const arr = byFood.get(foodId) || []
        const idx = arr.findIndex((e) => e.MeasureID === measureId)
        if (idx >= 0) arr[idx] = Object.assign(arr[idx], entry)
        else arr.push(entry)
        byFood.set(foodId, arr)
        events.push(
          makeProvEvent(changeFile, 'CHANGE', 'CONVERSION FACTOR', {
            FoodID: foodId,
            MeasureID: measureId
          })
        )
      })
      s.on('end', res)
      s.on('error', rej)
    })
  }

  if (existsInUpdateDir(addFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(addFile)
      s.on('data', (row) => {
        const foodId = String(row.FoodID).trim()
        const measureId = String(row.MeasureID).trim()
        const entry = {
          MeasureID: measureId,
          ConversionFactorValue: Number(row.ConversionFactorValue) || null,
          ConvFactorDateOfEntry: row.ConvFactorDateOfEntry || null
        }
        const arr = byFood.get(foodId) || []
        const warnKey = `${foodId}|${measureId}`
        if (arr.find((e) => e.MeasureID === measureId)) {
          if (!warnedConversionAddKeys.has(warnKey)) {
            warnedConversionAddKeys.add(warnKey)
            convAddOverwriteCount++
          }
        }
        const filtered = arr.filter((e) => e.MeasureID !== measureId)
        filtered.push(entry)
        byFood.set(foodId, filtered)
        events.push(
          makeProvEvent(addFile, 'ADD', 'CONVERSION FACTOR', {
            FoodID: foodId,
            MeasureID: measureId
          })
        )
      })
      s.on('end', res)
      s.on('error', rej)
    })
    if (convAddOverwriteCount > 0) {
      logger.info(
        'Conversion factor ADD overwrote %s existing entries (details suppressed)',
        convAddOverwriteCount
      )
    }
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(deleteFile)
      s.on('data', (row) => {
        const foodId = String(row.FoodID).trim()
        const measureId = String(row.MeasureID).trim()
        const arr = byFood.get(foodId) || []
        const filtered = arr.filter((e) => e.MeasureID !== measureId)
        byFood.set(foodId, filtered)
        events.push(
          makeProvEvent(deleteFile, 'DELETE', 'CONVERSION FACTOR', {
            FoodID: foodId,
            MeasureID: measureId
          })
        )
      })
      s.on('end', res)
      s.on('error', rej)
    })
  }
  return events
}

async function streamNutrientAmounts(nutrientMeta, foodMap, onNutrient) {
  return new Promise((resolve, reject) => {
    const s = csvStream('NUTRIENT AMOUNT.csv')
    s.on('data', (row) => {
      const foodId = String(row.FoodID).trim()
      if (!foodMap.has(foodId)) return
      const nutrientId = safeTrimId(row.NutrientID)
      if (!nutrientId) return
      const meta = nutrientMeta.get(nutrientId) || { tag: null, unit: null, decimals: null }
      onNutrient(foodId, nutrientId, {
        value: row.NutrientValue === '' ? null : Number(row.NutrientValue),
        standardError: row.StandardError === '' ? null : Number(row.StandardError),
        numberOfObservations:
          row.NumberofObservations === '' ? null : Number(row.NumberofObservations),
        NutrientSourceID: row.NutrientSourceID || null,
        NutrientDateOfEntry: row.NutrientDateOfEntry || null,
        tag: meta.tag,
        unit: meta.unit,
        decimals: meta.decimals
      })
    })
    s.on('end', resolve)
    s.on('error', reject)
  })
}

async function applyNutrientAmountUpdates(foodState, nutrientMeta) {
  const changeFile = 'NUTRIENT AMOUNT CHANGE.csv'
  const addFile = 'NUTRIENT AMOUNT ADD.csv'
  const deleteFile = 'NUTRIENT AMOUNT DELETE.csv'

  const applyRow = (row, sourceFile, action) => {
    const foodId = String(row.FoodID).trim()
    if (!foodState.has(foodId)) return
    const nutrientId = safeTrimId(row.NutrientID)
    const meta = nutrientMeta.get(nutrientId) || { tag: null, unit: null, decimals: null }
    const value = row.NutrientValue === '' ? null : Number(row.NutrientValue)
    const entry = {
      tag: meta.tag,
      value,
      unit: meta.unit,
      decimals: meta.decimals,
      provenance: {
        NutrientSourceID: row.NutrientSourceID || null,
        NutrientDateOfEntry: row.NutrientDateOfEntry || null
      }
    }
    const state = foodState.get(foodId)
    state.NutrientsById[nutrientId] = entry
    if (!state.provenance) state.provenance = { updates: [] }
    state.provenance.updates.push(
      makeProvEvent(
        sourceFile || 'NUTRIENT AMOUNT',
        action || 'APPLY',
        'NUTRIENT AMOUNT',
        makeNutrientProvKeys(foodId, nutrientId)
      )
    )
    if (meta.tag) {
      const existing = state.TagIndex[meta.tag]
      if (!existing) state.TagIndex[meta.tag] = nutrientId
      else if (existing !== nutrientId) {
        if (!Array.isArray(state.TagIndex[meta.tag])) state.TagIndex[meta.tag] = [existing]
        if (!state.TagIndex[meta.tag].includes(nutrientId))
          state.TagIndex[meta.tag].push(nutrientId)
      }
      state.NutrientsByTag[meta.tag] = { id: nutrientId, value, unit: meta.unit }
    }
  }

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(changeFile)
      s.on('data', (row) => applyRow(row, changeFile, 'CHANGE'))
      s.on('end', res)
      s.on('error', rej)
    })
  }

  if (existsInUpdateDir(addFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(addFile)
      s.on('data', (row) => applyRow(row, addFile, 'ADD'))
      s.on('end', res)
      s.on('error', rej)
    })
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      const s = updateCsvStream(deleteFile)
      s.on('data', (row) => {
        const foodId = String(row.FoodID).trim()
        if (!foodState.has(foodId)) return
        const nutrientId = safeTrimId(row.NutrientID)
        const state = foodState.get(foodId)
        if (state.NutrientsById && state.NutrientsById[nutrientId])
          delete state.NutrientsById[nutrientId]
        for (const tag of Object.keys(state.TagIndex)) {
          const v = state.TagIndex[tag]
          if (v === nutrientId) delete state.TagIndex[tag]
          else if (Array.isArray(v)) {
            const filtered = v.filter((x) => x !== nutrientId)
            if (filtered.length === 1) state.TagIndex[tag] = filtered[0]
            else state.TagIndex[tag] = filtered
          }
        }
        for (const t of Object.keys(state.NutrientsByTag)) {
          if (state.NutrientsByTag[t] && state.NutrientsByTag[t].id === nutrientId)
            delete state.NutrientsByTag[t]
        }
        if (!state.provenance) state.provenance = { updates: [] }
        state.provenance.updates.push(
          makeProvEvent(
            deleteFile,
            'DELETE',
            'NUTRIENT AMOUNT',
            makeNutrientProvKeys(foodId, nutrientId)
          )
        )
      })
      s.on('end', res)
      s.on('error', rej)
    })
  }
}

// ---------- Writers (ProvenanceWriter + ShardWriter) ---------------------
class ProvenanceWriter {
  constructor(outPath, gzipLevel = 6) {
    this.outPath = outPath
    this.gzipLevel = gzipLevel
    this.tmp = outPath + '.tmp'
    this.final = outPath
    this.stream = null
    this.gz = null
    this.count = 0
    ensureDir(path.dirname(this.tmp))
    const out = fs.createWriteStream(this.tmp)
    const gz = zlib.createGzip({ level: this.gzipLevel })
    gz.pipe(out)
    this.gz = gz
    this.out = out
  }

  write(rec) {
    this.gz.write(JSON.stringify(rec) + '\n')
    this.count += 1
  }

  async close() {
    await new Promise((res) => this.gz.end(res))
    await new Promise((res) => this.out.on('finish', res))
    const buf = fs.readFileSync(this.tmp)
    const stats = fs.statSync(this.tmp)
    const sha = crypto.createHash('sha256').update(buf).digest('hex')
    fs.renameSync(this.tmp, this.final)
    return { file: path.basename(this.final), count: this.count, bytes: stats.size, sha256: sha }
  }
}

class ShardWriter {
  constructor(dir, shardSize = 10000, gzipLevel = 6) {
    this.dir = dir
    this.shardSize = shardSize
    this.gzipLevel = gzipLevel
    this.maxShardBytes = null
    this.opened = new Map()
  }

  _pathsForIdx(idx) {
    const tmp = path.join(this.dir, `shard-${String(idx).padStart(4, '0')}.ndjson.gz.tmp`)
    const final = path.join(this.dir, `shard-${String(idx).padStart(4, '0')}.ndjson.gz`)
    return { tmp, final }
  }

  open(idx) {
    if (this.opened.has(idx)) return this.opened.get(idx)
    ensureDir(this.dir)
    const { tmp, final } = this._pathsForIdx(idx)
    const out = fs.createWriteStream(tmp)
    const gz = zlib.createGzip({ level: this.gzipLevel })
    gz.pipe(out)
    const state = {
      gz,
      out,
      tmp,
      final,
      count: 0,
      uncompressedBytes: 0,
      firstFoodID: null,
      lastFoodID: null,
      minFoodID: null,
      maxFoodID: null
    }
    this.opened.set(idx, state)
    return state
  }

  writeRecord(idx, rec) {
    const line = JSON.stringify(rec) + '\n'
    const lineBytes = Buffer.byteLength(line, 'utf8')
    let targetIdx = idx
    let state = this.open(targetIdx)
    if (this.maxShardBytes && state.uncompressedBytes + lineBytes > this.maxShardBytes) {
      if (state.count > 0) {
        do {
          targetIdx += 1
          state = this.open(targetIdx)
        } while (
          this.maxShardBytes &&
          state.uncompressedBytes + lineBytes > this.maxShardBytes &&
          state.count > 0
        )
      }
    }
    state.gz.write(line)
    state.count += 1
    state.uncompressedBytes += lineBytes
    const idStr = String(rec.FoodID || rec.FoodCode || '')
    if (!state.firstFoodID) state.firstFoodID = idStr
    state.lastFoodID = idStr
    const num = Number(idStr)
    if (Number.isFinite(num)) {
      if (state.minFoodID === null || num < state.minFoodID) state.minFoodID = num
      if (state.maxFoodID === null || num > state.maxFoodID) state.maxFoodID = num
    }
  }

  async closeAll() {
    const results = []
    for (const [idx, st] of this.opened.entries()) {
      await new Promise((res) => st.gz.end(res))
      await new Promise((res) => st.out.on('finish', res))
      const buf = fs.readFileSync(st.tmp)
      const stats = fs.statSync(st.tmp)
      const sha = crypto.createHash('sha256').update(buf).digest('hex')
      fs.renameSync(st.tmp, st.final)
      results.push({
        file: path.basename(st.final),
        count: st.count,
        bytes: stats.size,
        uncompressedBytes: st.uncompressedBytes,
        sha256: sha,
        firstFoodID: st.firstFoodID,
        lastFoodID: st.lastFoodID,
        minFoodID: st.minFoodID,
        maxFoodID: st.maxFoodID
      })
    }
    return results.sort((a, b) => a.file.localeCompare(b.file))
  }
}

// ---------- Small compute helper exported for tests ----------------------
function computeFctGluc(s) {
  const chocdfId =
    s.TagIndex &&
    (s.TagIndex['CHOCDF'] || (Array.isArray(s.TagIndex['CHOCDF']) && s.TagIndex['CHOCDF'][0]))
  const fibtgId =
    s.TagIndex &&
    (s.TagIndex['FIBTG'] || (Array.isArray(s.TagIndex['FIBTG']) && s.TagIndex['FIBTG'][0]))
  const chocdf = chocdfId
    ? s.NutrientsById && s.NutrientsById[chocdfId] && s.NutrientsById[chocdfId].value
    : null
  const fibtg = fibtgId
    ? s.NutrientsById && s.NutrientsById[fibtgId] && s.NutrientsById[fibtgId].value
    : null
  if (chocdf === null || fibtg === null) return null
  return (chocdf - fibtg) / 100
}

// ---------- canonical transformer --------------------------------------
function toCanonical(s) {
  // Produce a compact, predictable shape similar to `src/assets/canadian_nutrient_file.json` entries.
  const out = {
    FoodID: s.FoodID != null ? String(s.FoodID) : null,
    FoodCode: s.FoodCode || null,
    Description: s.FoodDescription || s.FoodDescriptionF || null,
    FoodGroupID: s.FoodGroupID != null ? String(s.FoodGroupID) : null,
    Measures: Array.isArray(s.Measures) ? s.Measures : [],
    FctGluc: s.Derived && s.Derived.FctGluc ? s.Derived.FctGluc.value : null,
    Nutrients: [],
    TagIndex: s.TagIndex || {},
    NutrientsByTag: s.NutrientsByTag || {}
  }
  if (s.NutrientsById && typeof s.NutrientsById === 'object') {
    for (const nid of Object.keys(s.NutrientsById)) {
      const n = s.NutrientsById[nid]
      out.Nutrients.push({
        NutrientID: nid,
        tag: n && n.tag != null ? n.tag : null,
        value: n && typeof n.value !== 'undefined' ? n.value : null,
        unit: n && n.unit != null ? n.unit : null,
        decimals: n && typeof n.decimals !== 'undefined' ? n.decimals : null,
        provenance: n && n.provenance ? n.provenance : null
      })
    }
  }
  return out
}

// ---------- Main run flow (keeps behavior of original) ------------------
async function run({
  sampleLimit = 50,
  shardSize = 10000,
  dryRun = false,
  outDir = path.join(workspaceRoot, 'scripts', 'tmp'),
  logLevel = 'info',
  exportProvenance = false,
  maxShardBytes = 1024 * 1024,
  outputFormat = 'full', // 'full' (original objects) or 'canonical' (canonical JSON shape)
  inspect = 0 // if >0, print N transformed samples and force dryRun
} = {}) {
  logger = createLogger(logLevel)
  if (typeof run.csvDir !== 'undefined') csvDir = run.csvDir
  if (typeof run.updateDir !== 'undefined') updateDir = run.updateDir
  if (inspect && Number.isFinite(Number(inspect)) && Number(inspect) > 0) {
    logger.info('Inspect mode: printing %s sample(s); forcing dryRun', inspect)
    dryRun = true
  }
  logger.info('Loading nutrient metadata...')
  const nutrientMeta = await loadNutrientName()
  if (fs.existsSync(updateDir)) await applyNutrientNameUpdates(nutrientMeta)
  logger.info('Loading food names (sample limit:', sampleLimit, ')...')
  const foodMap = await loadFoodNames(sampleLimit)
  const foodNameEvents = fs.existsSync(updateDir) ? await applyFoodNameUpdates(foodMap) : []
  const foodNameDeletedIds = new Set(
    (foodNameEvents || [])
      .filter((e) => e && e.keys && e.action && String(e.action).toUpperCase() === 'DELETE')
      .map((e) => String(e.keys.FoodID))
  )
  logger.info('Loading conversion factors...')
  const convFactors = await loadConversionFactors()
  const convEvents = fs.existsSync(updateDir) ? await applyConversionFactorUpdates(convFactors) : []

  logger.info(
    'Options: sampleLimit=%s shardSize=%s dryRun=%s outDir=%s logLevel=%s',
    sampleLimit,
    shardSize,
    dryRun,
    outDir,
    logLevel
  )

  const shardsDir = path.join(outDir, 'shards')
  const manifestPath = path.join(outDir, 'canadian_nutrient_file.manifest.json')
  const shardWriter = new ShardWriter(shardsDir, shardSize, 6)
  shardWriter.maxShardBytes = maxShardBytes
  let provenanceWriter = null
  let provenanceOutPath = path.join(outDir, 'provenance', 'provenance.ndjson.gz')
  if (exportProvenance) provenanceWriter = new ProvenanceWriter(provenanceOutPath, 6)

  let emptyWriter = null
  const emptyOutPath = path.join(outDir, 'empty', 'empty.ndjson.gz')

  const foodState = new Map()
  for (const [id, f] of foodMap) {
    foodState.set(id, {
      FoodID: f.FoodID,
      FoodCode: f.FoodCode,
      FoodDescription: f.FoodDescription,
      FoodDescriptionF: f.FoodDescriptionF,
      FoodGroupID: f.FoodGroupID,
      FoodSourceID: f.FoodSourceID,
      NutrientsById: {},
      TagIndex: {},
      NutrientsByTag: {},
      Measures: convFactors.get(id) || []
    })
  }

  const attachEvent = (evt) => {
    if (!evt || !evt.keys) return
    const fid = evt.keys.FoodID || (evt.keys && evt.keys.FoodID === 0 ? '0' : null)
    if (!fid) return
    const idStr = String(fid)
    if (!foodState.has(idStr)) {
      if (evt.action && String(evt.action).toUpperCase() === 'DELETE') {
        logger.debug(
          'attachEvent: SKIP create minimal foodState for DELETE',
          idStr,
          evt.file || null
        )
        return
      }
      const isFoodNameEvent =
        (evt.table && String(evt.table).toUpperCase() === 'FOOD NAME') ||
        (evt.file && String(evt.file).toUpperCase().includes('FOOD NAME'))
      if (foodNameDeletedIds.has(idStr) && !isFoodNameEvent) {
        logger.info('attachEvent: ORPHAN_ADD_SKIPPED', idStr, evt.file || null, evt.action || null)
        return
      }
      logger.info(
        'attachEvent: CREATE minimal foodState for',
        idStr,
        'due to',
        evt.file || null,
        evt.action || null
      )
      foodState.set(idStr, {
        FoodID: idStr,
        FoodCode: null,
        FoodDescription: null,
        FoodDescriptionF: null,
        FoodGroupID: null,
        FoodSourceID: null,
        NutrientsById: {},
        TagIndex: {},
        NutrientsByTag: {},
        Measures: convFactors.get(idStr) || [],
        provenance: { updates: [evt] }
      })
      return
    }
    const st = foodState.get(idStr)
    if (!st.provenance) st.provenance = { updates: [] }
    st.provenance.updates.push(evt)
    logger.debug(
      'attachEvent: APPEND provenance for existing FoodID',
      idStr,
      evt.file || null,
      evt.action || null
    )
    const isFoodNameEvent =
      (evt.table && String(evt.table).toUpperCase() === 'FOOD NAME') ||
      (evt.file && String(evt.file).toUpperCase().includes('FOOD NAME'))
    if (isFoodNameEvent && evt.action && String(evt.action).toUpperCase() === 'ADD') {
      logger.info(
        'attachEvent: CREATE minimal foodState for',
        idStr,
        'due to',
        evt.file || null,
        evt.action || null
      )
    }
  }

  for (const e of foodNameEvents) attachEvent(e)
  for (const e of convEvents) attachEvent(e)

  logger.info('Streaming nutrient amounts and populating structures...')
  await streamNutrientAmounts(nutrientMeta, foodMap, (foodId, nutrientId, data) => {
    const state = foodState.get(foodId)
    if (!state) return
    state.NutrientsById[nutrientId] = {
      tag: data.tag,
      value: data.value,
      unit: data.unit,
      decimals: data.decimals,
      provenance: {
        NutrientSourceID: data.NutrientSourceID,
        NutrientDateOfEntry: data.NutrientDateOfEntry
      }
    }
    if (data.tag) {
      const existing = state.TagIndex[data.tag]
      if (!existing) state.TagIndex[data.tag] = nutrientId
      else if (existing !== nutrientId) {
        if (!Array.isArray(state.TagIndex[data.tag])) state.TagIndex[data.tag] = [existing]
        if (!state.TagIndex[data.tag].includes(nutrientId))
          state.TagIndex[data.tag].push(nutrientId)
      }
      state.NutrientsByTag[data.tag] = { id: nutrientId, value: data.value, unit: data.unit }
    }
  })

  if (fs.existsSync(updateDir)) {
    logger.info('Applying nutrient amount updates from update folder...')
    await applyNutrientAmountUpdates(foodState, nutrientMeta)
  }

  logger.info('Computing derived fields (FctGluc) for sample...')
  let _inspectPrinted = 0
  for (const [id, s] of foodState) {
    const fct = computeFctGluc(s)
    s.Derived = {
      FctGluc: {
        value: fct,
        formula: '(Total Carbohydrate g per 100g - Dietary Fiber g per 100g) / 100',
        inputs: { CHOCDF: null, FIBTG: null }
      }
    }
    const numericId = Number(s.FoodID || s.FoodCode || id)
    const shardIdx = Number.isFinite(numericId) ? Math.floor((numericId - 1) / shardSize) : 0
    const hasNutrients = s.NutrientsById && Object.keys(s.NutrientsById).length > 0
    // Prepare transformed object for either writing or inspect printing
    let outObj = null
    if (outputFormat === 'canonical' || inspect > 0)
      outObj = outputFormat === 'canonical' ? toCanonical(s) : s

    // If user requested inspect mode, print up to `inspect` transformed samples and stop
    if (inspect > 0 && _inspectPrinted < inspect) {
      logger.info('Inspect sample %s/%s FoodID=%s', _inspectPrinted + 1, inspect, s.FoodID)
      console.log(JSON.stringify(outObj, null, 2))
      _inspectPrinted += 1
      if (_inspectPrinted >= inspect) break
    }

    // Normal write path: only when not in dryRun
    if (!dryRun) {
      if (!outObj) outObj = outputFormat === 'canonical' ? toCanonical(s) : s
      if (hasNutrients) shardWriter.writeRecord(shardIdx, outObj)
      else {
        if (!emptyWriter) emptyWriter = new ProvenanceWriter(emptyOutPath, 6)
        emptyWriter.write(outObj)
      }
    }
    if (
      provenanceWriter &&
      s.provenance &&
      Array.isArray(s.provenance.updates) &&
      s.provenance.updates.length
    ) {
      provenanceWriter.write({
        FoodID: safeTrimId(s.FoodID) || String(s.FoodID),
        updates: s.provenance.updates
      })
    }
  }

  ensureDir(path.dirname(manifestPath))
  const shards = dryRun ? [] : await shardWriter.closeAll()
  const totalRecords = shards.reduce((sum, s) => sum + s.count, 0)
  const totalBytes = shards.reduce((sum, s) => sum + s.bytes, 0)
  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    schema: path.relative(
      workspaceRoot,
      path.join(workspaceRoot, 'scripts', 'tmp', 'flattened_schema.json')
    ),
    shardKey: 'FoodID_range',
    shardSize,
    compression: 'gzip',
    gzipLevel: 6,
    shards,
    totalRecords,
    totalBytes
  }
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  logger.info('Wrote shards to', shardsDir)
  logger.info('Wrote manifest to', manifestPath)

  if (!dryRun && provenanceWriter) {
    logger.info('Writing provenance export to', provenanceOutPath)
    const pmeta = await provenanceWriter.close()
    manifest.provenance = {
      file: pmeta.file,
      count: pmeta.count,
      bytes: pmeta.bytes,
      sha256: pmeta.sha256,
      path: provenanceOutPath
    }
    await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    logger.info('Updated manifest with provenance entry')
  }

  if (!dryRun && emptyWriter) {
    logger.info('Writing empty-records export to', emptyOutPath)
    const emeta = await emptyWriter.close()
    manifest.emptyRecords = {
      file: emeta.file,
      count: emeta.count,
      bytes: emeta.bytes,
      sha256: emeta.sha256,
      path: emptyOutPath
    }
    await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    logger.info('Updated manifest with empty-records entry')
  }
}

function parseCli() {
  const args = process.argv.slice(2)
  const opts = {
    sampleLimit: 50,
    shardSize: 10000,
    dryRun: false,
    outDir: path.join(process.cwd(), 'scripts', 'tmp'),
    logLevel: 'info',
    maxShardBytes: 1024 * 1024,
    outputFormat: 'full',
    inspect: 0
  }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--help' || a === '-h') {
      printHelp()
      process.exit(0)
    }
    if (a === '--full' || a === '-f') opts.sampleLimit = 0
    else if (a === '--dry-run' || a === '-d') opts.dryRun = true
    else if (a === '--shard-size' || a === '-s') {
      const v = Number(args[i + 1])
      if (Number.isFinite(v) && v > 0) {
        opts.shardSize = v
        i++
      }
    } else if (!isNaN(Number(a))) opts.sampleLimit = Number(a)
    else if (a === '--out-dir' || a === '-o') {
      const v = args[i + 1]
      if (v) {
        opts.outDir = path.resolve(v)
        i++
      }
    } else if (a === '--log-level' || a === '-l') {
      const v = args[i + 1]
      if (v) {
        opts.logLevel = v
        i++
      }
    } else if (a === '--max-shard-size' || a === '-M') {
      const v = args[i + 1]
      if (v) {
        const parsed = parseSizeToBytes(v)
        if (parsed !== null) {
          opts.maxShardBytes = parsed
          i++
        }
      }
    } else if (a === '--csv-dir') {
      const v = args[i + 1]
      if (v) {
        opts.csvDir = v
        i++
      }
    } else if (a === '--update-dir') {
      const v = args[i + 1]
      if (v) {
        opts.updateDir = v
        i++
      }
    } else if (a === '--export-provenance' || a === '-e') opts.exportProvenance = true
    else if (a === '--format' || a === '-F' || a === '--output-format') {
      const v = args[i + 1]
      if (v) {
        const vv = String(v).trim().toLowerCase()
        if (vv === 'full' || vv === 'canonical') {
          opts.outputFormat = vv
          i++
        } else {
          logger && logger.warn
            ? logger.warn(
                'Unknown --format value %s, expected full|canonical. Using default: %s',
                v,
                opts.outputFormat
              )
            : console.warn('Unknown --format value', v)
          i++
        }
      }
    } else if (a === '--inspect') {
      const v = args[i + 1]
      if (v && !isNaN(Number(v)) && Number(v) > 0) {
        opts.inspect = Number(v)
        i++
      }
    }
  }
  return opts
}

module.exports = { computeFctGluc, safeTrimId, makeNutrientProvKeys }

if (require.main === module) {
  const cli = parseCli()
  if (cli.csvDir) run.csvDir = path.resolve(cli.csvDir)
  if (cli.updateDir) run.updateDir = path.resolve(cli.updateDir)
  run({
    sampleLimit: cli.sampleLimit,
    shardSize: cli.shardSize,
    dryRun: cli.dryRun,
    outDir: cli.outDir,
    logLevel: cli.logLevel,
    exportProvenance: cli.exportProvenance,
    maxShardBytes: cli.maxShardBytes,
    outputFormat: cli.outputFormat,
    inspect: cli.inspect
  }).catch((err) => {
    try {
      logger = logger || createLogger('error')
      logger.error(err && err.stack ? err.stack : err)
    } catch (_) {
      console.error(err && err.stack ? err.stack : err)
    }
    process.exit(1)
  })
}
