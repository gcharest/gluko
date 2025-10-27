import { describe, it, expect } from 'vitest'
import { loadConversionFactors } from '../lib/loaders.js'

describe('loadConversionFactors', () => {
  it('loads conversion factors grouped by FoodID', async () => {
    const m = await loadConversionFactors()
    expect(m instanceof Map).toBe(true)
    expect(m.size).toBeGreaterThanOrEqual(2)
    const a = m.get('10')
    expect(Array.isArray(a)).toBe(true)
    expect(a[0].MeasureID).toBe('1')
    expect(a[0].ConversionFactorValue).toBeCloseTo(0.5)
  })
})
