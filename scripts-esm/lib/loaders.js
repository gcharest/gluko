import { csvStream } from './csv.js'
import { safeTrimId } from './utils.js'

// Load nutrient name CSV into a Map keyed by NutrientID
export async function loadNutrientName() {
  const map = new Map()
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('NUTRIENT NAME.csv')
        s.on('data', (row) => {
          const id = String(row.NutrientID).trim()
          map.set(id, {
            id,
            code: row.NutrientCode,
            symbol: row.NutrientSymbol,
            unit: row.NutrientUnit,
            name: row.NutrientName,
            tag: row.Tagname ? row.Tagname.trim().toUpperCase() : null,
            decimals: row.NutrientDecimals ? Number(row.NutrientDecimals) : null
          })
        })
        s.on('end', () => resolve(map))
        s.on('error', reject)
      } catch (err) {
        reject(err)
      }
    })()
  })
}

// Load food names CSV into a Map keyed by FoodID
export async function loadFoodNames(sampleLimit) {
  const map = new Map()
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('FOOD NAME.csv')
        s.on('data', (row) => {
          const id = String(row.FoodID).trim()
          if (sampleLimit && map.size >= sampleLimit) return
          map.set(id, {
            FoodID: id,
            FoodCode: row.FoodCode,
            FoodDescription: row.FoodDescription,
            FoodDescriptionF: row.FoodDescriptionF,
            FoodGroupID: row.FoodGroupID,
            FoodSourceID: row.FoodSourceID
          })
        })
        s.on('end', () => resolve(map))
        s.on('error', reject)
      } catch (err) {
        reject(err)
      }
    })()
  })
}

export async function loadConversionFactors() {
  const byFood = new Map()
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('CONVERSION FACTOR.csv')
        s.on('data', (row) => {
          const foodId = String(row.FoodID).trim()
          const measureId = String(row.MeasureID).trim()
          const entry = {
            MeasureID: measureId,
            ConversionFactorValue: Number(row.ConversionFactorValue) || null,
            ConvFactorDateOfEntry: row.ConvFactorDateOfEntry || null
          }
          if (!byFood.has(foodId)) byFood.set(foodId, [])
          byFood.get(foodId).push(entry)
        })
        s.on('end', () => resolve(byFood))
        s.on('error', reject)
      } catch (err) {
        reject(err)
      }
    })()
  })
}

export async function streamNutrientAmounts(nutrientMeta, foodMap, onNutrient) {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const s = await csvStream('NUTRIENT AMOUNT.csv')
        s.on('data', (row) => {
          const foodId = String(row.FoodID).trim()
          if (!foodMap.has(foodId)) return
          const nutrientId = safeTrimId(row.NutrientID)
          if (!nutrientId) return
          const meta = nutrientMeta.get(nutrientId) || { tag: null, unit: null, decimals: null }
          onNutrient(foodId, nutrientId, {
            value: row.NutrientValue === '' ? null : Number(row.NutrientValue),
            standardError: row.StandardError === '' ? null : Number(row.StandardError),
            numberOfObservations:
              row.NumberofObservations === '' ? null : Number(row.NumberofObservations),
            NutrientSourceID: row.NutrientSourceID || null,
            NutrientDateOfEntry: row.NutrientDateOfEntry || null,
            tag: meta.tag,
            unit: meta.unit,
            decimals: meta.decimals
          })
        })
        s.on('end', resolve)
        s.on('error', reject)
      } catch (err) {
        reject(err)
      }
    })()
  })
}
