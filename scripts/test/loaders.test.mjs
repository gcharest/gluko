import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import zlib from 'zlib'
import { Buffer } from 'buffer'

import { loadFileSync, loadShardsDirSync, loadSamplePathSync } from '../lib/loaders.js'

describe('loaders sync helpers', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loaders-test-'))
  })

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore
    }
  })

  it('reads JSON array file', () => {
    const arr = [
      { FoodID: '1', FctGluc: 0.1 },
      { FoodID: '2', FctGluc: 0.2 }
    ]
    const p = path.join(tmpDir, 'data.json')
    fs.writeFileSync(p, JSON.stringify(arr), 'utf8')
    const out = loadFileSync(p, true)
    expect(out).toEqual(arr)
  })

  it('reads NDJSON, gz and br files equivalently', () => {
    const arr = [
      { FoodID: '3', FctGluc: 0.3 },
      { FoodID: '4', FctGluc: 0.4 }
    ]
    const nd = arr.map((x) => JSON.stringify(x)).join('\n') + '\n'

    // NDJSON plain
    const ndPath = path.join(tmpDir, 'shard-0000.ndjson')
    fs.writeFileSync(ndPath, nd, 'utf8')
    const fromNd = loadFileSync(ndPath, true)
    expect(fromNd).toEqual(arr)

    // gzip
    const gzPath = path.join(tmpDir, 'shard-0001.ndjson.gz')
    const gzBuf = zlib.gzipSync(Buffer.from(nd, 'utf8'))
    fs.writeFileSync(gzPath, gzBuf)
    const fromGz = loadFileSync(gzPath, true)
    expect(fromGz).toEqual(arr)

    // brotli
    const brPath = path.join(tmpDir, 'shard-0002.ndjson.br')
    const brBuf = zlib.brotliCompressSync(Buffer.from(nd, 'utf8'))
    fs.writeFileSync(brPath, brBuf)
    const fromBr = loadFileSync(brPath, true)
    expect(fromBr).toEqual(arr)
  })

  it('loadShardsDirSync aggregates files in a directory', () => {
    const a = [{ FoodID: '10', FctGluc: 1 }]
    const b = [{ FoodID: '11', FctGluc: 2 }]
    const p1 = path.join(tmpDir, 'shard-0000.ndjson')
    const p2 = path.join(tmpDir, 'shard-0001.ndjson')
    fs.writeFileSync(p1, a.map((x) => JSON.stringify(x)).join('\n') + '\n', 'utf8')
    fs.writeFileSync(p2, b.map((x) => JSON.stringify(x)).join('\n') + '\n', 'utf8')

    const all = loadShardsDirSync(tmpDir, true)
    // should contain both records
    const ids = all.map((r) => String(r.FoodID))
    expect(ids).toEqual(['10', '11'])
  })

  it('loadSamplePathSync works with directory and file', () => {
    const arr = [{ FoodID: '20', FctGluc: 2 }]
    const p = path.join(tmpDir, 'shard-0000.ndjson')
    fs.writeFileSync(p, arr.map((x) => JSON.stringify(x)).join('\n') + '\n', 'utf8')

    // passing dir
    const fromDir = loadSamplePathSync(tmpDir, true)
    expect(fromDir).toEqual(arr)

    // passing file
    const jsonPath = path.join(tmpDir, 'data.json')
    fs.writeFileSync(jsonPath, JSON.stringify(arr), 'utf8')
    const fromFile = loadSamplePathSync(jsonPath, true)
    expect(fromFile).toEqual(arr)
  })
})
