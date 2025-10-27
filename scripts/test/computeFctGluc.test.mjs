import { describe, it, expect } from 'vitest'
import { computeFctGluc } from '../lib/compute.js'

describe('computeFctGluc', () => {
  it('computes available carbohydrate when CHOCDF and FIBTG present', () => {
    const s = {
      TagIndex: { CHOCDF: '1', FIBTG: '2' },
      NutrientsById: {
        1: { value: 50 },
        2: { value: 10 }
      }
    }
    expect(computeFctGluc(s)).toBeCloseTo((50 - 10) / 100)
  })

  it('returns null when a required nutrient is missing', () => {
    const s1 = { TagIndex: { CHOCDF: '1' }, NutrientsById: { 1: { value: 20 } } }
    const s2 = { TagIndex: { FIBTG: '2' }, NutrientsById: { 2: { value: 5 } } }
    expect(computeFctGluc(s1)).toBeNull()
    expect(computeFctGluc(s2)).toBeNull()
  })

  it('handles TagIndex values as arrays', () => {
    const s = {
      TagIndex: { CHOCDF: ['10'], FIBTG: ['20'] },
      NutrientsById: {
        10: { value: 30 },
        20: { value: 5 }
      }
    }
    expect(computeFctGluc(s)).toBeCloseTo((30 - 5) / 100)
  })
})

// Additional tests for small helper: makeNutrientProvKeys
import { makeNutrientProvKeys } from '../lib/utils.js'

describe('makeNutrientProvKeys', () => {
  it('returns FoodID as string and NutrientID when present', () => {
    const keys = makeNutrientProvKeys(10, ' 5 ')
    expect(keys).toEqual({ FoodID: '10', NutrientID: '5' })
  })

  it('omits NutrientID when empty and preserves FoodID 0 as string', () => {
    const keys1 = makeNutrientProvKeys(0, '')
    expect(keys1).toEqual({ FoodID: '0' })

    const keys2 = makeNutrientProvKeys('7', undefined)
    expect(keys2).toEqual({ FoodID: '7' })
  })

  it('includes NutrientID when it is numeric 0', () => {
    const keys = makeNutrientProvKeys(3, 0)
    expect(keys).toEqual({ FoodID: '3', NutrientID: '0' })
  })
})
