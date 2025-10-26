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
 */

import path from 'path'
import { fileURLToPath } from 'url'
// CSV directory configuration is applied directly to the run helper when needed
import { run as libRun } from './lib/run.js'

// Re-export library symbols for backwards compatibility with tests or callers
export { computeFctGluc } from './lib/compute.js'
export {
  safeTrimId,
  makeNutrientProvKeys,
  normalizeProvKeys,
  mergeNonEmpty,
  makeProvEvent,
  parseSizeToBytes,
  createLogger,
  ensureDir
} from './lib/utils.js'
export {
  loadNutrientName,
  loadFoodNames,
  loadConversionFactors,
  streamNutrientAmounts
} from './lib/loaders.js'
export {
  applyNutrientNameUpdates,
  applyNutrientAmountUpdates,
  applyConversionFactorUpdates,
  applyFoodNameUpdates
} from './lib/appliers.js'
export { ProvenanceWriter, ShardWriter } from './lib/writers.js'
export { run as run } from './lib/run.js'

// Minimal CLI help and parsing kept here so the binary remains usable.
const __filename = fileURLToPath(import.meta.url)
function printHelp() {
  console.log('\nUsage: node scripts-esm/cnf-fcen-etl.js [options] [sampleLimit]\n')
  console.log('Options:')
  console.log('  --help, -h               Show this help and exit')
  console.log('  --full, -f               Process full dataset (sampleLimit=0)')
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
}

function parseCli() {
  const args = process.argv.slice(2)
  const opts = {
    sampleLimit: 50,
    shardSize: 10000,
    dryRun: false,
    outDir: path.join(process.cwd(), 'tmp'),
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
        const parsed = Number(v)
        if (!Number.isNaN(parsed)) {
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
          console.warn('Unknown --format value', v)
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

if (process.argv[1] === __filename) {
  const cli = parseCli()
  if (cli.csvDir) libRun.csvDir = path.resolve(cli.csvDir)
  if (cli.updateDir) libRun.updateDir = path.resolve(cli.updateDir)
  libRun({
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
    // Keep CLI error handling simple and avoid importing logger helpers here.
    try {
      console.error(err && err.stack ? err.stack : err)
    } catch {
      const __err = err && err.stack ? err.stack : err
      console.error(__err)
    }
    process.exit(1)
  })
}
