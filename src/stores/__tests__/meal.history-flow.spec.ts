import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMealStore, type Nutrient } from '../meal'
import { useSubjectStore } from '../subject'
import { mockSessions, mockMealHistory } from '@test/mocks/useIndexedDB.mock'

describe('Meal Store - History Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockSessions.clear()
    mockMealHistory.clear()
  })

  afterEach(() => {
    mockSessions.clear()
    mockMealHistory.clear()
  })

  it('tracks unsaved changes via hash and saves new history entry', async () => {
    const store = useMealStore()
    const subjectStore = useSubjectStore()

    await subjectStore.createSubject('History Subject')
    await store.loadOrCreateSession(subjectStore.activeSubjectId!)

    // Initially empty
    expect(store.hasUnsavedChanges).toBe(false)

    // Add nutrient and set initial hash
    await store.addEmptyNutrient()
    store.setInitialHash()
    expect(store.hasUnsavedChanges).toBe(false)

    // Update nutrient to create unsaved changes
    const n = store.currentNutrients[0]
    const updated: Nutrient = { ...n, name: 'Banana', quantity: 118, factor: 0.23 }
    await store.updateNutrient(updated)
    expect(store.hasUnsavedChanges).toBe(true)

    // Save to history
    const saveResult = await store.saveMealToHistory({ name: 'Breakfast', tags: ['fruit'] })
    expect(saveResult.success).toBe(true)
    expect(saveResult.entryId).toBeDefined()

    // Session cleared after save
    expect(store.currentNutrients.length).toBe(0)
    expect(store.hasUnsavedChanges).toBe(false)
  })

  it('loads from history and manages editing mode', async () => {
    const store = useMealStore()
    const subjectStore = useSubjectStore()

    await subjectStore.createSubject('History Subject')
    await store.loadOrCreateSession(subjectStore.activeSubjectId!)

    // Add nutrient and save
    await store.addEmptyNutrient()
    const n = store.currentNutrients[0]
    await store.updateNutrient({ ...n, name: 'Apple', quantity: 182, factor: 0.14 })
    const saveResult = await store.saveMealToHistory({ name: 'Lunch' })
    const entryId = saveResult.entryId!

    // Load from history (skip confirmation)
    const loadResult = await store.loadFromHistory(entryId, { skipConfirmation: true })
    expect(loadResult.success).toBe(true)
    expect(store.currentNutrients.length).toBeGreaterThan(0)

    // Discard and load again
    const discardResult = await store.discardAndLoad(entryId)
    expect(discardResult).toBe(true)

    // Save and load flow
    await store.addEmptyNutrient()
    const s = store.currentNutrients[0]
    await store.updateNutrient({ ...s, name: 'Bread', quantity: 60, factor: 0.41 })
    const saveAndLoadResult = await store.saveAndLoad(entryId, { notes: 'Updated' })
    expect(saveAndLoadResult).toBe(true)

    // Clear editing mode
    store.clearEditingMode()
    expect(store.editingHistoryId).toBeNull()
  })
})
