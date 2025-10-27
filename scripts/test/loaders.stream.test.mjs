/* eslint-env node */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import zlib from 'zlib'
import { Buffer } from 'buffer'

import { streamFileAsync, streamShardsDirAsync } from '../lib/loaders.js'

describe('streaming loaders (large data)', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stream-loaders-test-'))
  })

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore
    }
  })

  async function writeLargeNdjsonFile(p, n) {
    const w = fs.createWriteStream(p)
    for (let i = 0; i < n; i++) {
      w.write(JSON.stringify({ FoodID: String(i), val: i % 100 }) + '\n')
    }
    await new Promise((res) => w.end(res))
  }

  it('streams a large NDJSON file without loading whole file', async () => {
    const n = 10000
    const p = path.join(tmpDir, 'large.ndjson')
    await writeLargeNdjsonFile(p, n)

    const before = globalThis.process?.memoryUsage?.().heapUsed ?? 0
    let count = 0
    let last = null
    for await (const rec of streamFileAsync(p, true)) {
      count++
      last = rec
      // keep only tally and last to avoid storing all
    }
    const after = globalThis.process?.memoryUsage?.().heapUsed ?? 0
    expect(count).toBe(n)
    expect(String(last.FoodID)).toBe(String(n - 1))
    // Ensure memory didn't spike excessively (allow generous headroom)
    expect(after - before).toBeLessThan(100 * 1024 * 1024) // <100MB
  })

  it('streams gz and br compressed large NDJSON', async () => {
    const n = 8000
    const nd =
      Array.from({ length: n }, (_, i) => JSON.stringify({ FoodID: String(i), v: i })).join('\n') +
      '\n'
    const gzPath = path.join(tmpDir, 'large.ndjson.gz')
    fs.writeFileSync(gzPath, zlib.gzipSync(Buffer.from(nd)))
    const brPath = path.join(tmpDir, 'large.ndjson.br')
    fs.writeFileSync(brPath, zlib.brotliCompressSync(Buffer.from(nd)))

    for (const p of [gzPath, brPath]) {
      const before = globalThis.process?.memoryUsage?.().heapUsed ?? 0
      let count = 0
      for await (const _rec of streamFileAsync(p, true)) {
        count++
        void _rec
      }
      const after = globalThis.process?.memoryUsage?.().heapUsed ?? 0
      expect(count).toBe(n)
      expect(after - before).toBeLessThan(100 * 1024 * 1024)
    }
  })

  it('streams many small shards in a directory', async () => {
    const shards = 100
    const perShard = 200
    let expected = 0
    for (let s = 0; s < shards; s++) {
      const rows = []
      for (let i = 0; i < perShard; i++) {
        const id = s * perShard + i
        rows.push(JSON.stringify({ FoodID: String(id), shard: s }))
      }
      const p = path.join(tmpDir, `shard-${String(s).padStart(4, '0')}.ndjson`)
      fs.writeFileSync(p, rows.join('\n') + '\n', 'utf8')
      expected += perShard
    }

    let count = 0
    for await (const _rec of streamShardsDirAsync(tmpDir, true)) {
      count++
      void _rec
    }
    expect(count).toBe(expected)
  })
})
