import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import crypto from 'crypto'
import { ensureDir } from './utils.js'

class ProvenanceWriter {
  constructor(outPath, gzipLevel = 6) {
    this.outPath = outPath
    this.gzipLevel = gzipLevel
    this.tmp = outPath + '.tmp'
    this.final = outPath
    this.stream = null
    this.gz = null
    this.count = 0
    ensureDir(path.dirname(this.tmp))
    const out = fs.createWriteStream(this.tmp)
    const gz = zlib.createGzip({ level: this.gzipLevel })
    gz.pipe(out)
    this.gz = gz
    this.out = out
  }

  write(rec) {
    this.gz.write(JSON.stringify(rec) + '\n')
    this.count += 1
  }

  async close() {
    await new Promise((res) => this.gz.end(res))
    await new Promise((res) => this.out.on('finish', res))
    const buf = fs.readFileSync(this.tmp)
    const stats = fs.statSync(this.tmp)
    const sha = crypto.createHash('sha256').update(buf).digest('hex')
    fs.renameSync(this.tmp, this.final)
    return { file: path.basename(this.final), count: this.count, bytes: stats.size, sha256: sha }
  }
}

class ShardWriter {
  constructor(dir, shardSize = 10000, gzipLevel = 6) {
    this.dir = dir
    this.shardSize = shardSize
    this.gzipLevel = gzipLevel
    this.maxShardBytes = null
    this.opened = new Map()
  }

  _pathsForIdx(idx) {
    const tmp = path.join(this.dir, `shard-${String(idx).padStart(4, '0')}.ndjson.gz.tmp`)
    const final = path.join(this.dir, `shard-${String(idx).padStart(4, '0')}.ndjson.gz`)
    return { tmp, final }
  }

  open(idx) {
    if (this.opened.has(idx)) return this.opened.get(idx)
    ensureDir(this.dir)
    const { tmp, final } = this._pathsForIdx(idx)
    const out = fs.createWriteStream(tmp)
    const gz = zlib.createGzip({ level: this.gzipLevel })
    gz.pipe(out)
    const state = {
      gz,
      out,
      tmp,
      final,
      count: 0,
      uncompressedBytes: 0,
      firstFoodID: null,
      lastFoodID: null,
      minFoodID: null,
      maxFoodID: null
    }
    this.opened.set(idx, state)
    return state
  }

  writeRecord(idx, rec) {
    const line = JSON.stringify(rec) + '\n'
    const lineBytes = Buffer.byteLength(line, 'utf8')
    let targetIdx = idx
    let state = this.open(targetIdx)
    if (this.maxShardBytes && state.uncompressedBytes + lineBytes > this.maxShardBytes) {
      if (state.count > 0) {
        do {
          targetIdx += 1
          state = this.open(targetIdx)
        } while (
          this.maxShardBytes &&
          state.uncompressedBytes + lineBytes > this.maxShardBytes &&
          state.count > 0
        )
      }
    }
    state.gz.write(line)
    state.count += 1
    state.uncompressedBytes += lineBytes
    const idStr = String(rec.FoodID || rec.FoodCode || '')
    if (!state.firstFoodID) state.firstFoodID = idStr
    state.lastFoodID = idStr
    const num = Number(idStr)
    if (Number.isFinite(num)) {
      if (state.minFoodID === null || num < state.minFoodID) state.minFoodID = num
      if (state.maxFoodID === null || num > state.maxFoodID) state.maxFoodID = num
    }
  }

  async closeAll() {
    const results = []
    for (const [, st] of this.opened.entries()) {
      await new Promise((res) => st.gz.end(res))
      await new Promise((res) => st.out.on('finish', res))
      const buf = fs.readFileSync(st.tmp)
      const stats = fs.statSync(st.tmp)
      const sha = crypto.createHash('sha256').update(buf).digest('hex')
      fs.renameSync(st.tmp, st.final)
      results.push({
        file: path.basename(st.final),
        count: st.count,
        bytes: stats.size,
        uncompressedBytes: st.uncompressedBytes,
        sha256: sha,
        firstFoodID: st.firstFoodID,
        lastFoodID: st.lastFoodID,
        minFoodID: st.minFoodID,
        maxFoodID: st.maxFoodID
      })
    }
    return results.sort((a, b) => a.file.localeCompare(b.file))
  }
}

export { ProvenanceWriter, ShardWriter }
