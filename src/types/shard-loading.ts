/**
 * Type definitions for v0.3 shard-based dataset loading
 * Updated to match ETL-generated manifest format
 */

export interface ManifestFile {
  version: string // Semantic version (e.g., "1.0")
  generatedAt: string // ISO timestamp
  totalRecords: number // Total food records across all shards
  totalBytes: number // Uncompressed size of all shards (from ETL)
  shardKey?: string // Optional: sharding strategy (e.g., "FoodID_range")
  shardSize?: number // Optional: target shard size
  compression?: string[] // Optional: compression methods used
  shards: ShardDescriptor[]
}

export interface ShardDescriptor {
  file: string // File name (e.g., "shard-0000.ndjson")
  count: number // Number of records in shard
  bytes: number // Uncompressed file size
  uncompressedBytes: number // Uncompressed size (same as bytes for uncompressed)
  sha256: string // SHA-256 hash
  firstFoodID?: string // First FoodID in shard (optional)
  lastFoodID?: string // Last FoodID in shard (optional)
  minFoodID?: number // Minimum FoodID (numeric, optional)
  maxFoodID?: number // Maximum FoodID (numeric, optional)
}

export interface ShardMetadata {
  id: string // Shard file name (e.g., "shard-0000.ndjson")
  filename: string // Same as id
  checksum: string // SHA-256 hash
  status: 'pending' | 'downloading' | 'validating' | 'loaded' | 'error'
  recordCount: number // Number of records
  sizeBytes: number // File size in bytes
  downloadedAt?: Date
  validatedAt?: Date
  errorMessage?: string
  retryCount?: number
}

export interface ManifestVersion {
  version: string // Manifest version (e.g., "1.0")
  generatedAt: Date // When manifest was generated
  totalRecords: number // Total records across all shards
  totalBytes: number // Total bytes (renamed from totalSizeBytes)
  installedAt: Date // When installed locally
  shardsLoaded: number // Number of shards loaded
  shardsTotal: number // Total number of shards
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
  usage: number // Bytes currently used
  quota: number // Total bytes available
  available: number // Bytes remaining
  percentUsed: number // Percentage (0-100)
  hasEnoughSpace: boolean // True if enough space for dataset
  estimatedSpaceNeeded: number // Estimated bytes needed
}
