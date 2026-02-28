import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { fileURLToPath } from 'url'
import iconv from 'iconv-lite'
import chardet from 'chardet'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

let _csvDir = null
let _updateDir = null

const repoCsvDefault = path.join(repoRoot, 'nutrient_file_raw', 'cnf-fcen-csv')
const repoUpdateDefault = path.join(repoRoot, 'nutrient_file_raw', 'cnf-fcen-csv-update-miseajour')
if (fs.existsSync(repoCsvDefault)) _csvDir = repoCsvDefault
if (fs.existsSync(repoUpdateDefault)) _updateDir = repoUpdateDefault

export let csvDir = _csvDir
export let updateDir = _updateDir

export function setCsvDir(d) {
  csvDir = d
}

export function setUpdateDir(d) {
  updateDir = d
}

export async function csvStream(fileName) {
  const { parse } = await import('csv-parse')
  if (!csvDir) return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
  try {
    const p = path.join(csvDir, fileName)
    if (fs.existsSync(p)) {
      // Choose encoding: honor CSV_ENCODING, else try chardet, else default
      let encoding = process.env.CSV_ENCODING || null
      try {
        const detected = chardet.detectFileSync(p)
        if (detected) encoding = String(detected)
      } catch {
        // detection failed; we'll fall back below
      }

      if (!encoding) encoding = 'windows-1252'

      const encLower = String(encoding).toLowerCase()
      let iconvName = 'utf8'
      if (encLower.includes('utf-8')) iconvName = 'utf8'
      else if (encLower.includes('windows') || encLower.includes('1252')) iconvName = 'windows1252'
      else if (encLower.includes('iso-8859') || encLower.includes('latin1')) iconvName = 'latin1'

      // Probe first bytes: if UTF-8 decoding contains replacement chars, prefer windows-1252
      try {
        if (iconvName === 'utf8') {
          const fd = fs.openSync(p, 'r')
          try {
            const probe = Buffer.allocUnsafe(8192)
            const bytes = fs.readSync(fd, probe, 0, 8192, 0)
            const sample = probe.slice(0, bytes).toString('utf8')
            if (sample.includes('\uFFFD')) {
              iconvName = 'windows1252'
            }
          } finally {
            fs.closeSync(fd)
          }
        }
      } catch {
        // ignore probe errors and continue with chosen iconvName
      }

      const rs = fs.createReadStream(p)
      if (iconvName !== 'utf8') {
        return rs
          .pipe(iconv.decodeStream(iconvName))
          .pipe(parse({ columns: true, skip_empty_lines: true }))
      }
      return rs.pipe(parse({ columns: true, skip_empty_lines: true }))
    }
  } catch {
    void 0
  }
  return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
}

export async function updateCsvStream(fileName) {
  const { parse } = await import('csv-parse')
  if (!updateDir) return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
  try {
    const p = path.join(updateDir, fileName)
    if (fs.existsSync(p)) {
      // Use same decoding logic as csvStream so update files with legacy encodings are handled
      // determine encoding similarly
      let encoding = process.env.CSV_ENCODING || null
      try {
        const detected = chardet.detectFileSync(p)
        if (detected) encoding = String(detected)
      } catch {
        // fall through
      }
      if (!encoding) encoding = 'windows-1252'
      const encLower = String(encoding).toLowerCase()
      let iconvName = 'utf8'
      if (encLower.includes('utf-8')) iconvName = 'utf8'
      else if (encLower.includes('windows') || encLower.includes('1252')) iconvName = 'windows1252'
      else if (encLower.includes('iso-8859') || encLower.includes('latin1')) iconvName = 'latin1'

      const rs = fs.createReadStream(p)
      if (iconvName !== 'utf8')
        return rs
          .pipe(iconv.decodeStream(iconvName))
          .pipe(parse({ columns: true, skip_empty_lines: true }))
      return rs.pipe(parse({ columns: true, skip_empty_lines: true }))
    }
  } catch {
    void 0
  }
  return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
}

export function existsInUpdateDir(fileName) {
  if (!updateDir) return false
  try {
    return fs.existsSync(path.join(updateDir, fileName))
  } catch {
    return false
  }
}
