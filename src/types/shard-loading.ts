/**
 * Type definitions for v0.3 shard-based dataset loading
 */

export interface ManifestFile {
  version: string              // Semantic version (e.g., "0.3.0")
  generatedAt: string          // ISO timestamp
  totalRecords: number         // Total food records across all shards
  totalSizeBytes: number       // Uncompressed size of all shards
  shards: ShardDescriptor[]
}

export interface ShardDescriptor {
  id: string                   // Unique shard identifier (e.g., "shard-0000")
  filename: string             // File name (e.g., "shard-0000.ndjson")
  checksum: string             // SHA-256 hash
  sizeBytes: number            // Uncompressed file size
  recordCount: number          // Number of records in shard
  recordRange?: {
    start: number              // First FoodID in shard
    end: number                // Last FoodID in shard
  }
}

export interface ShardMetadata {
  id: string                   // Matches ShardDescriptor.id
  filename: string
  checksum: string
  status: 'pending' | 'downloading' | 'validating' | 'loaded' | 'error'
  recordCount: number
  sizeBytes: number
  downloadedAt?: Date
  validatedAt?: Date
  errorMessage?: string
  retryCount?: number
}

export interface ManifestVersion {
  version: string
  generatedAt: Date
  totalRecords: number
  totalSizeBytes: number
  installedAt: Date
  shardsLoaded: number
  shardsTotal: number
}

export interface ShardLoadProgress {
  currentShard: number
  totalShards: number
  currentShardName: string
  bytesDownloaded: number
  totalBytes: number
  recordsLoaded: number
  totalRecords: number
  status: 'idle' | 'checking' | 'downloading' | 'validating' | 'complete' | 'error'
  errorMessage?: string
  estimatedTimeRemaining?: number
}

export interface StorageQuotaInfo {
  usage: number                // Bytes currently used
  quota: number                // Total bytes available
  available: number            // Bytes remaining
  percentUsed: number          // Percentage (0-100)
  hasEnoughSpace: boolean      // True if enough space for dataset
  estimatedSpaceNeeded: number // Estimated bytes needed
}
