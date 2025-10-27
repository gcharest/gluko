import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ShardWriter } from '../lib/writers.js'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(testDir, '..')

describe('Writers Brotli', () => {
  it('ShardWriter produces .br alongside .gz and manifest alternates', async () => {
    const outDir = path.join(packageRoot, 'tmp-writers-br')
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })
    const sw = new ShardWriter(outDir, 1, 1)
    // write two records; shardSize=1 -> likely multiple shards
    sw.writeRecord(0, { FoodID: '100', FoodCode: 'A', foo: 1 })
    sw.writeRecord(0, { FoodID: '200', FoodCode: 'B', foo: 2 })
    const results = await sw.closeAll()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThanOrEqual(1)
    for (const r of results) {
      // gzip primary
      expect(r).toHaveProperty('file')
      expect(r).toHaveProperty('bytes')
      expect(r.bytes).toBeGreaterThan(0)
      // alternates should include brotli
      expect(r).toHaveProperty('alternates')
      const alt = Array.isArray(r.alternates)
        ? r.alternates.find((a) => a.compression === 'br')
        : null
      expect(alt).not.toBeNull()
      expect(alt).toHaveProperty('file')
      expect(alt).toHaveProperty('bytes')
      // files exist on disk
      const gzPath = path.join(outDir, r.file)
      const brPath = path.join(outDir, alt.file)
      const stGz = await fs.stat(gzPath)
      const stBr = await fs.stat(brPath)
      expect(stGz.isFile()).toBe(true)
      expect(stBr.isFile()).toBe(true)
      // brotli should generally be smaller or equal for our test payload
      expect(stBr.size).toBeLessThanOrEqual(stGz.size)
    }
    await fs.rm(outDir, { recursive: true, force: true })
  })
})
