import { describe, it, expect } from 'vitest'
import { makeProvEvent } from '../lib/utils.js'

describe('scripts-esm prov events', () => {
  it('makeProvEvent normalizes keys and includes timestamp', () => {
    const inputKeys = { a: '  x ', b: '', c: null, d: 0 }
    const ev = makeProvEvent('file.csv', 'add', 'FOOD', inputKeys)
    expect(ev.file).toBe('file.csv')
    expect(ev.action).toBe('add')
    expect(ev.table).toBe('FOOD')
    expect(ev.keys).toEqual({ a: 'x', d: '0' })
    expect(typeof ev.timestamp).toBe('string')
    expect(!Number.isNaN(Date.parse(ev.timestamp))).toBe(true)
  })
})
