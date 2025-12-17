import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import crypto from 'crypto'
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

  it('ShardWriter with compression=none writes uncompressed NDJSON', async () => {
    const outDir = path.join(packageRoot, 'tmp-writers-none')
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })
    const writer = new ShardWriter(outDir, 100, 6, 'none')

    // Write test records
    for (let i = 0; i < 50; i++) {
      writer.writeRecord(0, { FoodID: i, FoodDescription: `Food ${i}` })
    }

    const shards = await writer.closeAll()

    // Verify shard metadata
    expect(shards.length).toBe(1)
    expect(shards[0].count).toBe(50)
    expect(shards[0].file.endsWith('.ndjson')).toBe(true)
    expect(shards[0].file.includes('.gz')).toBe(false)
    expect(shards[0].file.includes('.br')).toBe(false)

    // Verify file exists on disk
    const shardPath = path.join(outDir, shards[0].file)
    const stat = await fs.stat(shardPath)
    expect(stat.isFile()).toBe(true)

    // Verify content is uncompressed NDJSON
    const content = await fs.readFile(shardPath, 'utf8')
    const lines = content.trim().split('\n')
    expect(lines.length).toBe(50)

    // Verify first line is valid JSON
    const firstRecord = JSON.parse(lines[0])
    expect(firstRecord.FoodID).toBe(0)

    // Verify last line
    const lastRecord = JSON.parse(lines[49])
    expect(lastRecord.FoodID).toBe(49)

    // Verify checksum
    const buf = fsSync.readFileSync(shardPath)
    const expectedSha = crypto.createHash('sha256').update(buf).digest('hex')
    expect(shards[0].sha256).toBe(expectedSha)

    // Verify bytes equals uncompressedBytes
    expect(shards[0].bytes).toBe(shards[0].uncompressedBytes)

    // Verify no alternates
    expect(shards[0].alternates).toBeUndefined()

    // Cleanup
    await fs.rm(outDir, { recursive: true, force: true })
  })

  it('ShardWriter with compression=none respects maxShardBytes', async () => {
    const outDir = path.join(packageRoot, 'tmp-writers-none-limit')
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })
    const writer = new ShardWriter(outDir, 10000, 6, 'none')
    writer.maxShardBytes = 500 // Small limit to force splitting

    // Write records until we get multiple shards
    for (let i = 0; i < 100; i++) {
      writer.writeRecord(0, {
        FoodID: i,
        FoodDescription: `Food with a longer description ${i}`.repeat(3)
      })
    }

    const shards = await writer.closeAll()

    // Should have created multiple shards due to size limit
    expect(shards.length).toBeGreaterThan(1)

    // Verify each shard respects the size limit (or has only 1 record)
    for (const shard of shards) {
      expect(shard.bytes <= writer.maxShardBytes || shard.count === 1).toBe(true)
    }

    // Verify all files are .ndjson
    for (const shard of shards) {
      expect(shard.file.endsWith('.ndjson')).toBe(true)
    }

    // Cleanup
    await fs.rm(outDir, { recursive: true, force: true })
  })
})
