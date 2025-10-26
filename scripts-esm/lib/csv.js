import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

// The CSV helpers expect the caller (usually the top-level runner) to set
// the `csvDir` and `updateDir`. Do not probe the filesystem for fallback
// locations here — require explicit configuration from callers. Export
// setters that callers can use to configure locations.
export let csvDir = null
export let updateDir = null

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
    if (fs.existsSync(p))
      return fs.createReadStream(p).pipe(parse({ columns: true, skip_empty_lines: true }))
  } catch {
    // fall through to empty stream
  }
  return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
}

export async function updateCsvStream(fileName) {
  const { parse } = await import('csv-parse')
  if (!updateDir) return Readable.from([]).pipe(parse({ columns: true, skip_empty_lines: true }))
  try {
    const p = path.join(updateDir, fileName)
    if (fs.existsSync(p))
      return fs.createReadStream(p).pipe(parse({ columns: true, skip_empty_lines: true }))
  } catch {
    // fall through
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
