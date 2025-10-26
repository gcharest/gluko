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

// Prefer test-local fixtures if present, then package-level fixtures,
// finally fall back to repo-level layout. This keeps tests flexible.
const csvDir = fs.existsSync(testFixturesCsv)
  ? testFixturesCsv
  : fs.existsSync(localCsv)
    ? localCsv
    : repoCsv
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
