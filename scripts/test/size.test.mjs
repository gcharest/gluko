import { describe, it, expect } from 'vitest'
import { parseSizeToBytes } from '../lib/utils.js'

describe('parseSizeToBytes', () => {
  it('handles undefined/null and numbers', () => {
    expect(parseSizeToBytes(undefined)).toBeNull()
    expect(parseSizeToBytes(null)).toBeNull()
    expect(parseSizeToBytes(1024)).toBe(1024)
  })

  it('parses kb and mb variants and defaults to bytes*1024', () => {
    expect(parseSizeToBytes('1k')).toBe(1024)
    expect(parseSizeToBytes('1kb')).toBe(1024)
    expect(parseSizeToBytes('1m')).toBe(1024 * 1024)
    expect(parseSizeToBytes('1mb')).toBe(1024 * 1024)
    expect(parseSizeToBytes('2')).toBe(2 * 1024)
    expect(parseSizeToBytes('0.5k')).toBe(Math.round(0.5 * 1024))
  })

  it('returns null for invalid formats', () => {
    expect(parseSizeToBytes('abc')).toBeNull()
    expect(parseSizeToBytes('1gb')).toBeNull()
  })
})
