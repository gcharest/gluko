import { csvStream } from './csv.js'
import { safeTrimId, createLogger } from './utils.js'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

const logger = createLogger('info')

// Load nutrient name CSV into a Map keyed by NutrientID
export async function loadNutrientName() {
  const map = new Map()
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('NUTRIENT NAME.csv')
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
      } catch (err) {
        reject(err)
      }
    })()
  })
}

// Load food names CSV into a Map keyed by FoodID
export async function loadFoodNames(sampleLimit) {
  const map = new Map()
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('FOOD NAME.csv')
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
      } catch (err) {
        reject(err)
      }
    })()
  })
}

export async function loadConversionFactors() {
  const byFood = new Map()
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('CONVERSION FACTOR.csv')
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
      } catch (err) {
        reject(err)
      }
    })()
  })
}

export async function streamNutrientAmounts(nutrientMeta, foodMap, onNutrient) {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('NUTRIENT AMOUNT.csv')
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
      } catch (err) {
        reject(err)
      }
    })()
  })
}

// Synchronous helpers for reading JSON/NDJSON shards and compressed files.
// These are intentionally synchronous to be simple to use in small QA scripts
// and command-line tools where streaming async is unnecessary.
export function loadFileSync(p, debug = false) {
  const lower = String(p).toLowerCase()
  if (lower.endsWith('.gz')) {
    const buf = fs.readFileSync(p)
    const un = zlib.gunzipSync(buf).toString('utf8')
    const t = un.trim()
    if (t.startsWith('[')) {
      try {
        return JSON.parse(t)
      } catch (e) {
        if (debug) logger.warn('Failed to parse gz JSON array', p, e && e.message)
      }
    }
    // NDJSON
    const out = []
    for (const l of t.split('\n')) {
      if (!l || !l.trim()) continue
      try {
        out.push(JSON.parse(l))
      } catch {
        if (debug) logger.warn('Skipping invalid JSON line in', p)
      }
    }
    return out
  }
  if (lower.endsWith('.br')) {
    const buf = fs.readFileSync(p)
    const un = zlib.brotliDecompressSync(buf).toString('utf8')
    const t = un.trim()
    if (t.startsWith('[')) {
      try {
        return JSON.parse(t)
      } catch (e) {
        if (debug) logger.warn('Failed to parse br JSON array', p, e && e.message)
      }
    }
    const out = []
    for (const l of t.split('\n')) {
      if (!l || !l.trim()) continue
      try {
        out.push(JSON.parse(l))
      } catch {
        if (debug) logger.warn('Skipping invalid JSON line in', p)
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
      if (debug) logger.warn('Skipping invalid JSON line in', p)
    }
  }
  return out
}

export function loadShardsDirSync(dir, debug = false) {
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
    } catch {
      if (debug) logger.warn('Skipping file', fp)
    }
  }
  return all
}

export function loadSamplePathSync(samplePath, debug = false) {
  if (!fs.existsSync(samplePath)) throw new Error('Sample path not found: ' + samplePath)
  const st = fs.statSync(samplePath)
  if (st.isDirectory()) {
    // treat as shards dir
    return loadShardsDirSync(samplePath, debug)
  }
  return loadFileSync(samplePath, debug)
}


function createDecompressedStream(p) {
  const lower = String(p).toLowerCase()
  let rs = fs.createReadStream(p)
  if (lower.endsWith('.gz')) {
    const gz = zlib.createGunzip()
    rs = rs.pipe(gz)
  } else if (lower.endsWith('.br')) {
    const br = zlib.createBrotliDecompress()
    rs = rs.pipe(br)
  }
  return rs
}

// Async generator that yields parsed objects from NDJSON or JSON array files.
// It focuses on object elements (the canonical shards are arrays of objects or NDJSON lines).
export async function* streamFileAsync(p, debug = false) {
  if (!fs.existsSync(p)) throw new Error('File not found: ' + p)

  const rs = createDecompressedStream(p)
  let buffer = ''
  let arrayMode = null // null = unknown, false = ndjson, true = json array

  // helper to attempt parse lines as NDJSON
  function tryParseLine(line) {
    const t = line.trim()
    if (!t) return { ok: false }
    try {
      return { ok: true, value: JSON.parse(t) }
    } catch (e) {
      return { ok: false }
    }
  }

  // state for brace-scanning when in arrayMode
  let objStart = -1
  let depth = 0
  let inString = false
  let escape = false

  for await (const chunk of rs) {
    buffer += chunk.toString('utf8')

    // decide mode if unknown
    if (arrayMode === null) {
      const firstNonWs = buffer.search(/\S/)
      if (firstNonWs !== -1) {
        const ch = buffer[firstNonWs]
        if (ch === '[') arrayMode = true
        else arrayMode = false
      } else {
        // need more data
        continue
      }
    }

    if (arrayMode === false) {
      // NDJSON: process complete lines
      const parts = buffer.split(/\r?\n/)
      buffer = parts.pop() || ''
      for (const line of parts) {
        const res = tryParseLine(line)
        if (res.ok) yield res.value
        else if (debug) logger.warn('Skipping invalid NDJSON line in', p)
      }
    } else {
      // JSON array mode: scan for complete objects using depth tracking
      let i = 0
      while (i < buffer.length) {
        const ch = buffer[i]
        if (objStart === -1) {
          // look for opening brace
          if (ch === '{') {
            objStart = i
            depth = 1
            inString = false
            escape = false
          }
          i++
          continue
        }

        // inside object
        if (inString) {
          if (escape) {
            escape = false
          } else if (ch === '\\') {
            escape = true
          } else if (ch === '"') {
            inString = false
          }
        } else {
          if (ch === '"') inString = true
          else if (ch === '{') depth++
          else if (ch === '}') depth--
        }

        if (objStart !== -1 && depth === 0) {
          const objText = buffer.slice(objStart, i + 1)
          try {
            const parsed = JSON.parse(objText)
            yield parsed
          } catch (e) {
            if (debug) logger.warn('Failed to parse object in array from', p, e && e.message)
          }
          // remove consumed portion from buffer
          buffer = buffer.slice(i + 1)
          i = 0
          objStart = -1
          continue
        }
        i++
      }
      // keep scanning with more data
      // prevent buffer growing unboundedly: if it's too large and no object start found, trim
      if (buffer.length > 1_000_000 && objStart === -1) {
        // nothing found, trim to last 1MB
        buffer = buffer.slice(-1_000_000)
      }
    }
  }

  // end of stream: flush remaining buffer
  if (arrayMode === false) {
    if (buffer && buffer.trim()) {
      try {
        yield JSON.parse(buffer)
      } catch (e) {
        if (debug) logger.warn('Skipping invalid trailing NDJSON buffer in', p)
      }
    }
  } else if (arrayMode === true) {
    // try to extract any remaining complete objects
    if (objStart !== -1 && depth === 0) {
      try {
        const parsed = JSON.parse(buffer.slice(objStart))
        yield parsed
      } catch (e) {
        if (debug) logger.warn('Skipping leftover parse failure in', p)
      }
    }
  }
}

export async function* streamShardsDirAsync(dir, debug = false) {
  if (!fs.existsSync(dir)) throw new Error('Shards dir not found: ' + dir)
  const files = fs.readdirSync(dir).sort()
  for (const f of files) {
    const fp = path.join(dir, f)
    const st = fs.statSync(fp)
    if (!st.isFile()) continue
    try {
      for await (const rec of streamFileAsync(fp, debug)) yield rec
    } catch (e) {
      if (debug) logger.warn('Skipping file in streamShardsDirAsync', fp)
    }
  }
}
