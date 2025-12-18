import fs from 'fs'
import path from 'path'
import * as formatters from './formatters.js'
import { createLogger, ensureDir, safeTrimId } from './utils.js'
import { setCsvDir, setUpdateDir, updateDir as exportedUpdateDir } from './csv.js'
import {
  loadNutrientName,
  loadFoodNames,
  loadConversionFactors,
  streamNutrientAmounts
} from './loaders.js'
import {
  applyNutrientNameUpdates,
  applyFoodNameUpdates,
  applyConversionFactorUpdates,
  applyNutrientAmountUpdates
} from './appliers.js'
import { ProvenanceWriter, ShardWriter } from './writers.js'
import { computeFctGluc } from './compute.js'

const workspaceRoot = process.cwd()

export async function run({
  sampleLimit = 50,
  shardSize = 10000,
  dryRun = false,
  outDir = path.join(workspaceRoot, 'scripts', 'tmp'),
  logLevel = 'info',
  exportProvenance = false,
  maxShardBytes = 1024 * 1024,
  outputFormat = 'legacy',
  inspect = 0,
  // compression preference: 'br' or 'gzip' (prefer brotli by default)
  compression = 'br'
} = {}) {
  let logger = createLogger(logLevel)
  // Allow callers (including the CLI) to set run.csvDir / run.updateDir as
  // properties on the function prior to calling it. If present, apply them.
  if (typeof run.csvDir !== 'undefined') setCsvDir(path.resolve(run.csvDir))
  if (typeof run.updateDir !== 'undefined') setUpdateDir(path.resolve(run.updateDir))
  if (inspect && Number.isFinite(Number(inspect)) && Number(inspect) > 0) {
    logger.info('Inspect mode: printing %s sample(s); forcing dryRun', inspect)
    dryRun = true
  }

  logger.info('Loading nutrient metadata...')
  const nutrientMeta = await loadNutrientName()
  // If an explicit updateDir was configured and exists on disk, apply updates.
  if (
    typeof exportedUpdateDir === 'string' &&
    exportedUpdateDir &&
    fs.existsSync(exportedUpdateDir)
  )
    await applyNutrientNameUpdates(nutrientMeta)

  logger.info('Loading food names (sample limit:', sampleLimit, ')...')
  const foodMap = await loadFoodNames(sampleLimit)
  const foodNameEvents =
    typeof exportedUpdateDir === 'string' && exportedUpdateDir && fs.existsSync(exportedUpdateDir)
      ? await applyFoodNameUpdates(foodMap)
      : []
  const foodNameDeletedIds = new Set(
    (foodNameEvents || [])
      .filter((e) => e && e.keys && e.action && String(e.action).toUpperCase() === 'DELETE')
      .map((e) => String(e.keys.FoodID))
  )

  logger.info('Loading conversion factors...')
  const convFactors = await loadConversionFactors()
  const convEvents =
    typeof exportedUpdateDir === 'string' && exportedUpdateDir && fs.existsSync(exportedUpdateDir)
      ? await applyConversionFactorUpdates(convFactors)
      : []

  logger.info(
    'Options: sampleLimit=%s shardSize=%s dryRun=%s outDir=%s logLevel=%s',
    sampleLimit,
    shardSize,
    dryRun,
    outDir,
    logLevel
  )

  const shardsDir = path.join(outDir, 'shards')
  const manifestPath = path.join(outDir, 'canadian_nutrient_file.manifest.json')
  const shardWriter = new ShardWriter(shardsDir, shardSize, 6, compression)
  shardWriter.maxShardBytes = maxShardBytes
  let provenanceWriter = null
  let provenanceOutPath = path.join(outDir, 'provenance', 'provenance.ndjson.gz')
  if (exportProvenance) provenanceWriter = new ProvenanceWriter(provenanceOutPath, 6)

  let emptyWriter = null
  const emptyOutPath = path.join(outDir, 'empty', 'empty.ndjson.gz')

  const foodState = new Map()
  // attachEvent logging controls: log only the first N creates, then suppress and emit a summary
  let attachCreateCount = 0
  let attachCreateLogged = 0
  const ATTACH_CREATE_LOG_LIMIT = 10
  for (const [id, f] of foodMap) {
    foodState.set(id, {
      FoodID: f.FoodID,
      FoodCode: f.FoodCode,
      FoodDescription: f.FoodDescription,
      FoodDescriptionF: f.FoodDescriptionF,
      FoodGroupID: f.FoodGroupID,
      FoodSourceID: f.FoodSourceID,
      NutrientsById: {},
      TagIndex: {},
      NutrientsByTag: {},
      Measures: convFactors.get(id) || []
    })
  }

  const attachEvent = (evt) => {
    if (!evt || !evt.keys) return
    const fid = evt.keys.FoodID || (evt.keys && evt.keys.FoodID === 0 ? '0' : null)
    if (!fid) return
    const idStr = String(fid)
    if (!foodState.has(idStr)) {
      if (evt.action && String(evt.action).toUpperCase() === 'DELETE') {
        logger.debug(
          'attachEvent: SKIP create minimal foodState for DELETE',
          idStr,
          evt.file || null
        )
        return
      }
      const isFoodNameEvent =
        (evt.table && String(evt.table).toUpperCase() === 'FOOD NAME') ||
        (evt.file && String(evt.file).toUpperCase().includes('FOOD NAME'))
      if (foodNameDeletedIds.has(idStr) && !isFoodNameEvent) {
        logger.info('attachEvent: ORPHAN_ADD_SKIPPED', idStr, evt.file || null, evt.action || null)
        return
      }
      // Create minimal state; throttle verbose per-item logging to the first N items
      attachCreateCount += 1
      if (attachCreateLogged < ATTACH_CREATE_LOG_LIMIT) {
        logger.info(
          'attachEvent: CREATE minimal foodState for',
          idStr,
          'due to',
          evt.file || null,
          evt.action || null
        )
        attachCreateLogged += 1
      }
      foodState.set(idStr, {
        FoodID: idStr,
        FoodCode: null,
        FoodDescription: null,
        FoodDescriptionF: null,
        FoodGroupID: null,
        FoodSourceID: null,
        NutrientsById: {},
        TagIndex: {},
        NutrientsByTag: {},
        Measures: convFactors.get(idStr) || [],
        provenance: { updates: [evt] }
      })
      return
    }
    const st = foodState.get(idStr)
    if (!st.provenance) st.provenance = { updates: [] }
    st.provenance.updates.push(evt)
    logger.debug(
      'attachEvent: APPEND provenance for existing FoodID',
      idStr,
      evt.file || null,
      evt.action || null
    )
    const isFoodNameEvent =
      (evt.table && String(evt.table).toUpperCase() === 'FOOD NAME') ||
      (evt.file && String(evt.file).toUpperCase().includes('FOOD NAME'))
    if (isFoodNameEvent && evt.action && String(evt.action).toUpperCase() === 'ADD') {
      // This used to log at INFO and produced a lot of repeated messages when many
      // food-name ADD events occurred for existing states. Keep this as DEBUG so
      // it can be enabled when troubleshooting but won't spam normal runs.
      logger.debug(
        'attachEvent: CREATE minimal foodState (existing state) for',
        idStr,
        'due to',
        evt.file || null,
        evt.action || null
      )
    }
  }

  for (const e of foodNameEvents) attachEvent(e)
  for (const e of convEvents) attachEvent(e)

  logger.info('Streaming nutrient amounts and populating structures...')
  await streamNutrientAmounts(nutrientMeta, foodMap, (foodId, nutrientId, data) => {
    const state = foodState.get(foodId)
    if (!state) return
    state.NutrientsById[nutrientId] = {
      tag: data.tag,
      value: data.value,
      unit: data.unit,
      decimals: data.decimals,
      provenance: {
        NutrientSourceID: data.NutrientSourceID,
        NutrientDateOfEntry: data.NutrientDateOfEntry
      }
    }
    if (data.tag) {
      const existing = state.TagIndex[data.tag]
      if (!existing) state.TagIndex[data.tag] = nutrientId
      else if (existing !== nutrientId) {
        if (!Array.isArray(state.TagIndex[data.tag])) state.TagIndex[data.tag] = [existing]
        if (!state.TagIndex[data.tag].includes(nutrientId))
          state.TagIndex[data.tag].push(nutrientId)
      }
      state.NutrientsByTag[data.tag] = { id: nutrientId, value: data.value, unit: data.unit }
    }
  })

  if (
    typeof exportedUpdateDir === 'string' &&
    exportedUpdateDir &&
    fs.existsSync(exportedUpdateDir)
  ) {
    logger.info('Applying nutrient amount updates from update folder...')
    await applyNutrientAmountUpdates(foodState, nutrientMeta)
  }

  logger.info('Computing derived fields (FctGluc) for sample...')
  let _inspectPrinted = 0
  for (const [id, s] of foodState) {
    const fct = computeFctGluc(s)
    s.Derived = {
      FctGluc: {
        value: fct,
        formula: '(Total Carbohydrate g per 100g - Dietary Fiber g per 100g) / 100',
        inputs: { CHOCDF: null, FIBTG: null }
      }
    }
    const numericId = Number(s.FoodID || s.FoodCode || id)
    const shardIdx = Number.isFinite(numericId) ? Math.floor((numericId - 1) / shardSize) : 0
    const hasNutrients = s.NutrientsById && Object.keys(s.NutrientsById).length > 0
    let outObj = null
    if (outputFormat === 'canonical' || outputFormat === 'legacy' || inspect > 0) {
      outObj =
        outputFormat === 'canonical'
          ? formatters.toCanonical(s)
          : outputFormat === 'legacy'
            ? formatters.toLegacy(s)
            : formatters.toFull(s)
    }

    if (inspect > 0 && _inspectPrinted < inspect) {
      logger.info('Inspect sample %s/%s FoodID=%s', _inspectPrinted + 1, inspect, s.FoodID)
      console.log(JSON.stringify(outObj, null, 2))
      _inspectPrinted += 1
      if (_inspectPrinted >= inspect) break
    }

    if (!dryRun) {
      if (!outObj) {
        if (outputFormat === 'canonical') outObj = formatters.toCanonical(s)
        else if (outputFormat === 'legacy') outObj = formatters.toLegacy(s)
        else outObj = formatters.toFull(s)
      }
      if (hasNutrients) shardWriter.writeRecord(shardIdx, outObj)
      else {
        if (!emptyWriter) emptyWriter = new ProvenanceWriter(emptyOutPath, 6)
        emptyWriter.write(outObj)
      }
    }
    if (
      provenanceWriter &&
      s.provenance &&
      Array.isArray(s.provenance.updates) &&
      s.provenance.updates.length
    ) {
      provenanceWriter.write({
        FoodID: safeTrimId(s.FoodID) || String(s.FoodID),
        updates: s.provenance.updates
      })
    }
  }

  ensureDir(path.dirname(manifestPath))
  let shards = dryRun ? [] : await shardWriter.closeAll()

  // Only apply compression preference logic for compressed outputs
  if (shards && shards.length && compression !== 'none') {
    // If caller requested a preferred compression, prefer it as the primary file in the manifest
    const preferred = String(compression || 'br').toLowerCase() === 'gzip' ? 'gzip' : 'br'
    if (preferred === 'br') {
      shards = shards.map((s) => {
        // find brotli alternate
        const brAlt = (s.alternates || []).find((a) => a.compression === 'br')
        if (brAlt) {
          // make brotli the primary file and move the gzip info into alternates
          const gzipAlt = {
            file: s.file,
            bytes: s.bytes,
            sha256: s.sha256,
            compression: 'gzip'
          }
          return {
            ...s,
            file: brAlt.file,
            bytes: brAlt.bytes,
            sha256: brAlt.sha256,
            alternates: [gzipAlt]
          }
        }
        return s
      })
    }
  }

  const totalRecords = shards.reduce((sum, s) => sum + s.count, 0)
  const totalBytes = shards.reduce((sum, s) => sum + s.bytes, 0)
  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    shardKey: 'FoodID_range',
    shardSize,
    // Adjust compression array based on actual output
    compression: compression === 'none' ? ['none'] : ['br', 'gzip'],
    ...(compression === 'gzip' && { gzipLevel: 6 }),
    ...(compression === 'br' && { brotliQuality: 5, gzipLevel: 6 }),
    shards,
    totalRecords,
    totalBytes
  }
  // If we throttled attachEvent CREATE logs, emit a single summary so users know how many were suppressed
  if (typeof attachCreateCount === 'number' && attachCreateCount > 0) {
    const suppressed = Math.max(0, attachCreateCount - attachCreateLogged)
    if (suppressed > 0) {
      logger.info(
        'attachEvent: created %s minimal foodState entries; %s suppressed (first %s shown)',
        attachCreateCount,
        suppressed,
        attachCreateLogged
      )
    } else {
      logger.info('attachEvent: created %s minimal foodState entries', attachCreateCount)
    }
  }

  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  logger.info('Wrote shards to', shardsDir)
  logger.info('Wrote manifest to', manifestPath)

  if (!dryRun && provenanceWriter) {
    logger.info('Writing provenance export to', provenanceOutPath)
    const pmeta = await provenanceWriter.close()
    manifest.provenance = {
      file: pmeta.file,
      count: pmeta.count,
      bytes: pmeta.bytes,
      sha256: pmeta.sha256,
      path: provenanceOutPath
    }
    await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    logger.info('Updated manifest with provenance entry')
  }

  if (!dryRun && emptyWriter) {
    logger.info('Writing empty-records export to', emptyOutPath)
    const emeta = await emptyWriter.close()
    manifest.emptyRecords = {
      file: emeta.file,
      count: emeta.count,
      bytes: emeta.bytes,
      sha256: emeta.sha256,
      path: emptyOutPath
    }
    await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    logger.info('Updated manifest with empty-records entry')
  }
}

export default { run }
