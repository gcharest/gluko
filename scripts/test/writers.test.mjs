import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ProvenanceWriter, ShardWriter } from '../lib/writers.js'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(testDir, '..')

describe('Writers', () => {
  it('ProvenanceWriter writes gzipped ndjson and returns metadata', async () => {
    const outDir = path.join(packageRoot, 'tmp-writers-prov')
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })
    const outfile = path.join(outDir, 'prov.ndjson.gz')
    const pw = new ProvenanceWriter(outfile, 1)
    pw.write({ file: 'X', action: 'ADD', table: 'FOOD NAME', keys: { FoodID: '1' } })
    const meta = await pw.close()
    expect(meta).toHaveProperty('count', 1)
    expect(meta).toHaveProperty('bytes')
    expect(meta.bytes).toBeGreaterThan(0)
    expect(meta).toHaveProperty('sha256')
    expect(typeof meta.sha256).toBe('string')
    expect(meta.sha256.length).toBeGreaterThanOrEqual(64)
    // file exists
    const stat = await fs.stat(path.join(outDir, meta.file))
    expect(stat.isFile()).toBe(true)
    // cleanup
    await fs.rm(outDir, { recursive: true, force: true })
  })

  it('ShardWriter shards and returns metadata', async () => {
    const outDir = path.join(packageRoot, 'tmp-writers-shard')
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })
    const sw = new ShardWriter(outDir, 1, 1)
    // write two records; shardSize=1 -> expect two records possibly split among indices
    sw.writeRecord(0, { FoodID: '100', FoodCode: 'A', foo: 1 })
    sw.writeRecord(0, { FoodID: '200', FoodCode: 'B', foo: 2 })
    const results = await sw.closeAll()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThanOrEqual(1)
    for (const r of results) {
      expect(r).toHaveProperty('file')
      expect(r).toHaveProperty('count')
      expect(r.count).toBeGreaterThanOrEqual(1)
      expect(r).toHaveProperty('bytes')
      expect(r.bytes).toBeGreaterThan(0)
      expect(r).toHaveProperty('sha256')
      expect(typeof r.sha256).toBe('string')
    }
    // ensure files exist
    for (const r of results) {
      const p = path.join(outDir, r.file)
      const st = await fs.stat(p)
      expect(st.isFile()).toBe(true)
    }
    await fs.rm(outDir, { recursive: true, force: true })
  })
})
