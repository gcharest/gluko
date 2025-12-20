import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSubjectStore } from '../subject'

describe('Subject Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates, updates, sets active and deletes subjects', async () => {
    const store = useSubjectStore()

    const s1 = await store.createSubject('Alpha')
    expect(s1).toBeDefined()
    expect(store.subjects.length).toBeGreaterThanOrEqual(1)

    const updated = await store.updateSubject({ ...s1!, name: 'Alpha2' })
    expect(updated).toBe(true)
    expect(store.subjects[0].name).toBe('Alpha2')

    const setActive = await store.setActiveSubject(s1!.id)
    expect(setActive).toBe(true)

    const deleted = await store.deleteSubject(s1!.id)
    expect(deleted).toBe(true)

    const remaining = store.subjects[0]
    const deletedLast = await store.deleteSubject(remaining.id)
    expect(deletedLast).toBe(false)
  })

  describe('Getters', () => {
    it('returns active subjects', async () => {
      const store = useSubjectStore()
      await store.loadInitialData()
      expect(store.activeSubjects.length).toBeGreaterThan(0)
      store.activeSubjects.forEach((subject) => {
        expect(subject.active).toBe(true)
      })
    })

    it('returns current subject', async () => {
      const store = useSubjectStore()
      await store.loadInitialData()
      const currentSubject = store.currentSubject
      expect(currentSubject).toBeDefined()
      expect(currentSubject?.id).toBe(store.activeSubjectId)
    })

    it('finds subject by id', async () => {
      const store = useSubjectStore()
      await store.loadInitialData()
      const subject = store.subjects[0]
      const found = store.subjectById(subject.id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(subject.id)
    })

    it('returns sorted subjects', async () => {
      const store = useSubjectStore()
      await store.loadInitialData()
      await store.createSubject('Zebra')
      await store.createSubject('Apple')
      const sorted = store.sortedSubjects
      expect(sorted.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Subject Updates', () => {
    it('returns false when updating non-existent subject', async () => {
      const store = useSubjectStore()
      const result = await store.updateSubject({
        id: 'non-existent-id',
        name: 'Test',
        active: true,
        created: new Date(),
        lastModified: new Date(),
        settings: { defaultMealTags: [] }
      })
      expect(result).toBe(false)
    })
  })

  describe('Subject Settings', () => {
    it('updates subject settings', async () => {
      const store = useSubjectStore()
      await store.loadInitialData()
      const subject = store.subjects[0]
      const newTags = ['breakfast', 'lunch']
      const result = await store.updateSubjectSettings(subject.id, {
        defaultMealTags: newTags
      })
      expect(result).toBe(true)
      const updated = store.subjects.find((s) => s.id === subject.id)
      expect(updated).toBeDefined()
      expect(updated?.settings?.defaultMealTags).toEqual(newTags)
    })

    it('returns false when updating settings for non-existent subject', async () => {
      const store = useSubjectStore()
      await store.loadInitialData()
      const result = await store.updateSubjectSettings('non-existent-id', {
        defaultMealTags: ['test']
      })
      expect(result).toBe(false)
    })
  })

  describe('Active Subject Management', () => {
    it('returns false when setting non-existent subject as active', async () => {
      const store = useSubjectStore()
      const result = await store.setActiveSubject('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('Subject Deletion', () => {
    it('returns false when deleting non-existent subject', async () => {
      const store = useSubjectStore()
      const result = await store.deleteSubject('non-existent-id')
      expect(result).toBe(false)
    })
  })
})
