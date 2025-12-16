import { describe, it, expect } from 'vitest'
import { serializeDates, deserializeDates } from '../date'

describe('date utils', () => {
  it('serializes and deserializes dates in nested objects', () => {
    const obj = {
      a: new Date('2020-01-01T00:00:00.000Z'),
      b: [new Date('2021-01-01T00:00:00.000Z'), { c: new Date('2022-01-01T00:00:00.000Z') }]
    }

    const serialized = serializeDates(obj)
    expect(typeof (serialized as { a: unknown }).a).toBe('string')
    expect(Array.isArray((serialized as { b: unknown }).b)).toBe(true)

    const deserialized = deserializeDates(serialized)
    expect((deserialized as { a: unknown }).a instanceof Date).toBe(true)
    expect(((deserialized as { b: unknown }).b as unknown[])[0] instanceof Date).toBe(true)
    expect(((deserialized as { b: Array<unknown> }).b[1] as { c: unknown }).c instanceof Date).toBe(
      true
    )
  })
})
