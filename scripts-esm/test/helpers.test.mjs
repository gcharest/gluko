import { describe, it, expect } from 'vitest'
import { safeTrimId, normalizeProvKeys } from '../lib/utils.js'

describe('scripts-esm helpers', () => {
  it('safeTrimId returns null for undefined/null/empty and trimmed strings otherwise', () => {
    expect(safeTrimId(undefined)).toBeNull()
    expect(safeTrimId(null)).toBeNull()
    expect(safeTrimId('   ')).toBeNull()
    expect(safeTrimId(' abc ')).toBe('abc')
    expect(safeTrimId(0)).toBe('0')
  })

  it('normalizeProvKeys strips empty values, keeps 0 as string, and trims strings', () => {
    const input = {
      a: '  foo ',
      b: '',
      c: null,
      d: 0,
      e: '0',
      f: '  '
    }
    const out = normalizeProvKeys(input)
    expect(out).toEqual({ a: 'foo', d: '0', e: '0' })
  })
})
