import { ref, computed } from 'vue'
import type { StorageQuotaInfo } from '@/types/shard-loading'

export const useStorageQuota = () => {
  const quotaInfo = ref<StorageQuotaInfo>({
    usage: 0,
    quota: 0,
    available: 0,
    percentUsed: 0,
    hasEnoughSpace: false,
    estimatedSpaceNeeded: 0
  })

  const error = ref<Error | null>(null)
  const isSupported = 'storage' in navigator && navigator.storage && 'estimate' in navigator.storage

  /**
   * Check current storage quota and usage
   */
  const checkQuota = async (estimatedSpaceNeeded: number = 0): Promise<StorageQuotaInfo> => {
    try {
      if (!isSupported) {
        throw new Error('Storage API not supported in this browser')
      }

      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      const quota = estimate.quota || 0
      const available = quota - usage
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0
      const hasEnoughSpace = available >= estimatedSpaceNeeded

      const info: StorageQuotaInfo = {
        usage,
        quota,
        available,
        percentUsed,
        hasEnoughSpace,
        estimatedSpaceNeeded
      }

      quotaInfo.value = info
      return info
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to check storage quota')
      throw err
    }
  }

  /**
   * Request persistent storage (reduces eviction risk)
   */
  const requestPersistentStorage = async (): Promise<boolean> => {
    try {
      if (!('storage' in navigator && 'persist' in navigator.storage)) {
        console.warn('Persistent storage not supported')
        return false
      }

      // Check if already persistent
      const isPersisted = await navigator.storage.persisted()
      if (isPersisted) {
        return true
      }

      // Request persistence
      const granted = await navigator.storage.persist()
      return granted
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to request persistent storage')
      console.error('Error requesting persistent storage:', err)
      return false
    }
  }

  /**
   * Check if storage is persisted
   */
  const isPersisted = async (): Promise<boolean> => {
    try {
      if (!('storage' in navigator && 'persisted' in navigator.storage)) {
        return false
      }
      return await navigator.storage.persisted()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to check persistence status')
      return false
    }
  }

  /**
   * Format bytes to human-readable string
   */
  const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  /**
   * Get storage quota warning level
   * @returns 'safe' | 'warning' | 'critical'
   */
  const getQuotaWarningLevel = computed(() => {
    const percent = quotaInfo.value.percentUsed

    if (percent >= 90) return 'critical'
    if (percent >= 75) return 'warning'
    return 'safe'
  })

  /**
   * Calculate estimated storage needed for dataset
   */
  const estimateDatasetSize = (totalSizeBytes: number): number => {
    // Add 20% overhead for IndexedDB metadata and indexes
    return Math.ceil(totalSizeBytes * 1.2)
  }

  return {
    quotaInfo,
    error,
    isSupported,
    checkQuota,
    requestPersistentStorage,
    isPersisted,
    formatBytes,
    getQuotaWarningLevel,
    estimateDatasetSize
  }
}
