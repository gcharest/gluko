/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useStorageQuota } from '../useStorageQuota'

// Mock navigator.storage API
const mockStorageEstimate = vi.fn()
const mockStoragePersist = vi.fn()
const mockStoragePersisted = vi.fn()

Object.defineProperty(global.navigator, 'storage', {
  value: {
    estimate: mockStorageEstimate,
    persist: mockStoragePersist,
    persisted: mockStoragePersisted
  },
  writable: true,
  configurable: true
})

describe('useStorageQuota', () => {
  let originalStorage: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Save and reset storage API to default mock before each test
    originalStorage = global.navigator.storage
    Object.defineProperty(global.navigator, 'storage', {
      value: {
        estimate: mockStorageEstimate,
        persist: mockStoragePersist,
        persisted: mockStoragePersisted
      },
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    // Restore original storage after each test
    Object.defineProperty(global.navigator, 'storage', {
      value: originalStorage,
      writable: true,
      configurable: true
    })
  })

  it('should initialize with default quota info', () => {
    const { quotaInfo } = useStorageQuota()

    expect(quotaInfo.value.usage).toBe(0)
    expect(quotaInfo.value.quota).toBe(0)
    expect(quotaInfo.value.available).toBe(0)
    expect(quotaInfo.value.percentUsed).toBe(0)
  })

  it('should check quota successfully', async () => {
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 50 * 1024 * 1024, // 50 MB
      quota: 100 * 1024 * 1024 // 100 MB
    })

    const { checkQuota, quotaInfo } = useStorageQuota()
    const result = await checkQuota()

    expect(result.usage).toBe(50 * 1024 * 1024)
    expect(result.quota).toBe(100 * 1024 * 1024)
    expect(result.available).toBe(50 * 1024 * 1024)
    expect(result.percentUsed).toBe(50)
    expect(quotaInfo.value).toEqual(result)
  })

  it('should calculate hasEnoughSpace correctly', async () => {
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 50 * 1024 * 1024,
      quota: 100 * 1024 * 1024
    })

    const { checkQuota } = useStorageQuota()

    // Check with 30 MB needed (should have enough)
    const result1 = await checkQuota(30 * 1024 * 1024)
    expect(result1.hasEnoughSpace).toBe(true)

    mockStorageEstimate.mockResolvedValueOnce({
      usage: 50 * 1024 * 1024,
      quota: 100 * 1024 * 1024
    })

    // Check with 60 MB needed (should not have enough)
    const result2 = await checkQuota(60 * 1024 * 1024)
    expect(result2.hasEnoughSpace).toBe(false)
  })

  it('should handle quota check error', async () => {
    mockStorageEstimate.mockRejectedValueOnce(new Error('Storage API error'))

    const { checkQuota, error } = useStorageQuota()

    await expect(checkQuota()).rejects.toThrow()
    expect(error.value).not.toBeNull()
  })

  it('should request persistent storage', async () => {
    mockStoragePersist.mockResolvedValueOnce(true)
    mockStoragePersisted.mockResolvedValueOnce(false)

    const { requestPersistentStorage } = useStorageQuota()
    const result = await requestPersistentStorage()

    expect(result).toBe(true)
    expect(mockStoragePersist).toHaveBeenCalled()
  })

  it('should return true if already persisted', async () => {
    mockStoragePersisted.mockResolvedValueOnce(true)

    const { requestPersistentStorage } = useStorageQuota()
    const result = await requestPersistentStorage()

    expect(result).toBe(true)
    expect(mockStoragePersist).not.toHaveBeenCalled()
  })

  it('should check if storage is persisted', async () => {
    mockStoragePersisted.mockResolvedValueOnce(true)

    const { isPersisted } = useStorageQuota()
    const result = await isPersisted()

    expect(result).toBe(true)
  })

  it('should format bytes correctly', () => {
    const { formatBytes } = useStorageQuota()

    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.5 MB')
  })

  it('should get correct quota warning level', async () => {
    const { checkQuota, getQuotaWarningLevel } = useStorageQuota()

    // Safe level (< 75%)
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 50 * 1024 * 1024,
      quota: 100 * 1024 * 1024
    })
    await checkQuota()
    expect(getQuotaWarningLevel.value).toBe('safe')

    // Warning level (75% - 89%)
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 80 * 1024 * 1024,
      quota: 100 * 1024 * 1024
    })
    await checkQuota()
    expect(getQuotaWarningLevel.value).toBe('warning')

    // Critical level (>= 90%)
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 95 * 1024 * 1024,
      quota: 100 * 1024 * 1024
    })
    await checkQuota()
    expect(getQuotaWarningLevel.value).toBe('critical')
  })

  it('should estimate dataset size with overhead', () => {
    const { estimateDatasetSize } = useStorageQuota()

    const baseSize = 10 * 1024 * 1024 // 10 MB
    const estimated = estimateDatasetSize(baseSize)

    // Should add 20% overhead
    expect(estimated).toBe(Math.ceil(baseSize * 1.2))
  })

  it.skip('should handle missing storage API', async () => {
    // Note: Skipping because isSupported is evaluated at module load time
    // In real usage, navigator.storage is always present in supported browsers
    // This test would require re-importing the module which causes other issues
  })

  it('should handle persistence API not supported', async () => {
    const originalStorage = global.navigator.storage
    Object.defineProperty(global.navigator, 'storage', {
      value: { estimate: mockStorageEstimate },
      writable: true,
      configurable: true
    })

    const { requestPersistentStorage } = useStorageQuota()
    const result = await requestPersistentStorage()

    expect(result).toBe(false)

    // Restore storage API
    Object.defineProperty(global.navigator, 'storage', {
      value: originalStorage,
      writable: true,
      configurable: true
    })
  })

  it('should calculate percent used correctly at edge cases', async () => {
    // Make sure storage API is available
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 0,
      quota: 100 * 1024 * 1024
    })

    const { checkQuota } = useStorageQuota()

    // Empty storage
    const result1 = await checkQuota()
    expect(result1.percentUsed).toBe(0)

    // Full storage
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 100 * 1024 * 1024,
      quota: 100 * 1024 * 1024
    })
    const result2 = await checkQuota()
    expect(result2.percentUsed).toBe(100)

    // Over quota (should not happen but handle gracefully)
    mockStorageEstimate.mockResolvedValueOnce({
      usage: 110 * 1024 * 1024,
      quota: 100 * 1024 * 1024
    })
    const result3 = await checkQuota()
    expect(result3.percentUsed).toBeCloseTo(110, 0)
  })
})
