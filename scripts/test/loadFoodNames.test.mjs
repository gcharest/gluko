import { describe, it, expect } from 'vitest'
import { loadFoodNames } from '../lib/loaders.js'

describe('loadFoodNames', () => {
  it('loads CSV and returns a Map keyed by FoodID', async () => {
    const map = await loadFoodNames()
    expect(map instanceof Map).toBe(true)
    expect(map.size).toBeGreaterThanOrEqual(3)
    const a = map.get('10')
    expect(a).toBeDefined()
    expect(a.FoodCode).toBe('100')
    expect(a.FoodDescription.trim()).toBe('Apple')
  })

  it('honors sampleLimit', async () => {
    const map = await loadFoodNames(2)
    expect(map.size).toBe(2)
  })
})
