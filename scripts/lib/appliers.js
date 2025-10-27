import { updateCsvStream, existsInUpdateDir } from './csv.js'
import {
  mergeNonEmpty,
  makeProvEvent,
  makeNutrientProvKeys,
  safeTrimId,
  createLogger
} from './utils.js'

const warnedConversionAddKeys = new Set()
const warnedFoodNameAddIds = new Set()
const warnedNutrientNameAddIds = new Set()

let logger = createLogger('info')

export async function applyNutrientNameUpdates(map) {
  const changeFile = 'NUTRIENT NAME CHANGE.csv'
  const addFile = 'NUTRIENT NAME ADD.csv'
  const deleteFile = 'NUTRIENT NAME DELETE.csv'

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(changeFile)
          s.on('data', (row) => {
            const id = String(row.NutrientID).trim()
            const newObj = {
              id,
              code: row.NutrientCode,
              symbol: row.NutrientSymbol,
              unit: row.NutrientUnit,
              name: row.NutrientName,
              tag: row.Tagname ? row.Tagname.trim().toUpperCase() : null,
              decimals: row.NutrientDecimals ? Number(row.NutrientDecimals) : null
            }
            if (map.has(id)) {
              const existing = map.get(id)
              mergeNonEmpty(existing, newObj)
              map.set(id, existing)
            } else {
              map.set(id, newObj)
            }
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }

  if (existsInUpdateDir(addFile)) {
    let nutrientAddOverwriteCount = 0
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(addFile)
          s.on('data', (row) => {
            const id = String(row.NutrientID).trim()
            const newObj = {
              id,
              code: row.NutrientCode,
              symbol: row.NutrientSymbol,
              unit: row.NutrientUnit,
              name: row.NutrientName,
              tag: row.Tagname ? row.Tagname.trim().toUpperCase() : null,
              decimals: row.NutrientDecimals ? Number(row.NutrientDecimals) : null
            }
            if (map.has(id)) {
              if (!warnedNutrientNameAddIds.has(id)) {
                warnedNutrientNameAddIds.add(id)
                nutrientAddOverwriteCount++
              }
            }
            map.set(id, newObj)
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
    if (nutrientAddOverwriteCount > 0)
      logger.info(
        'NUTRIENT NAME ADD overwrote %s existing entries (details suppressed)',
        nutrientAddOverwriteCount
      )
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(deleteFile)
          s.on('data', (row) => {
            const id = String(row.NutrientID).trim()
            if (map.has(id)) map.delete(id)
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }
}

export async function applyFoodNameUpdates(map) {
  const changeFile = 'FOOD NAME CHANGE.csv'
  const addFile = 'FOOD NAME ADD.csv'
  const deleteFile = 'FOOD NAME DELETE.csv'
  const events = []

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(changeFile)
          s.on('data', (row) => {
            const id = String(row.FoodID).trim()
            if (!map.has(id)) {
              map.set(id, {
                FoodID: id,
                FoodCode: row.FoodCode,
                FoodDescription: row.FoodDescription,
                FoodDescriptionF: row.FoodDescriptionF,
                FoodGroupID: row.FoodGroupID,
                FoodSourceID: row.FoodSourceID
              })
              events.push(makeProvEvent(changeFile, 'CHANGE', 'FOOD NAME', { FoodID: id }))
            } else {
              const existing = map.get(id)
              mergeNonEmpty(existing, {
                FoodCode: row.FoodCode,
                FoodDescription: row.FoodDescription,
                FoodDescriptionF: row.FoodDescriptionF,
                FoodGroupID: row.FoodGroupID,
                FoodSourceID: row.FoodSourceID
              })
              map.set(id, existing)
            }
            events.push(makeProvEvent(changeFile, 'CHANGE', 'FOOD NAME', { FoodID: id }))
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }

  if (existsInUpdateDir(addFile)) {
    let foodAddOverwriteCount = 0
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(addFile)
          s.on('data', (row) => {
            const id = String(row.FoodID).trim()
            if (map.has(id)) {
              if (!warnedFoodNameAddIds.has(id)) {
                warnedFoodNameAddIds.add(id)
                foodAddOverwriteCount++
              }
            }
            map.set(id, {
              FoodID: id,
              FoodCode: row.FoodCode,
              FoodDescription: row.FoodDescription,
              FoodDescriptionF: row.FoodDescriptionF,
              FoodGroupID: row.FoodGroupID,
              FoodSourceID: row.FoodSourceID
            })
            events.push(makeProvEvent(addFile, 'ADD', 'FOOD NAME', { FoodID: id }))
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
    if (foodAddOverwriteCount > 0)
      logger.info(
        'FOOD NAME ADD overwrote %s existing entries (details suppressed)',
        foodAddOverwriteCount
      )
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(deleteFile)
          s.on('data', (row) => {
            const id = String(row.FoodID).trim()
            if (map.has(id)) map.delete(id)
            events.push(makeProvEvent(deleteFile, 'DELETE', 'FOOD NAME', { FoodID: id }))
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }
  return events
}

export async function applyConversionFactorUpdates(byFood) {
  const changeFile = 'CONVERSION FACTOR CHANGE.csv'
  const addFile = 'CONVERSION FACTOR ADD.csv'
  const deleteFile = 'CONVERSION FACTOR DELETE.csv'
  const events = []
  let convAddOverwriteCount = 0

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(changeFile)
          s.on('data', (row) => {
            const foodId = String(row.FoodID).trim()
            const measureId = String(row.MeasureID).trim()
            const entry = {
              MeasureID: measureId,
              ConversionFactorValue: Number(row.ConversionFactorValue) || null,
              ConvFactorDateOfEntry: row.ConvFactorDateOfEntry || null
            }
            const arr = byFood.get(foodId) || []
            const idx = arr.findIndex((e) => e.MeasureID === measureId)
            if (idx >= 0) arr[idx] = Object.assign(arr[idx], entry)
            else arr.push(entry)
            byFood.set(foodId, arr)
            events.push(
              makeProvEvent(changeFile, 'CHANGE', 'CONVERSION FACTOR', {
                FoodID: foodId,
                MeasureID: measureId
              })
            )
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }

  if (existsInUpdateDir(addFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(addFile)
          s.on('data', (row) => {
            const foodId = String(row.FoodID).trim()
            const measureId = String(row.MeasureID).trim()
            const entry = {
              MeasureID: measureId,
              ConversionFactorValue: Number(row.ConversionFactorValue) || null,
              ConvFactorDateOfEntry: row.ConvFactorDateOfEntry || null
            }
            const arr = byFood.get(foodId) || []
            const warnKey = `${foodId}|${measureId}`
            if (arr.find((e) => e.MeasureID === measureId)) {
              if (!warnedConversionAddKeys.has(warnKey)) {
                warnedConversionAddKeys.add(warnKey)
                convAddOverwriteCount++
              }
            }
            const filtered = arr.filter((e) => e.MeasureID !== measureId)
            filtered.push(entry)
            byFood.set(foodId, filtered)
            events.push(
              makeProvEvent(addFile, 'ADD', 'CONVERSION FACTOR', {
                FoodID: foodId,
                MeasureID: measureId
              })
            )
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
    if (convAddOverwriteCount > 0) {
      logger.info(
        'Conversion factor ADD overwrote %s existing entries (details suppressed)',
        convAddOverwriteCount
      )
    }
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(deleteFile)
          s.on('data', (row) => {
            const foodId = String(row.FoodID).trim()
            const measureId = String(row.MeasureID).trim()
            const arr = byFood.get(foodId) || []
            const filtered = arr.filter((e) => e.MeasureID !== measureId)
            byFood.set(foodId, filtered)
            events.push(
              makeProvEvent(deleteFile, 'DELETE', 'CONVERSION FACTOR', {
                FoodID: foodId,
                MeasureID: measureId
              })
            )
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }
  return events
}

export async function applyNutrientAmountUpdates(foodState, nutrientMeta) {
  const changeFile = 'NUTRIENT AMOUNT CHANGE.csv'
  const addFile = 'NUTRIENT AMOUNT ADD.csv'
  const deleteFile = 'NUTRIENT AMOUNT DELETE.csv'

  const applyRow = (row, sourceFile, action) => {
    const foodId = String(row.FoodID).trim()
    if (!foodState.has(foodId)) return
    const nutrientId = safeTrimId(row.NutrientID)
    const meta = nutrientMeta.get(nutrientId) || { tag: null, unit: null, decimals: null }
    const value = row.NutrientValue === '' ? null : Number(row.NutrientValue)
    const entry = {
      tag: meta.tag,
      value,
      unit: meta.unit,
      decimals: meta.decimals,
      provenance: {
        NutrientSourceID: row.NutrientSourceID || null,
        NutrientDateOfEntry: row.NutrientDateOfEntry || null
      }
    }
    const state = foodState.get(foodId)
    state.NutrientsById[nutrientId] = entry
    if (!state.provenance) state.provenance = { updates: [] }
    state.provenance.updates.push(
      makeProvEvent(
        sourceFile || 'NUTRIENT AMOUNT',
        action || 'APPLY',
        'NUTRIENT AMOUNT',
        makeNutrientProvKeys(foodId, nutrientId)
      )
    )
    if (meta.tag) {
      const existing = state.TagIndex[meta.tag]
      if (!existing) state.TagIndex[meta.tag] = nutrientId
      else if (existing !== nutrientId) {
        if (!Array.isArray(state.TagIndex[meta.tag])) state.TagIndex[meta.tag] = [existing]
        if (!state.TagIndex[meta.tag].includes(nutrientId))
          state.TagIndex[meta.tag].push(nutrientId)
      }
      state.NutrientsByTag[meta.tag] = { id: nutrientId, value, unit: meta.unit }
    }
  }

  if (existsInUpdateDir(changeFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(changeFile)
          s.on('data', (row) => applyRow(row, changeFile, 'CHANGE'))
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }

  if (existsInUpdateDir(addFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(addFile)
          s.on('data', (row) => applyRow(row, addFile, 'ADD'))
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }

  if (existsInUpdateDir(deleteFile)) {
    await new Promise((res, rej) => {
      ;(async () => {
        try {
          const s = await updateCsvStream(deleteFile)
          s.on('data', (row) => {
            const foodId = String(row.FoodID).trim()
            if (!foodState.has(foodId)) return
            const nutrientId = safeTrimId(row.NutrientID)
            const state = foodState.get(foodId)
            if (state.NutrientsById && state.NutrientsById[nutrientId])
              delete state.NutrientsById[nutrientId]
            for (const tag of Object.keys(state.TagIndex)) {
              const v = state.TagIndex[tag]
              if (v === nutrientId) delete state.TagIndex[tag]
              else if (Array.isArray(v)) {
                const filtered = v.filter((x) => x !== nutrientId)
                if (filtered.length === 1) state.TagIndex[tag] = filtered[0]
                else state.TagIndex[tag] = filtered
              }
            }
            for (const t of Object.keys(state.NutrientsByTag)) {
              if (state.NutrientsByTag[t] && state.NutrientsByTag[t].id === nutrientId)
                delete state.NutrientsByTag[t]
            }
            if (!state.provenance) state.provenance = { updates: [] }
            state.provenance.updates.push(
              makeProvEvent(
                deleteFile,
                'DELETE',
                'NUTRIENT AMOUNT',
                makeNutrientProvKeys(foodId, nutrientId)
              )
            )
          })
          s.on('end', res)
          s.on('error', rej)
        } catch (err) {
          rej(err)
        }
      })()
    })
  }
}
