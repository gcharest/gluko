import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMealHistoryStore } from '../mealHistory'
import { useSubjectStore } from '../subject'

describe('Meal History Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds, updates, duplicates and deletes entries', async () => {
    const subjectStore = useSubjectStore()
    const history = useMealHistoryStore()

    const subject = await subjectStore.createSubject('Tester')
    expect(subject).toBeDefined()

    const entry = await history.addEntry([], 12, { name: 'Lunch', tags: ['a'] })
    expect(entry).toBeDefined()
    expect(history.entries.length).toBeGreaterThan(0)

    const updated = await history.updateEntry({ ...entry!, name: 'Lunch2' })
    expect(updated).toBe(true)

    const dup = await history.duplicateEntry(entry!.id)
    expect(dup).toBeDefined()

    const del = await history.deleteEntry(entry!.id)
    expect(del).toBe(true)
  })

  it('filters and paginates entries', async () => {
    const subjectStore = useSubjectStore()
    const history = useMealHistoryStore()

    await subjectStore.createSubject('FilterTest')

    // Add multiple entries with tags and dates
    for (let i = 0; i < 12; i++) {
      await history.addEntry([], i, { name: `N${i}`, tags: [i % 2 === 0 ? 'even' : 'odd'] })
    }

    // Ensure pagination works before filtering
    history.setPage(2)
    expect(history.currentPage).toBe(2)

    history.setSearchQuery('N1')
    expect(history.filteredEntries.length).toBeGreaterThan(0)

    history.setSelectedTags(['even'])
    expect(history.filteredEntries.every((e) => e.tags.includes('even'))).toBe(true)
  })
})
