import type { MealHistoryEntry } from './meal-history'

export interface HistoryExportMetadata {
  appVersion: string
  entryCount: number
  subjects: Array<{ id: string; name: string }>
  exportDate: string
}

export interface HistoryExport {
  version: string // Schema version, e.g., "1.0"
  exportedAt: string // ISO 8601 timestamp
  metadata: HistoryExportMetadata
  entries: MealHistoryEntry[]
}

export interface ImportValidationResult {
  valid: boolean
  errors: string[]
  version?: string
  entryCount?: number
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export type ImportStrategy = 'merge' | 'replace'
