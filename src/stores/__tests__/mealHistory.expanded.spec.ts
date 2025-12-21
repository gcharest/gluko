import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMealHistoryStore } from '../mealHistory'
import { useSubjectStore } from '../subject'
import type { MealHistoryEntry } from '@/types/meal-history'

describe('Meal History Store - Expanded', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Entry CRUD Operations', () => {
    it('adds entry with nutrients and metadata', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      const subject = await subjectStore.createSubject('Test')
      expect(subject).toBeDefined()

      const entry = await history.addEntry(
        [
          { id: '1', name: 'Banana', quantity: 118, factor: 0.23 },
          { id: '2', name: 'Apple', quantity: 182, factor: 0.13 }
        ],
        100,
        {
          name: 'Breakfast',
          notes: 'Healthy breakfast',
          tags: ['morning', 'fruit']
        }
      )

      expect(entry).toBeDefined()
      expect(entry?.nutrients.length).toBe(2)
      expect(entry?.name).toBe('Breakfast')
      expect(entry?.tags).toContain('morning')
      expect(entry?.totalCarbs).toBe(100)
    })

    it('updates entry completely', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('Test')

      const entry = await history.addEntry([], 50, { name: 'Original' })
      expect(entry).toBeDefined()

      const updated = await history.updateEntry({
        ...entry!,
        name: 'Updated',
        notes: 'Updated notes',
        totalCarbs: 75,
        tags: ['lunch']
      })

      expect(updated).toBe(true)
      const found = history.entries.find((e) => e.id === entry!.id)
      expect(found?.name).toBe('Updated')
      expect(found?.totalCarbs).toBe(75)
      expect(found?.tags).toContain('lunch')
    })

    it('returns false when updating non-existent entry', async () => {
      const history = useMealHistoryStore()

      const result = await history.updateEntry({
        id: 'non-existent',
        subjectId: 'none',
        date: new Date(),
        name: 'Test',
        nutrients: [],
        totalCarbs: 0,
        tags: [],
        notes: '',
        metadata: {
          created: new Date(),
          lastModified: new Date(),
          version: 1,
          calculatedBy: 'current'
        }
      })

      expect(result).toBe(false)
    })

    it('duplicates entry with all properties', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('Test')

      const original = await history.addEntry(
        [{ id: '1', name: 'Nutrient', quantity: 100, factor: 0.5 }],
        50,
        {
          name: 'Original',
          notes: 'Notes here',
          tags: ['breakfast']
        }
      )

      expect(original).toBeDefined()

      const duplicate = await history.duplicateEntry(original!.id)

      expect(duplicate).toBeDefined()
      expect(duplicate?.name).toBe('Original')
      expect(duplicate?.totalCarbs).toBe(original!.totalCarbs)
      expect(duplicate?.nutrients.length).toBe(original!.nutrients.length)
      expect(duplicate?.tags).toEqual(original!.tags)
      expect(duplicate?.id).not.toBe(original!.id)
    })

    it('returns null when duplicating non-existent entry', async () => {
      const history = useMealHistoryStore()

      const result = await history.duplicateEntry('non-existent')

      expect(result).toBeNull()
    })

    it('deletes entry and removes from store', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('Test')

      const entry = await history.addEntry([], 50, { name: 'ToDelete' })
      const initialCount = history.entries.length

      const deleted = await history.deleteEntry(entry!.id)

      expect(deleted).toBe(true)
      expect(history.entries.length).toBe(initialCount - 1)
      expect(history.entries.find((e) => e.id === entry!.id)).toBeUndefined()
    })

    it('returns false when deleting non-existent entry', async () => {
      const history = useMealHistoryStore()

      const result = await history.deleteEntry('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('Filtering and Pagination', () => {
    beforeEach(async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('FilterTest')

      // Add 15 entries with various properties
      for (let i = 0; i < 15; i++) {
        await history.addEntry([], i * 10, {
          name: `Meal ${i}`,
          notes: i % 3 === 0 ? `Important meal ${i}` : '',
          tags: [i % 2 === 0 ? 'even' : 'odd', i % 3 === 0 ? 'special' : 'regular']
        })
      }
    })

    it('filters entries by search query', () => {
      const history = useMealHistoryStore()

      history.setSearchQuery('Meal 5')

      expect(history.filteredEntries.some((e) => e.name.includes('Meal 5'))).toBe(true)
    })

    it('filters entries by tags', () => {
      const history = useMealHistoryStore()

      history.setSelectedTags(['even'])

      const hasOnlyEven = history.filteredEntries.every((e) => e.tags.includes('even'))
      expect(hasOnlyEven).toBe(true)
    })

    it('filters entries by multiple tags (AND match)', () => {
      const history = useMealHistoryStore()

      history.setSelectedTags(['even', 'special'])

      const hasCorrectTags = history.filteredEntries.every((e) =>
        ['even', 'special'].every((tag) => e.tags.includes(tag))
      )
      expect(hasCorrectTags).toBe(true)
    })

    it('paginates filtered entries', () => {
      const history = useMealHistoryStore()

      history.setPage(2)
      expect(history.currentPage).toBe(2)

      const pageEntries = history.paginatedEntries
      // With fixed page size of 10 and 15 total entries, page 2 has 5
      expect(pageEntries.length).toBe(5)
    })

    it('calculates total pages correctly', () => {
      const history = useMealHistoryStore()

      const totalEntries = history.filteredEntries.length
      const expectedPages = Math.ceil(totalEntries / 10)
      expect(history.totalPages).toBe(expectedPages)
    })

    it('resets page when filters change', () => {
      const history = useMealHistoryStore()

      history.setPage(2)
      expect(history.currentPage).toBe(2)

      history.setSearchQuery('Meal 1')

      expect(history.currentPage).toBe(1)
    })

    it('handles empty filtered results', () => {
      const history = useMealHistoryStore()

      history.setSearchQuery('NonExistentMeal')

      expect(history.filteredEntries.length).toBe(0)
      expect(history.totalPages).toBe(0)
      expect(history.paginatedEntries.length).toBe(0)
    })
  })

  describe('Date Range Filtering', () => {
    it('filters entries by date range', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('DateTest')

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const entry1 = await history.addEntry([], 50, { name: 'Today' })

      // Manually update one entry's date to yesterday (simulating past entry)
      if (entry1) {
        const historicalEntry = { ...entry1, date: yesterday }
        await history.updateEntry(historicalEntry)
      }

      history.setDateRange(yesterday, today)

      // Should include entries within range
      expect(history.filteredEntries.length).toBeGreaterThan(0)
    })
  })

  describe('Getters and Computed', () => {
    beforeEach(async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('ComputedTest')

      await history.addEntry([], 100, { name: 'Entry1', tags: ['a'] })
      await history.addEntry([], 150, { name: 'Entry2', tags: ['b'] })
      await history.addEntry([], 200, { name: 'Entry3', tags: ['a', 'b'] })
    })

    it('provides total filtered entries count', () => {
      const history = useMealHistoryStore()

      expect(history.filteredEntries.length).toBeGreaterThan(0)
    })

    it('sorts entries by date descending', () => {
      const history = useMealHistoryStore()

      const sorted = history.filteredEntries
      if (sorted.length > 1) {
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].date.getTime()).toBeGreaterThanOrEqual(sorted[i + 1].date.getTime())
        }
      }
    })
  })

  describe('Export/Import Compatibility', () => {
    it('maintains entry structure for export', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('ExportTest')

      const entry = await history.addEntry(
        [{ id: '1', name: 'Rice', quantity: 150, factor: 0.28 }],
        42,
        {
          name: 'Dinner',
          notes: 'With vegetables',
          tags: ['dinner', 'healthy']
        }
      )

      expect(entry).toBeDefined()
      expect(entry?.id).toBeDefined()
      expect(entry?.subjectId).toBeDefined()
      expect(entry?.date).toBeInstanceOf(Date)
      expect(entry?.metadata.created).toBeInstanceOf(Date)
      expect(entry?.metadata.lastModified).toBeInstanceOf(Date)
      expect(entry?.nutrients).toBeInstanceOf(Array)
    })

    it('validates export data structure and imports with replace strategy', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('ImportExportTest')

      // Add some entries
      await history.addEntry([], 10, { name: 'IE1', tags: ['x'] })
      await history.addEntry([], 20, { name: 'IE2', tags: ['y'] })

      const exportData = history.exportHistory()
      const validation = history.validateImport(exportData)

      expect(validation.valid).toBe(true)
      expect(validation.entryCount).toBe(exportData.entries.length)

      // Import with replace should keep same count
      const result = await history.importHistory(exportData, 'replace')
      expect(result.errors.length).toBe(0)
      expect(result.imported).toBe(exportData.entries.length)
      expect(history.entries.length).toBe(exportData.entries.length)
    })

    it('imports with merge strategy skipping duplicates', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('MergeTest')

      // Create a single entry and export it
      const entry = await history.addEntry([], 33, { name: 'MergeEntry', tags: ['m'] })
      expect(entry).toBeDefined()
      const exportData = history.exportHistory()

      // Import with merge should skip duplicates
      const mergeResult = await history.importHistory(exportData, 'merge')
      expect(mergeResult.skipped).toBeGreaterThan(0)
      expect(mergeResult.imported).toBeGreaterThanOrEqual(0)
      expect(mergeResult.errors.length).toBe(0)
    })

    it('validation fails for malformed import data', () => {
      const history = useMealHistoryStore()

      const invalid1 = history.validateImport(null as unknown)
      expect(invalid1.valid).toBe(false)

      const invalid2 = history.validateImport({} as unknown)
      expect(invalid2.valid).toBe(false)
      expect(invalid2.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Tags and Statistics', () => {
    it('returns unique sorted tags', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('TagsStatsTest')

      await history.addEntry([], 10, { name: 'T1', tags: ['b', 'a'] })
      await history.addEntry([], 20, { name: 'T2', tags: ['a', 'c'] })
      await history.addEntry([], 30, { name: 'T3', tags: ['c', 'b'] })

      expect(history.allTags).toEqual(['a', 'b', 'c'])
    })

    it('computes statistics correctly across days', async () => {
      const history = useMealHistoryStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('StatsTest')

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const e1 = await history.addEntry([], 100, { name: 'S1' })
      const e2 = await history.addEntry([], 200, { name: 'S2' })
      const e3 = await history.addEntry([], 50, { name: 'S3' })

      // Move e3 to yesterday to create two days
      if (e3) {
        await history.updateEntry({ ...e3, date: yesterday })
      }

      const stats = history.statistics
      expect(stats.total).toBeGreaterThan(0)
      expect(stats.totalCarbs).toBe(350)
      expect(Math.round(stats.avgCarbs)).toBe(Math.round(350 / stats.total))
      expect(stats.daysTracked).toBeGreaterThanOrEqual(2)
      // Avg per day = average of per-day averages: ((150) + (50)) / 2 = 100
      expect(Math.round(stats.avgCarbsPerDay)).toBe(100)
    })
  })
})
