import { ref, computed } from 'vue'
import { useIndexedDB } from './useIndexedDB'
import type {
  ManifestFile,
  ShardDescriptor,
  ShardMetadata,
  ManifestVersion,
  ShardLoadProgress
} from '@/types/shard-loading'
import type { NutrientFile } from '@/stores/nutrientsFile'

const MANIFEST_URL = '/data/canadian_nutrient_file.manifest.json'
const SHARD_BASE_URL = '/data/shards/'

export const useShardLoader = () => {
  const db = useIndexedDB()

  const progress = ref<ShardLoadProgress>({
    currentShard: 0,
    totalShards: 0,
    currentShardName: '',
    bytesDownloaded: 0,
    totalBytes: 0,
    recordsLoaded: 0,
    totalRecords: 0,
    status: 'idle'
  })

  const error = ref<Error | null>(null)
  const isLoading = computed(() =>
    progress.value.status === 'checking' ||
    progress.value.status === 'downloading' ||
    progress.value.status === 'validating'
  )

  /**
   * Calculate SHA-256 checksum for validation
   */
  const calculateChecksum = async (data: string): Promise<string> => {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Fetch and parse the manifest file
   */
  const fetchManifest = async (): Promise<ManifestFile> => {
    try {
      const response = await fetch(MANIFEST_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.statusText}`)
      }
      return await response.json()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch manifest')
      throw error
    }
  }

  /**
   * Download a single shard file
   */
  const downloadShard = async (shard: ShardDescriptor): Promise<string> => {
    try {
      const response = await fetch(`${SHARD_BASE_URL}${shard.filename}`)
      if (!response.ok) {
        throw new Error(`Failed to download shard ${shard.id}: ${response.statusText}`)
      }
      return await response.text()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to download shard ${shard.id}`)
      throw error
    }
  }

  /**
   * Parse NDJSON (newline-delimited JSON) into array of records
   */
  const parseNDJSON = (ndjson: string): NutrientFile[] => {
    return ndjson
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => JSON.parse(line))
  }

  /**
   * Validate shard data against descriptor
   */
  const validateShard = async (
    data: string,
    shard: ShardDescriptor
  ): Promise<{ valid: boolean; error?: string }> => {
    try {
      // Check checksum
      const checksum = await calculateChecksum(data)
      if (checksum !== shard.checksum) {
        return {
          valid: false,
          error: `Checksum mismatch for shard ${shard.id}. Expected ${shard.checksum}, got ${checksum}`
        }
      }

      // Check record count
      const records = parseNDJSON(data)
      if (records.length !== shard.recordCount) {
        return {
          valid: false,
          error: `Record count mismatch for shard ${shard.id}. Expected ${shard.recordCount}, got ${records.length}`
        }
      }

      // Check size (allow 1% tolerance for line endings)
      const sizeBytes = new Blob([data]).size
      const sizeDiff = Math.abs(sizeBytes - shard.sizeBytes)
      const tolerance = shard.sizeBytes * 0.01
      if (sizeDiff > tolerance) {
        return {
          valid: false,
          error: `Size mismatch for shard ${shard.id}. Expected ${shard.sizeBytes} bytes, got ${sizeBytes} bytes`
        }
      }

      return { valid: true }
    } catch (err) {
      return {
        valid: false,
        error: err instanceof Error ? err.message : 'Unknown validation error'
      }
    }
  }

  /**
   * Load a single shard into IndexedDB
   */
  const loadShard = async (shard: ShardDescriptor): Promise<void> => {
    progress.value.currentShardName = shard.filename
    progress.value.status = 'downloading'

    // Check if shard already loaded
    const existingMetadata = await db.getShardMetadata(shard.id)
    if (existingMetadata?.status === 'loaded' && existingMetadata.checksum === shard.checksum) {
      console.log(`Shard ${shard.id} already loaded, skipping`)
      progress.value.currentShard++
      progress.value.recordsLoaded += shard.recordCount
      return
    }

    // Update shard metadata to 'downloading'
    const metadata: ShardMetadata = {
      id: shard.id,
      filename: shard.filename,
      checksum: shard.checksum,
      status: 'downloading',
      recordCount: shard.recordCount,
      sizeBytes: shard.sizeBytes,
      retryCount: existingMetadata?.retryCount || 0
    }
    await db.saveShardMetadata(metadata)

    try {
      // Download shard
      const data = await downloadShard(shard)
      progress.value.bytesDownloaded += shard.sizeBytes

      // Validate shard
      progress.value.status = 'validating'
      metadata.status = 'validating'
      await db.saveShardMetadata(metadata)

      const validation = await validateShard(data, shard)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Parse and store records
      const records = parseNDJSON(data)

      // Store records in nutrientsFile store
      // We use the shard index as part of the key to avoid collisions
      const shardIndex = parseInt(shard.id.replace('shard-', ''))
      const existingData = await db.get('nutrientsFile', shardIndex)

      if (existingData) {
        // Merge with existing data
        const mergedData = [...existingData, ...records]
        await db.put('nutrientsFile', mergedData, shardIndex)
      } else {
        await db.put('nutrientsFile', records, shardIndex)
      }

      // Update metadata to 'loaded'
      metadata.status = 'loaded'
      metadata.downloadedAt = new Date()
      metadata.validatedAt = new Date()
      await db.saveShardMetadata(metadata)

      // Update progress
      progress.value.currentShard++
      progress.value.recordsLoaded += records.length

    } catch (err) {
      // Update metadata to 'error'
      metadata.status = 'error'
      metadata.errorMessage = err instanceof Error ? err.message : 'Unknown error'
      metadata.retryCount = (metadata.retryCount || 0) + 1
      await db.saveShardMetadata(metadata)

      throw err
    }
  }

  /**
   * Check if dataset needs updating
   */
  const checkForUpdates = async (): Promise<{
    needsUpdate: boolean
    manifest?: ManifestFile
    currentVersion?: string
  }> => {
    try {
      const manifest = await fetchManifest()
      const currentVersion = await db.getCurrentManifestVersion()

      if (!currentVersion) {
        return { needsUpdate: true, manifest }
      }

      // Check if manifest version is newer
      const needsUpdate = manifest.version !== currentVersion.version

      return {
        needsUpdate,
        manifest,
        currentVersion: currentVersion.version
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to check for updates')
      throw err
    }
  }

  /**
   * Load all shards from manifest
   */
  const loadDataset = async (manifest?: ManifestFile): Promise<void> => {
    try {
      progress.value.status = 'checking'
      error.value = null

      // Fetch manifest if not provided
      const datasetManifest = manifest || await fetchManifest()

      // Initialize progress
      progress.value.totalShards = datasetManifest.shards.length
      progress.value.totalRecords = datasetManifest.totalRecords
      progress.value.totalBytes = datasetManifest.totalSizeBytes
      progress.value.currentShard = 0
      progress.value.bytesDownloaded = 0
      progress.value.recordsLoaded = 0

      // Load each shard sequentially
      for (const shard of datasetManifest.shards) {
        await loadShard(shard)
      }

      // Save manifest version
      const manifestVersion: ManifestVersion = {
        version: datasetManifest.version,
        generatedAt: new Date(datasetManifest.generatedAt),
        totalRecords: datasetManifest.totalRecords,
        totalSizeBytes: datasetManifest.totalSizeBytes,
        installedAt: new Date(),
        shardsLoaded: datasetManifest.shards.length,
        shardsTotal: datasetManifest.shards.length
      }
      await db.saveManifestVersion(manifestVersion)

      progress.value.status = 'complete'
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load dataset')
      progress.value.status = 'error'
      progress.value.errorMessage = error.value.message
      throw err
    }
  }

  /**
   * Reset progress state
   */
  const resetProgress = () => {
    progress.value = {
      currentShard: 0,
      totalShards: 0,
      currentShardName: '',
      bytesDownloaded: 0,
      totalBytes: 0,
      recordsLoaded: 0,
      totalRecords: 0,
      status: 'idle'
    }
    error.value = null
  }

  /**
   * Get all loaded nutrient records from all shards
   */
  const getAllNutrients = async (): Promise<NutrientFile[]> => {
    try {
      const allShards = await db.getAllShardMetadata()
      const loadedShards = allShards.filter(s => s.status === 'loaded')

      const allRecords: NutrientFile[] = []

      for (const shard of loadedShards) {
        const shardIndex = parseInt(shard.id.replace('shard-', ''))
        const records = await db.get('nutrientsFile', shardIndex)
        if (records) {
          allRecords.push(...records)
        }
      }

      return allRecords
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to get nutrients')
      throw err
    }
  }

  return {
    progress,
    error,
    isLoading,
    checkForUpdates,
    loadDataset,
    resetProgress,
    getAllNutrients
  }
}
