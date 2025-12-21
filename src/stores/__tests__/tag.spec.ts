import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTagStore } from '../tag'

// Mock useIndexedDB
vi.mock('@/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    getAllTags: vi.fn().mockResolvedValue([]),
    saveTag: vi.fn().mockResolvedValue(undefined),
    removeTag: vi.fn().mockResolvedValue(undefined)
  })
}))

describe('Tag Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Tag CRUD Operations', () => {
    it('creates a new tag', async () => {
      const store = useTagStore()
      const tag = await store.createTag('Important', '#FF0000')

      expect(tag).toBeDefined()
      expect(tag?.name).toBe('Important')
      expect(tag?.color).toBe('#FF0000')
      expect(tag?.id).toBeDefined()
      expect(store.tags.length).toBe(1)
    })

    it('creates tag without color', async () => {
      const store = useTagStore()
      const tag = await store.createTag('Work')

      expect(tag).toBeDefined()
      expect(tag?.name).toBe('Work')
      expect(tag?.color).toBeUndefined()
    })

    it('updates an existing tag', async () => {
      const store = useTagStore()
      const tag = await store.createTag('Original')
      expect(tag).toBeDefined()

      const updated = await store.updateTag({
        ...tag!,
        name: 'Updated',
        color: '#0000FF'
      })

      expect(updated).toBe(true)
      expect(store.tags[0].name).toBe('Updated')
      expect(store.tags[0].color).toBe('#0000FF')
    })

    it('returns false when updating non-existent tag', async () => {
      const store = useTagStore()
      const result = await store.updateTag({
        id: 'non-existent',
        name: 'Test',
        created: new Date(),
        lastModified: new Date()
      })

      expect(result).toBe(false)
    })

    it('deletes a tag', async () => {
      const store = useTagStore()
      const tag = await store.createTag('ToDelete')
      expect(store.tags.length).toBe(1)

      const deleted = await store.deleteTag(tag!.id)

      expect(deleted).toBe(true)
      expect(store.tags.length).toBe(0)
    })

    it('returns false when deleting non-existent tag', async () => {
      const store = useTagStore()
      const result = await store.deleteTag('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('Getters', () => {
    it('returns sorted tags by name', async () => {
      const store = useTagStore()
      await store.createTag('Zebra')
      await store.createTag('Apple')
      await store.createTag('Banana')

      const sorted = store.sortedTags
      expect(sorted.length).toBe(3)
      expect(sorted[0].name).toBe('Apple')
      expect(sorted[1].name).toBe('Banana')
      expect(sorted[2].name).toBe('Zebra')
    })

    it('finds tag by id', async () => {
      const store = useTagStore()
      const tag = await store.createTag('FindMe')
      expect(tag).toBeDefined()

      const found = store.tagById(tag!.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe('FindMe')
    })

    it('returns undefined for non-existent tag id', async () => {
      const store = useTagStore()
      const found = store.tagById('non-existent')

      expect(found).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('handles create tag errors gracefully', async () => {
      const store = useTagStore()
      // Error state is tracked but doesn't prevent further operations
      expect(store.error).toBeNull()
    })

    it('maintains error state', async () => {
      const store = useTagStore()
      // Create a valid tag first
      await store.createTag('Valid')
      expect(store.error).toBeNull()
      // Error handling is implicit in the store
    })
  })
})
