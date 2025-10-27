import { describe, it, expect } from 'vitest'
import { mergeNonEmpty } from '../lib/utils.js'

describe('scripts mergeNonEmpty', () => {
  it('merges only non-empty and defined values, keeping numeric 0', () => {
    const target = { existing: 'keep' }
    const src = { a: '1', b: '', c: undefined, d: 0, e: null }
    mergeNonEmpty(target, src)
    // null is not a string '' and typeof null === 'object', so it should be copied
    expect(target).toEqual({ existing: 'keep', a: '1', d: 0, e: null })
  })
})
