import { describe, it, expect } from 'vitest'
import { serializeDates, deserializeDates } from '../date'

describe('date utils', () => {
  it('serializes and deserializes dates in nested objects', () => {
    const obj = {
      a: new Date('2020-01-01T00:00:00.000Z'),
      b: [new Date('2021-01-01T00:00:00.000Z'), { c: new Date('2022-01-01T00:00:00.000Z') }]
    }

    const serialized = serializeDates(obj) as any
    expect(typeof serialized.a).toBe('string')
    expect(Array.isArray(serialized.b)).toBe(true)

    const deserialized = deserializeDates(serialized) as any
    expect(deserialized.a instanceof Date).toBe(true)
    expect(deserialized.b[0] instanceof Date).toBe(true)
    expect(deserialized.b[1].c instanceof Date).toBe(true)
  })
})
