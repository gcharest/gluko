import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { run } from '../lib/run.js'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(testDir, '..')

describe('run dry-run integration', () => {
  it('run() in dryRun mode writes manifest and does not produce shards', async () => {
    const outDir = path.join(packageRoot, 'tmp-run-dry')
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })

    // run in dryRun to avoid writing shard files
    await run({ sampleLimit: 50, dryRun: true, outDir, logLevel: 'error' })

    const manifestPath = path.join(outDir, 'canadian_nutrient_file.manifest.json')
    const stat = await fs.stat(manifestPath)
    expect(stat.isFile()).toBe(true)
    const txt = await fs.readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(txt)
    expect(manifest).toHaveProperty('shards')
    expect(Array.isArray(manifest.shards)).toBe(true)
    // dryRun should have zero shards
    expect(manifest.shards.length).toBe(0)

    // cleanup
    await fs.rm(outDir, { recursive: true, force: true })
  })
})
