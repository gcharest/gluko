import { describe, it, expect } from 'vitest'
import { toCanonical, toFull, toLegacy } from '../lib/formatters.js'

describe('scripts-esm/formatters', () => {
  it('toCanonical produces expected shape with nutrients', () => {
    const s = {
      FoodID: 123,
      FoodCode: 'ABC',
      FoodDescription: 'Desc',
      FoodDescriptionF: null,
      FoodGroupID: 5,
      Measures: [{ MeasureID: 'm1' }],
      Derived: { FctGluc: { value: 0.12 } },
      NutrientsById: {
        100: {
          tag: 'CHOCDF',
          value: 10,
          unit: 'g',
          decimals: 1,
          provenance: { NutrientSourceID: 'x', NutrientDateOfEntry: '2020-01-01' }
        }
      },
      TagIndex: { CHOCDF: '100' },
      NutrientsByTag: { CHOCDF: { id: '100', value: 10, unit: 'g' } }
    }
    const out = toCanonical(s)
    expect(out.FoodID).toBe('123')
    expect(out.FoodCode).toBe('ABC')
    expect(out.Description).toBe('Desc')
    expect(out.FoodGroupID).toBe('5')
    expect(Array.isArray(out.Measures)).toBe(true)
    expect(out.FctGluc).toBeCloseTo(0.12)
    expect(Array.isArray(out.Nutrients)).toBe(true)
    expect(out.Nutrients).toHaveLength(1)
    expect(out.Nutrients[0]).toMatchObject({
      NutrientID: '100',
      tag: 'CHOCDF',
      value: 10,
      unit: 'g'
    })
  })

  it('toCanonical handles missing nutrients gracefully', () => {
    const s = { FoodID: null, Measures: null, TagIndex: null, NutrientsByTag: null }
    const out = toCanonical(s)
    expect(out.FoodID).toBeNull()
    expect(Array.isArray(out.Measures)).toBe(true)
    expect(out.Nutrients).toEqual([])
    expect(out.TagIndex).toEqual({})
    expect(out.NutrientsByTag).toEqual({})
  })

  it('toFull returns a shallow clone (different object)', () => {
    const s = { a: 1, nested: { b: 2 } }
    const t = toFull(s)
    expect(t).not.toBe(s)
    expect(t).toEqual(s)
    expect(t.nested).toBe(s.nested)
  })

  it('toLegacy pivots nutrients to numeric top-level keys and includes FctGluc', () => {
    const s = {
      FoodID: 10,
      FoodCode: 10,
      FoodGroupID: 2,
      FoodSourceID: 20,
      FoodDescription: 'Foo',
      FoodDescriptionF: 'FooF',
      FoodGroupName: 'Group',
      FoodGroupNameF: 'GroupF',
      Derived: { FctGluc: { value: 0.123 } },
      NutrientsById: {
        203: { value: 9.54, unit: 'g' },
        205: { value: 5.91, unit: 'g' }
      }
    }
    const out = toLegacy(s)
    expect(out.FoodID).toBe(10)
    expect(out.FoodCode).toBe(10)
    expect(out.FoodGroupName).toBe('Group')
    expect(out['203']).toBeCloseTo(9.54)
    expect(out['205']).toBeCloseTo(5.91)
    expect(out.FctGluc).toBeCloseTo(0.123)
  })
})
