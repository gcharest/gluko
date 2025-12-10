import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMealStore, type Nutrient } from '../meal'
import { useSubjectStore } from '../subject'

// Mock the useIndexedDB composable
const mockSessions = new Map()

vi.mock('@/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    getAllByIndex: vi.fn().mockResolvedValue([]),
    saveSession: vi.fn((session: { id: string }) => {
      mockSessions.set(session.id, session)
      return Promise.resolve()
    }),
    getSessionsBySubject: vi.fn((subjectId: string) => {
      const sessions = Array.from(mockSessions.values()).filter(
        (s: { subjectId: string }) => s.subjectId === subjectId
      )
      return Promise.resolve(sessions)
    }),
    deleteSession: vi.fn((id: string) => {
      mockSessions.delete(id)
      return Promise.resolve()
    })
  })
}))

describe('Meal Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockSessions.clear()
  })

  afterEach(() => {
    mockSessions.clear()
  })

  describe('Session Management', () => {
    it('creates empty session for new subject', async () => {
      const store = useMealStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('Test Subject')

      expect(store.currentNutrients).toHaveLength(0)
      expect(store.nutrientEmpty).toBe(true)
    })

    it('loads existing draft session for subject', async () => {
      const store = useMealStore()
      const subjectStore = useSubjectStore()

      await subjectStore.createSubject('Test Subject')

      // Add nutrient to session
      await store.addEmptyNutrient()

      expect(store.currentNutrients).toHaveLength(1)
    })
  })

  describe('Nutrient Management', () => {
    beforeEach(async () => {
      const subjectStore = useSubjectStore()
      await subjectStore.createSubject('Test Subject')
    })

    it('adds empty nutrient to session', async () => {
      const store = useMealStore()

      const result = await store.addEmptyNutrient()

      expect(result).toBe(true)
      expect(store.currentNutrients).toHaveLength(1)
      expect(store.currentNutrients[0].name).toBe('Aliment')
      expect(store.currentNutrients[0].quantity).toBe(0)
      expect(store.currentNutrients[0].factor).toBe(0)
    })

    it('updates nutrient properties', async () => {
      const store = useMealStore()

      await store.addEmptyNutrient()
      const nutrient = store.currentNutrients[0]

      const updatedNutrient: Nutrient = {
        ...nutrient,
        name: 'Banana',
        quantity: 118,
        factor: 0.23
      }

      const result = await store.updateNutrient(updatedNutrient)

      expect(result).toBe(true)
      expect(store.currentNutrients[0].name).toBe('Banana')
      expect(store.currentNutrients[0].quantity).toBe(118)
      expect(store.currentNutrients[0].factor).toBe(0.23)
    })

    it('removes nutrient from session', async () => {
      const store = useMealStore()

      await store.addEmptyNutrient()
      const nutrient = store.currentNutrients[0]

      const result = await store.removeNutrient(nutrient)

      expect(result).toBe(true)
      expect(store.currentNutrients).toHaveLength(0)
    })

    it('returns false when updating non-existent nutrient', async () => {
      const store = useMealStore()

      const fakeNutrient: Nutrient = {
        id: 'non-existent-id',
        name: 'Test',
        quantity: 0,
        factor: 0
      }

      const result = await store.updateNutrient(fakeNutrient)

      expect(result).toBe(false)
    })

    it('returns false when removing non-existent nutrient', async () => {
      const store = useMealStore()

      const fakeNutrient: Nutrient = {
        id: 'non-existent',
        name: 'Test',
        quantity: 0,
        factor: 0
      }

      const result = await store.removeNutrient(fakeNutrient)
      expect(result).toBe(false)
    })
  })

  describe('Carb Calculations', () => {
    beforeEach(async () => {
      const subjectStore = useSubjectStore()
      await subjectStore.createSubject('Test Subject')
    })

    it('calculates total carbs from multiple nutrients', async () => {
      const store = useMealStore()

      // Add first nutrient: Banana (118g × 0.23 = 27.14g)
      await store.addEmptyNutrient()
      let nutrient = store.currentNutrients[0]
      await store.updateNutrient({
        ...nutrient,
        name: 'Banana',
        quantity: 118,
        factor: 0.23
      })

      // Add second nutrient: Bread (60g × 0.41 = 24.6g)
      await store.addEmptyNutrient()
      nutrient = store.currentNutrients[1]
      await store.updateNutrient({
        ...nutrient,
        name: 'Bread',
        quantity: 60,
        factor: 0.41
      })

      // Total should be 27.14 + 24.6 = 51.74
      expect(store.mealCarbs).toBeCloseTo(51.74, 1)
    })

    it('returns 0 carbs for empty session', () => {
      const store = useMealStore()

      expect(store.mealCarbs).toBe(0)
    })

    it('handles zero quantity nutrients', async () => {
      const store = useMealStore()

      await store.addEmptyNutrient()
      const nutrient = store.currentNutrients[0]
      await store.updateNutrient({
        ...nutrient,
        name: 'Test',
        quantity: 0,
        factor: 0.5
      })

      expect(store.mealCarbs).toBe(0)
    })

    it('handles zero factor nutrients', async () => {
      const store = useMealStore()

      await store.addEmptyNutrient()
      const nutrient = store.currentNutrients[0]
      await store.updateNutrient({
        ...nutrient,
        name: 'Test',
        quantity: 100,
        factor: 0
      })

      expect(store.mealCarbs).toBe(0)
    })
  })

  describe('Session Clearing', () => {
    beforeEach(async () => {
      const subjectStore = useSubjectStore()
      await subjectStore.createSubject('Test Subject')
    })

    it('clears all nutrients from session', async () => {
      const store = useMealStore()

      await store.addEmptyNutrient()
      await store.addEmptyNutrient()
      await store.addEmptyNutrient()

      expect(store.currentNutrients).toHaveLength(3)

      const result = await store.clearSession()

      expect(result).toBe(true)
      expect(store.currentNutrients).toHaveLength(0)
      expect(store.mealCarbs).toBe(0)
    })

    it('handles clearing empty session', async () => {
      const store = useMealStore()

      const result = await store.clearSession()

      expect(result).toBe(true)
      expect(store.currentNutrients).toHaveLength(0)
    })
  })

  describe('Computed Properties', () => {
    beforeEach(async () => {
      const subjectStore = useSubjectStore()
      await subjectStore.createSubject('Test Subject')
    })

    it('tracks nutrient count', async () => {
      const store = useMealStore()

      expect(store.nutrientCount).toBe(0)

      await store.addEmptyNutrient()
      expect(store.nutrientCount).toBe(1)

      await store.addEmptyNutrient()
      expect(store.nutrientCount).toBe(2)
    })

    it('tracks empty state', async () => {
      const store = useMealStore()

      expect(store.nutrientEmpty).toBe(true)

      await store.addEmptyNutrient()
      expect(store.nutrientEmpty).toBe(false)

      await store.clearSession()
      expect(store.nutrientEmpty).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('handles missing subject gracefully', async () => {
      const store = useMealStore()

      // Try to add nutrient without active subject  
      const result = await store.addEmptyNutrient()

      // Should return false but not throw
      expect(result).toBe(false)
    })
  })
})
