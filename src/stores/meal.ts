import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'
import { useSubjectStore } from './subject'
import { useMealHistoryStore } from './mealHistory'
import type { CalculationSession, MealHistoryEntry } from '@/types/meal-history'

export interface Nutrient {
  id: string
  name: string
  quantity: number
  factor: number
}

export const useMealStore = defineStore('mealStore', () => {
  const db = useIndexedDB()
  const subjectStore = useSubjectStore()
  const getUUID = () => crypto.randomUUID()

  // State
  const activeSessions = ref<Map<string, CalculationSession>>(new Map())
  const error = ref<Error | null>(null)
  const editingHistoryId = ref<string | null>(null)
  const initialNutrientsHash = ref<string | null>(null)

  // Load initial data
  const loadInitialData = async () => {
    try {
      // Wait for subject store to be ready
      await subjectStore.loadInitialData()

      if (!subjectStore.activeSubjects.length) {
        console.warn('No active subjects found, skipping session load')
        return
      }

      // Load all active sessions
      console.log('Loading draft sessions...')
      const sessions = await db.getAllByIndex('activeSessions', 'by-status', 'draft')
      console.log('Found sessions:', sessions)
      sessions.forEach((session) => {
        activeSessions.value.set(session.subjectId, session)
        console.log('Added session for subject:', session.subjectId)
      })

      // Create session for active subject if none exists
      const currentSubject = subjectStore.currentSubject
      if (currentSubject && !activeSessions.value.has(currentSubject.id)) {
        console.log('Creating new session for active subject:', currentSubject.id)
        await loadOrCreateSession(currentSubject.id)
      }
    } catch (err) {
      console.error('Failed to load initial data:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  // Initialize store
  loadInitialData()

  // Watch for subject changes
  watch(
    () => subjectStore.activeSubjectId,
    async (newId, oldId) => {
      if (oldId) {
        // Save current session for previous subject
        await saveSession(oldId)
      }
      if (newId) {
        // Load or create session for new subject
        await loadOrCreateSession(newId)
      }
    }
  )

  // Helper functions
  const getCurrentSession = () => {
    if (!subjectStore.currentSubject) return null
    return activeSessions.value.get(subjectStore.currentSubject.id) || null
  }

  // Getters
  const currentNutrients = computed(() => {
    const session = getCurrentSession()
    return session?.nutrients || []
  })

  const nutrientEmpty = computed(() => currentNutrients.value.length <= 0)

  const mealCarbs = computed(() =>
    currentNutrients.value.reduce(
      (totalCarbs: number, nutrient: Nutrient) => totalCarbs + nutrient.quantity * nutrient.factor,
      0
    )
  )

  const nutrientCount = computed(() => currentNutrients.value.length)

  // Actions
  async function loadOrCreateSession(subjectId: string): Promise<boolean> {
    try {
      // Check if we already have the session loaded
      if (activeSessions.value.has(subjectId)) return true

      // Try to load existing draft session
      const existingSessions = await db.getSessionsBySubject(subjectId)
      const draftSession = existingSessions.find((s) => s.status === 'draft')

      if (draftSession) {
        activeSessions.value.set(subjectId, draftSession)
        return true
      }

      // Create new session if none exists
      const newSession: CalculationSession = {
        id: getUUID(),
        subjectId,
        nutrients: [],
        created: new Date(),
        lastModified: new Date(),
        status: 'draft'
      }

      await db.saveSession(newSession)
      activeSessions.value.set(subjectId, newSession)
      return true
    } catch (err) {
      console.error('Failed to load or create session:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function saveSession(subjectId: string): Promise<boolean> {
    try {
      const session = activeSessions.value.get(subjectId)
      if (!session) return false

      const updatedSession = {
        ...session,
        lastModified: new Date()
      }

      await db.saveSession(updatedSession)
      activeSessions.value.set(subjectId, updatedSession)
      return true
    } catch (err) {
      console.error('Failed to save session:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function addNutrient(nutrient: Nutrient): Promise<boolean> {
    try {
      const session = getCurrentSession()
      if (!session) return false

      const updatedSession = {
        ...session,
        nutrients: [...session.nutrients, nutrient],
        lastModified: new Date()
      }

      await db.saveSession(updatedSession)
      activeSessions.value.set(session.subjectId, updatedSession)
      return true
    } catch (err) {
      console.error('Failed to add nutrient:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function addEmptyNutrient(): Promise<boolean> {
    const uuid = getUUID()
    return addNutrient({
      id: uuid,
      name: 'Aliment',
      quantity: 0,
      factor: 0
    })
  }

  async function removeNutrient(identifier: string | number | Nutrient): Promise<boolean> {
    try {
      const session = getCurrentSession()
      if (!session) return false

      let index = -1
      if (typeof identifier === 'string') {
        index = session.nutrients.findIndex((n) => n.id === identifier)
      } else if (typeof identifier === 'number') {
        index = identifier
      } else {
        index = session.nutrients.findIndex((n) => n.id === identifier.id)
      }

      if (index === -1 || index >= session.nutrients.length) return false

      const updatedNutrients = [...session.nutrients]
      updatedNutrients.splice(index, 1)

      const updatedSession = {
        ...session,
        nutrients: updatedNutrients,
        lastModified: new Date()
      }

      await db.saveSession(updatedSession)
      activeSessions.value.set(session.subjectId, updatedSession)
      return true
    } catch (err) {
      console.error('Failed to remove nutrient:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function updateNutrient(nutrient: Nutrient): Promise<boolean> {
    try {
      const session = getCurrentSession()
      if (!session) return false

      const index = session.nutrients.findIndex((n) => n.id === nutrient.id)
      if (index === -1) return false

      const updatedNutrients = [...session.nutrients]
      updatedNutrients[index] = nutrient

      const updatedSession = {
        ...session,
        nutrients: updatedNutrients,
        lastModified: new Date()
      }

      await db.saveSession(updatedSession)
      activeSessions.value.set(session.subjectId, updatedSession)
      return true
    } catch (err) {
      console.error('Failed to update nutrient:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function clearSession(): Promise<boolean> {
    try {
      const session = getCurrentSession()
      if (!session) return false

      const updatedSession = {
        ...session,
        nutrients: [],
        lastModified: new Date()
      }

      await db.saveSession(updatedSession)
      activeSessions.value.set(session.subjectId, updatedSession)
      return true
    } catch (err) {
      console.error('Failed to clear session:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function duplicateSessionTo(targetSubjectId: string): Promise<boolean> {
    try {
      const sourceSession = getCurrentSession()
      if (!sourceSession) return false

      // Create new session for target subject
      const newSession: CalculationSession = {
        id: getUUID(),
        subjectId: targetSubjectId,
        nutrients: sourceSession.nutrients.map((n) => ({
          ...n,
          id: getUUID() // Generate new IDs for duplicated nutrients
        })),
        created: new Date(),
        lastModified: new Date(),
        status: 'draft'
      }

      await db.saveSession(newSession)
      activeSessions.value.set(targetSubjectId, newSession)
      return true
    } catch (err) {
      console.error('Failed to duplicate session:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  // Helper: Create hash of nutrients array for comparison
  function hashNutrients(nutrients: Nutrient[]): string {
    return JSON.stringify(
      nutrients.map((n) => ({ id: n.id, quantity: n.quantity, factor: n.factor }))
    )
  }

  // Computed: Check if current session has unsaved changes
  const hasUnsavedChanges = computed(() => {
    const session = getCurrentSession()
    if (!session || session.nutrients.length === 0) return false

    // Check if all nutrients are empty (default values with 0 quantity/factor and default/empty name)
    const hasNonEmptyNutrients = session.nutrients.some((n) => {
      const hasData = n.quantity !== 0 || n.factor !== 0
      const hasCustomName = n.name !== '' && n.name !== 'Aliment'
      return hasData || hasCustomName
    })
    if (!hasNonEmptyNutrients) return false

    // Compare current state to initial state
    const currentHash = hashNutrients(session.nutrients)
    return initialNutrientsHash.value !== currentHash
  })

  // Action: Set initial hash when session starts/loads
  function setInitialHash() {
    const session = getCurrentSession()
    if (session) {
      initialNutrientsHash.value = hashNutrients(session.nutrients)
    } else {
      initialNutrientsHash.value = null
    }
  }

  // Action: Load history entry into calculator
  async function loadFromHistory(
    historyId: string,
    options?: { skipConfirmation?: boolean }
  ): Promise<{ success: boolean; reason?: string }> {
    // Check for unsaved changes
    if (!options?.skipConfirmation && hasUnsavedChanges.value) {
      return {
        success: false,
        reason: 'unsaved-changes'
      }
    }

    try {
      // Get history entry
      const entry = await db.getMealHistory(historyId)
      if (!entry) {
        throw new Error(`History entry not found: ${historyId}`)
      }

      // Ensure subject matches or switch subject
      if (subjectStore.activeSubjectId !== entry.subjectId) {
        await subjectStore.setActiveSubject(entry.subjectId)
      }

      // Clear current session
      await clearSession()

      // Load nutrients from history
      const session = getCurrentSession()
      if (!session) {
        throw new Error('No active session after clear')
      }

      // Deep copy nutrients to avoid mutation
      session.nutrients = entry.nutrients.map((n) => ({ ...n }))
      session.lastModified = new Date()

      // Set editing mode
      editingHistoryId.value = historyId

      // Save to IndexedDB
      await db.saveSession(session)

      // Set initial hash to track future changes
      setInitialHash()

      return { success: true }
    } catch (err) {
      console.error('Failed to load history entry:', err)
      return {
        success: false,
        reason: err instanceof Error ? err.message : 'unknown-error'
      }
    }
  }

  // Action: Save current meal (update history if editing, create new otherwise)
  async function saveMealToHistory(options?: {
    subjectId?: string
    name?: string
    notes?: string
    tags?: string[]
  }): Promise<{ success: boolean; entryId?: string }> {
    const session = getCurrentSession()
    if (!session || session.nutrients.length === 0) {
      return { success: false }
    }

    try {
      const now = new Date()
      const historyStore = useMealHistoryStore()

      // If editing existing entry, update it
      if (editingHistoryId.value) {
        const existingEntry = await db.getMealHistory(editingHistoryId.value)
        if (existingEntry) {
          const updatedEntry: MealHistoryEntry = {
            ...existingEntry,
            nutrients: session.nutrients,
            totalCarbs: mealCarbs.value,
            name: options?.name ?? existingEntry.name,
            notes: options?.notes ?? existingEntry.notes,
            tags: options?.tags ?? existingEntry.tags,
            metadata: {
              ...existingEntry.metadata,
              lastModified: now,
              version: existingEntry.metadata.version + 1
            }
          }

          await db.saveMealHistory(updatedEntry)

          // Update history store
          historyStore.updateEntryInStore(updatedEntry)

          // Clear editing mode
          editingHistoryId.value = null
          setInitialHash() // Reset dirty state

          return { success: true, entryId: updatedEntry.id }
        }
      }

      // Otherwise, create new entry
      const newEntry: MealHistoryEntry = {
        id: getUUID(),
        subjectId: options?.subjectId || session.subjectId,
        date: now,
        name: options?.name,
        notes: options?.notes,
        tags: options?.tags || [],
        nutrients: session.nutrients,
        totalCarbs: mealCarbs.value,
        metadata: {
          created: now,
          lastModified: now,
          version: 1,
          calculatedBy: 'user',
          createdFrom: session.id
        }
      }

      await db.saveMealHistory(newEntry)

      // Add to history store
      historyStore.addEntryToStore(newEntry)

      // Clear calculator
      await clearSession()
      editingHistoryId.value = null
      setInitialHash()

      return { success: true, entryId: newEntry.id }
    } catch (err) {
      console.error('Failed to save meal:', err)
      return { success: false }
    }
  }

  // Action: Discard current changes and optionally load history
  async function discardAndLoad(historyId?: string): Promise<boolean> {
    await clearSession()
    initialNutrientsHash.value = null
    editingHistoryId.value = null

    if (historyId) {
      const result = await loadFromHistory(historyId, { skipConfirmation: true })
      return result.success
    }

    return true
  }

  // Action: Save current then load history
  async function saveAndLoad(
    historyId: string,
    saveOptions?: { name?: string; notes?: string; tags?: string[] }
  ): Promise<boolean> {
    const saveResult = await saveMealToHistory(saveOptions)
    if (!saveResult.success) return false

    const loadResult = await loadFromHistory(historyId, { skipConfirmation: true })
    return loadResult.success
  }

  // Action: Clear editing mode (for duplicate flow)
  function clearEditingMode() {
    editingHistoryId.value = null
    setInitialHash() // Reset dirty tracking
  }

  return {
    // State
    currentNutrients,
    error,

    // Getters
    nutrientEmpty,
    mealCarbs,
    nutrientCount,
    hasUnsavedChanges,
    editingHistoryId: computed(() => editingHistoryId.value),

    // Actions
    addNutrient,
    addEmptyNutrient,
    removeNutrient,
    updateNutrient,
    clearSession,
    duplicateSessionTo,
    loadOrCreateSession,
    saveSession,
    loadFromHistory,
    saveMealToHistory,
    discardAndLoad,
    saveAndLoad,
    clearEditingMode,
    setInitialHash
  }
})
