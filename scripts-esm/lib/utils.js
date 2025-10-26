import fs from 'fs'

export function createLogger(level = 'info') {
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

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

export function mergeNonEmpty(target, src) {
  for (const k of Object.keys(src)) {
    const v = src[k]
    if (v !== '' && typeof v !== 'undefined') target[k] = v
  }
}

export function safeTrimId(v) {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

export function normalizeProvKeys(keys) {
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

export function makeProvEvent(file, action, table, keys) {
  return {
    file,
    action,
    table,
    keys: normalizeProvKeys(keys),
    timestamp: new Date().toISOString()
  }
}

export function makeNutrientProvKeys(foodId, nutrientIdRaw) {
  const keys = { FoodID: String(foodId) }
  const n = safeTrimId(nutrientIdRaw)
  if (n) keys.NutrientID = n
  return normalizeProvKeys(keys)
}

// Parse user-friendly size strings into bytes
export function parseSizeToBytes(s) {
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
