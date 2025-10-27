import { describe, it, expect } from 'vitest'
import { loadFoodNames } from '../lib/loaders.js'
import { applyFoodNameUpdates } from '../lib/appliers.js'

describe('applyFoodNameUpdates', () => {
  it('applies change, add, delete update files and returns events', async () => {
    const map = await loadFoodNames()
    // base map has IDs 10,20,30
    expect(map.has('10')).toBe(true)
    expect(map.has('20')).toBe(true)
    expect(map.has('30')).toBe(true)

    const events = await applyFoodNameUpdates(map)
    // Events should include change/add/delete operations: at least 3 events
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThanOrEqual(3)

    // After updates: 20 should be deleted, 10 should be overwritten, 40 and 50 added
    expect(map.has('20')).toBe(false)
    expect(map.has('10')).toBe(true)
    expect(map.get('10').FoodDescription).toMatch(/Apple Modified/)
    expect(map.has('40')).toBe(true)
    expect(map.has('50')).toBe(true)
  })
})
