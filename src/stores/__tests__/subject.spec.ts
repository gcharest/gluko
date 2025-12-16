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
})
