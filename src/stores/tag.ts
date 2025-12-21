import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'
import type { Tag } from '@/types/tag'

export const useTagStore = defineStore('tagStore', () => {
  const db = useIndexedDB()
  const getUUID = () => crypto.randomUUID()

  // State
  const tags = ref<Tag[]>([])
  const error = ref<Error | null>(null)

  // Load initial data
  const loadInitialData = async () => {
    try {
      const storedTags = await db.getAllTags()
      if (storedTags) {
        tags.value = storedTags
      }
    } catch (err) {
      console.error('Failed to load tags:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  // Initialize store
  loadInitialData()

  // Getters
  const sortedTags = computed(() => [...tags.value].sort((a, b) => a.name.localeCompare(b.name)))

  const tagById = computed(() => (id: string) => tags.value.find((tag) => tag.id === id))

  // Actions
  async function createTag(name: string, color?: string): Promise<Tag | null> {
    try {
      const newTag: Tag = {
        id: getUUID(),
        name,
        color,
        created: new Date(),
        lastModified: new Date()
      }

      await db.saveTag(newTag)
      tags.value.push(newTag)

      return newTag
    } catch (err) {
      console.error('Failed to create tag:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return null
    }
  }

  async function updateTag(tag: Tag): Promise<boolean> {
    try {
      const index = tags.value.findIndex((t) => t.id === tag.id)
      if (index === -1) return false

      const updatedTag = {
        ...tag,
        lastModified: new Date()
      }

      await db.saveTag(updatedTag)
      tags.value[index] = updatedTag
      return true
    } catch (err) {
      console.error('Failed to update tag:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function deleteTag(id: string): Promise<boolean> {
    try {
      const index = tags.value.findIndex((t) => t.id === id)
      if (index === -1) return false

      await db.removeTag(id)
      tags.value.splice(index, 1)
      return true
    } catch (err) {
      console.error('Failed to delete tag:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  return {
    // State
    tags,
    error,

    // Getters
    sortedTags,
    tagById,

    // Actions
    createTag,
    updateTag,
    deleteTag,
    loadInitialData
  }
})
