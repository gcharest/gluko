import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { run } from '../lib/run.js'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(testDir, '..')

describe('run generates shards (integration)', () => {
  it('run() with dryRun=false writes shards and manifest entries', async () => {
    const outDir = path.join(packageRoot, 'tmp-run-generate')
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })

    // run in non-dry mode to produce shards on disk
    await run({ sampleLimit: 50, dryRun: false, outDir, logLevel: 'error' })

    const manifestPath = path.join(outDir, 'canadian_nutrient_file.manifest.json')
    const stat = await fs.stat(manifestPath)
    expect(stat.isFile()).toBe(true)
    const txt = await fs.readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(txt)
    expect(manifest).toHaveProperty('shards')
    expect(Array.isArray(manifest.shards)).toBe(true)
    // when not in dryRun we expect at least one shard (given the sample fixtures)
    expect(manifest.shards.length).toBeGreaterThan(0)

    // ensure shard files actually exist on disk
    const shardsDir = path.join(outDir, 'shards')
    for (const s of manifest.shards) {
      const shardPath = path.join(shardsDir, s.file)
      const st = await fs.stat(shardPath)
      expect(st.isFile()).toBe(true)
      expect(s.count).toBeGreaterThanOrEqual(0)
    }

    // cleanup
    await fs.rm(outDir, { recursive: true, force: true })
  })
})
