import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { setCsvDir, setUpdateDir } from '../lib/csv.js'

// Resolve fixture locations relative to this package so tests are robust
// whether run from the repo root or from inside the `scripts-esm` package.
const pkgDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(pkgDir, '..') // points to /workspaces/gluko/scripts-esm

const testFixturesCsv = path.resolve(packageRoot, 'test', 'nutrient_file_raw', 'cnf-fcen-csv')
const testFixturesUpdate = path.resolve(
  packageRoot,
  'test',
  'nutrient_file_raw',
  'cnf-fcen-csv-update-miseajour'
)

const localCsv = path.resolve(packageRoot, 'nutrient_file_raw', 'cnf-fcen-csv')
const localUpdate = path.resolve(packageRoot, 'nutrient_file_raw', 'cnf-fcen-csv-update-miseajour')

// Fallbacks in case tests are invoked from repo root with a different layout.
const repoRoot = path.resolve(packageRoot, '..')
const repoCsv = path.resolve(repoRoot, 'nutrient_file_raw', 'cnf-fcen-csv')
const repoUpdate = path.resolve(repoRoot, 'nutrient_file_raw', 'cnf-fcen-csv-update-miseajour')

// Prefer a fixtures directory that actually contains the essential CSVs
// (NUTRIENT AMOUNT, FOOD NAME, NUTRIENT NAME). The package-local test
// fixtures may be incomplete; prefer the repo-level fixtures when test
// fixtures don't contain required files.
const requiredFiles = ['NUTRIENT AMOUNT.csv', 'FOOD NAME.csv', 'NUTRIENT NAME.csv']
function hasRequiredFiles(dir) {
  try {
    if (!fs.existsSync(dir)) return false
    const names = fs.readdirSync(dir)
    return requiredFiles.every((f) => names.includes(f))
  } catch {
    return false
  }
}

let csvDir
// If package-local test fixtures directory exists, prefer it. If it is
// missing some required CSVs, try to copy those missing files from the
// repository-level fixtures so package tests remain consistent and
// deterministic.
if (fs.existsSync(testFixturesCsv)) {
  try {
    const existing = fs.readdirSync(testFixturesCsv)
    for (const f of requiredFiles) {
      if (!existing.includes(f)) {
        const src = path.resolve(repoCsv, f)
        const dest = path.resolve(testFixturesCsv, f)
        try {
          if (fs.existsSync(src) && !fs.existsSync(dest)) fs.copyFileSync(src, dest)
        } catch {
          // ignore copy errors and continue
        }
      }
    }
    // use the test fixtures directory after attempting to fill missing files
    csvDir = testFixturesCsv
  } catch {
    // fallback logic below
  }
}
if (!csvDir) {
  if (hasRequiredFiles(localCsv)) csvDir = localCsv
  else csvDir = repoCsv
}
// updateDir may be less critical; prefer test fixtures if present, else fall
// back to local or repo-level updates.
const updateDir = fs.existsSync(testFixturesUpdate)
  ? testFixturesUpdate
  : fs.existsSync(localUpdate)
    ? localUpdate
    : repoUpdate

// Ensure we always pass absolute, resolved paths into the CSV helpers.
setCsvDir(path.resolve(csvDir))
setUpdateDir(path.resolve(updateDir))

// Ensure the update directory exists so tests that write change/add CSV files
// into it won't fail with ENOENT when running under the test harness.
fs.mkdirSync(updateDir, { recursive: true })

// If the package-local fixtures exist but the chosen updateDir is the repo
// fallback (rare), copy package-local update CSVs into the chosen updateDir
// so tests have the complete set of baseline update files.
if (fs.existsSync(localUpdate) && path.resolve(updateDir) !== path.resolve(localUpdate)) {
  for (const f of fs.readdirSync(localUpdate)) {
    const src = path.resolve(localUpdate, f)
    const dest = path.resolve(updateDir, f)
    try {
      if (!fs.existsSync(dest)) fs.copyFileSync(src, dest)
    } catch {
      // ignore copy errors
    }
  }
}
