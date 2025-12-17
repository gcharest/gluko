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
  constructor(dir, shardSize = 10000, gzipLevel = 6, compression = 'br') {
    this.dir = dir
    this.shardSize = shardSize
    this.gzipLevel = gzipLevel
    this.compression = compression  // 'none', 'gzip', or 'br'
    this.maxShardBytes = null
    this.opened = new Map()
  }

  _pathsForIdx(idx) {
    const base = `shard-${String(idx).padStart(4, '0')}.ndjson`

    if (this.compression === 'none') {
      const tmp = path.join(this.dir, `${base}.tmp`)
      const final = path.join(this.dir, base)
      return { tmp, final }
    }

    const tmpGz = path.join(this.dir, `${base}.gz.tmp`)
    const finalGz = path.join(this.dir, `${base}.gz`)
    const tmpBr = path.join(this.dir, `${base}.br.tmp`)
    const finalBr = path.join(this.dir, `${base}.br`)
    return { tmpGz, finalGz, tmpBr, finalBr }
  }

  open(idx) {
    if (this.opened.has(idx)) return this.opened.get(idx)
    ensureDir(this.dir)

    if (this.compression === 'none') {
      // Uncompressed output
      const { tmp, final } = this._pathsForIdx(idx)
      const out = fs.createWriteStream(tmp)
      const state = {
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

    // Compressed output (gzip + brotli)
    const { tmpGz, finalGz, tmpBr, finalBr } = this._pathsForIdx(idx)
    const outGz = fs.createWriteStream(tmpGz)
    const gz = zlib.createGzip({ level: this.gzipLevel })
    gz.pipe(outGz)
    // Brotli with a reasonable default; can be tuned later
    const outBr = fs.createWriteStream(tmpBr)
    const br = zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
    br.pipe(outBr)
    const state = {
      gz,
      outGz,
      tmpGz,
      finalGz,
      br,
      outBr,
      tmpBr,
      finalBr,
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

    if (this.compression === 'none') {
      state.out.write(line)
    } else {
      state.gz.write(line)
      // write to brotli stream as well
      try {
        if (state.br) state.br.write(line)
      } catch {
        // best-effort: if brotli write fails, continue with gzip
      }
    }

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
      if (this.compression === 'none') {
        // Close uncompressed stream
        await new Promise((res) => st.out.end(res))

        // Calculate checksum on uncompressed data
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
          // No alternates for uncompressed
        })
      } else {
        // finish gzip stream
        await new Promise((res) => st.gz.end(res))
        await new Promise((res) => st.outGz.on('finish', res))
        // finish brotli stream
        await new Promise((res) => st.br.end(res))
        await new Promise((res) => st.outBr.on('finish', res))

        // compute gzip metadata
        const bufGz = fs.readFileSync(st.tmpGz)
        const statsGz = fs.statSync(st.tmpGz)
        const shaGz = crypto.createHash('sha256').update(bufGz).digest('hex')
        fs.renameSync(st.tmpGz, st.finalGz)

        // compute brotli metadata
        const bufBr = fs.readFileSync(st.tmpBr)
        const statsBr = fs.statSync(st.tmpBr)
        const shaBr = crypto.createHash('sha256').update(bufBr).digest('hex')
        fs.renameSync(st.tmpBr, st.finalBr)

        results.push({
          file: path.basename(st.finalGz),
          count: st.count,
          bytes: statsGz.size,
          uncompressedBytes: st.uncompressedBytes,
          sha256: shaGz,
          firstFoodID: st.firstFoodID,
          lastFoodID: st.lastFoodID,
          minFoodID: st.minFoodID,
          maxFoodID: st.maxFoodID,
          // provide alternates (e.g., brotli) for consumers that want the preferred artifact
          alternates: [
            {
              file: path.basename(st.finalBr),
              bytes: statsBr.size,
              sha256: shaBr,
              compression: 'br'
            }
          ]
        })
      }
    }
    return results.sort((a, b) => a.file.localeCompare(b.file))
  }
}

export { ProvenanceWriter, ShardWriter }
