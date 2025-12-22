import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'
import { useSubjectStore } from './subject'
import type { MealHistoryEntry } from '@/types/meal-history'
import type { Nutrient } from '@/stores/meal'
import type {
  HistoryExport,
  ImportValidationResult,
  ImportResult,
  ImportStrategy
} from '@/types/history-export'

const ENTRIES_PER_PAGE = 10

export const useMealHistoryStore = defineStore('mealHistoryStore', () => {
  const db = useIndexedDB()
  const subjectStore = useSubjectStore()
  const getUUID = () => crypto.randomUUID()

  // State
  const entries = ref<MealHistoryEntry[]>([])
  const currentPage = ref(1)
  const searchQuery = ref('')
  const selectedTags = ref<string[]>([])
  const dateRange = ref<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const error = ref<Error | null>(null)

  // Load initial data
  const loadInitialData = async () => {
    try {
      if (subjectStore.activeSubjectId === null) {
        // Load all entries when "All Subjects" is selected
        const allEntries = await db.getAllMealHistory()
        if (allEntries) {
          entries.value = allEntries.sort(
            (a: MealHistoryEntry, b: MealHistoryEntry) => b.date.getTime() - a.date.getTime()
          )
        }
      } else if (subjectStore.currentSubject) {
        // Load entries for specific subject
        const subjectEntries = await db.getMealHistoryBySubject(subjectStore.currentSubject.id)
        if (subjectEntries) {
          entries.value = subjectEntries.sort(
            (a: MealHistoryEntry, b: MealHistoryEntry) => b.date.getTime() - a.date.getTime()
          )
        }
      }
    } catch (err) {
      console.error('Failed to load meal history:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  // Watch for subject changes and reload data
  watch(
    () => subjectStore.activeSubjectId,
    async () => {
      await loadInitialData()
    }
  )

  // Initialize store
  loadInitialData()

  // Getters
  const filteredEntries = computed(() => {
    let filtered = [...entries.value]

    // Apply search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.name?.toLowerCase().includes(query) ||
          entry.notes?.toLowerCase().includes(query) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Apply tag filters
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedTags.value.every((tag) => entry.tags.includes(tag))
      )
    }

    // Apply date range
    if (dateRange.value.start) {
      filtered = filtered.filter((entry) => entry.date >= dateRange.value.start!)
    }
    if (dateRange.value.end) {
      filtered = filtered.filter((entry) => entry.date <= dateRange.value.end!)
    }

    return filtered
  })

  const paginatedEntries = computed(() => {
    const start = (currentPage.value - 1) * ENTRIES_PER_PAGE
    return filteredEntries.value.slice(start, start + ENTRIES_PER_PAGE)
  })

  const totalPages = computed(() => Math.ceil(filteredEntries.value.length / ENTRIES_PER_PAGE))

  const allTags = computed(() => {
    const tags = new Set<string>()
    entries.value.forEach((entry) => entry.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  })

  const statistics = computed(() => {
    const total = entries.value.length
    const totalCarbs = entries.value.reduce((sum, entry) => sum + entry.totalCarbs, 0)
    const avgCarbs = total > 0 ? totalCarbs / total : 0

    // Calculate daily averages
    const dailyStats = new Map<string, { count: number; totalCarbs: number }>()
    entries.value.forEach((entry) => {
      const dateKey = entry.date.toISOString().split('T')[0]
      const stats = dailyStats.get(dateKey) || { count: 0, totalCarbs: 0 }
      stats.count++
      stats.totalCarbs += entry.totalCarbs
      dailyStats.set(dateKey, stats)
    })

    const avgCarbsPerDay =
      Array.from(dailyStats.values()).reduce(
        (sum, { totalCarbs, count }) => sum + totalCarbs / count,
        0
      ) / dailyStats.size || 0

    return {
      total,
      totalCarbs,
      avgCarbs,
      avgCarbsPerDay,
      daysTracked: dailyStats.size
    }
  })

  // Actions
  async function addEntry(
    nutrients: Nutrient[],
    totalCarbs: number,
    options: {
      name?: string
      notes?: string
      tags?: string[]
    } = {}
  ): Promise<MealHistoryEntry | null> {
    try {
      if (!subjectStore.currentSubject) {
        throw new Error('No active subject selected')
      }

      const entry: MealHistoryEntry = {
        id: getUUID(),
        subjectId: subjectStore.currentSubject.id,
        date: new Date(),
        nutrients: [...nutrients],
        totalCarbs,
        name: options.name,
        notes: options.notes,
        tags: options.tags || [],
        metadata: {
          created: new Date(),
          lastModified: new Date(),
          version: 1,
          calculatedBy: 'current' // TODO: Replace with actual user ID when auth is implemented
        }
      }

      await db.saveMealHistory(entry)
      entries.value.unshift(entry) // Add to beginning of array
      return entry
    } catch (err) {
      console.error('Failed to add meal history entry:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return null
    }
  }

  async function updateEntry(entry: MealHistoryEntry): Promise<boolean> {
    try {
      const index = entries.value.findIndex((e) => e.id === entry.id)
      if (index === -1) return false

      const updatedEntry = {
        ...entry,
        metadata: {
          ...entry.metadata,
          lastModified: new Date()
        }
      }

      await db.saveMealHistory(updatedEntry)
      entries.value[index] = updatedEntry
      // Re-sort entries in case date changed
      entries.value.sort((a, b) => b.date.getTime() - a.date.getTime())
      return true
    } catch (err) {
      console.error('Failed to update meal history entry:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  // Add entry to store (used when meal store creates new history entry)
  function addEntryToStore(entry: MealHistoryEntry) {
    entries.value.push(entry)
    entries.value.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  // Update entry in store (used when meal store updates history entry)
  function updateEntryInStore(updatedEntry: MealHistoryEntry) {
    const index = entries.value.findIndex((e) => e.id === updatedEntry.id)
    if (index !== -1) {
      entries.value[index] = updatedEntry
      // Re-sort if date changed
      entries.value.sort((a, b) => b.date.getTime() - a.date.getTime())
    }
  }

  async function deleteEntry(id: string): Promise<boolean> {
    try {
      const index = entries.value.findIndex((e) => e.id === id)
      if (index === -1) return false

      await db.removeMealHistory(id)
      entries.value.splice(index, 1)
      return true
    } catch (err) {
      console.error('Failed to delete meal history entry:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function duplicateEntry(id: string): Promise<MealHistoryEntry | null> {
    try {
      const entry = entries.value.find((e) => e.id === id)
      if (!entry) return null

      const duplicate: MealHistoryEntry = {
        ...entry,
        id: getUUID(),
        date: new Date(),
        metadata: {
          created: new Date(),
          lastModified: new Date(),
          version: 1,
          createdFrom: entry.id,
          calculatedBy: 'current' // TODO: Replace with actual user ID when auth is implemented
        }
      }

      await db.saveMealHistory(duplicate)
      entries.value.unshift(duplicate)
      return duplicate
    } catch (err) {
      console.error('Failed to duplicate meal history entry:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return null
    }
  }

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page when search changes
  }

  function setSelectedTags(tags: string[]) {
    selectedTags.value = tags
    currentPage.value = 1
  }

  function setDateRange(start: Date | null, end: Date | null) {
    dateRange.value = { start, end }
    currentPage.value = 1
  }

  // Export history to JSON
  function exportHistory(options?: { subjectId?: string }): HistoryExport {
    const entriesToExport = options?.subjectId
      ? entries.value.filter((e) => e.subjectId === options.subjectId)
      : entries.value

    // Get unique subjects
    const subjectIds = new Set(entriesToExport.map((e) => e.subjectId))
    const subjects = Array.from(subjectIds)
      .map((id) => {
        const subject = subjectStore.subjects.find((s) => s.id === id)
        return subject ? { id: subject.id, name: subject.name } : null
      })
      .filter((s): s is { id: string; name: string } => s !== null)

    const exportData: HistoryExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      metadata: {
        appVersion: import.meta.env.VITE_APP_VERSION || '0.6.0',
        entryCount: entriesToExport.length,
        subjects,
        exportDate: new Date().toISOString()
      },
      entries: entriesToExport
    }

    return exportData
  }

  // Validate import data structure
  function validateImport(data: unknown): ImportValidationResult {
    const errors: string[] = []

    if (!data || typeof data !== 'object') {
      errors.push('Invalid file format')
      return { valid: false, errors }
    }

    const importData = data as Partial<HistoryExport>

    if (!importData.version) {
      errors.push('Missing schema version')
    }

    if (!importData.exportedAt) {
      errors.push('Missing export timestamp')
    }

    if (!importData.entries || !Array.isArray(importData.entries)) {
      errors.push('Missing or invalid entries array')
    }

    if (!importData.metadata) {
      errors.push('Missing metadata')
    }

    // Check version compatibility
    if (importData.version && importData.version !== '1.0') {
      errors.push(`Unsupported schema version: ${importData.version}`)
    }

    return {
      valid: errors.length === 0,
      errors,
      version: importData.version,
      entryCount: importData.entries?.length
    }
  }

  // Import history from JSON
  async function importHistory(
    data: HistoryExport,
    strategy: ImportStrategy
  ): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: []
    }

    try {
      if (strategy === 'replace') {
        // Clear existing entries
        for (const entry of entries.value) {
          await db.removeMealHistory(entry.id)
        }
        entries.value = []
      }

      // Import entries
      for (const entry of data.entries) {
        try {
          // Check if entry already exists (for merge strategy)
          const existing = entries.value.find((e) => e.id === entry.id)

          if (existing && strategy === 'merge') {
            result.skipped++
            continue
          }

          // Ensure dates are Date objects
          const importedEntry: MealHistoryEntry = {
            ...entry,
            date: new Date(entry.date),
            metadata: {
              ...entry.metadata,
              created: new Date(entry.metadata.created),
              lastModified: new Date(entry.metadata.lastModified)
            }
          }

          await db.saveMealHistory(importedEntry)
          entries.value.push(importedEntry)
          result.imported++
        } catch (err) {
          result.errors.push(`Failed to import entry ${entry.id}: ${err}`)
        }
      }

      // Re-sort entries
      entries.value.sort((a, b) => b.date.getTime() - a.date.getTime())
    } catch (err) {
      result.errors.push(`Import failed: ${err}`)
    }

    return result
  }

  return {
    // State
    entries,
    currentPage,
    searchQuery,
    selectedTags,
    dateRange,
    error,

    // Getters
    filteredEntries,
    paginatedEntries,
    totalPages,
    allTags,
    statistics,

    // Actions
    addEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    setPage,
    setSearchQuery,
    setSelectedTags,
    setDateRange,
    loadInitialData,
    addEntryToStore,
    updateEntryInStore,
    exportHistory,
    validateImport,
    importHistory
  }
})
