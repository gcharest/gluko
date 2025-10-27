import { describe, it, expect } from 'vitest'
import { loadNutrientName } from '../lib/loaders.js'

describe('loadNutrientName', () => {
  it('loads CSV and returns a Map keyed by NutrientID', async () => {
    const map = await loadNutrientName()
    expect(map instanceof Map).toBe(true)
    expect(map.size).toBeGreaterThanOrEqual(2)
    const g = map.get('1')
    expect(g).toBeDefined()
    expect(g.id).toBe('1')
    expect(g.code).toBe('GLC')
    expect(g.symbol).toBe('g')
    expect(g.unit).toBe('mg')
    expect(g.name).toBe('Glucose')
    expect(g.tag).toBe('CHOCDF')
    expect(g.decimals).toBe(2)
  })
})
