import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'
import type { Subject } from '@/types/meal-history'

export const useSubjectStore = defineStore('subjectStore', () => {
  const db = useIndexedDB()
  const getUUID = () => crypto.randomUUID()

  // State
  const subjects = ref<Subject[]>([])
  const activeSubjectId = ref<string | null>(null)
  const error = ref<Error | null>(null)

  // Load initial data
  const loadInitialData = async () => {
    try {
      const storedSubjects = await db.getAllSubjects()
      if (storedSubjects) {
        subjects.value = storedSubjects
      }

      // Create a default subject if none exist
      if (subjects.value.length === 0) {
        console.log('No subjects found, creating default subject')
        const defaultSubject = await createSubject('Default')
        if (!defaultSubject) {
          throw new Error('Failed to create default subject')
        }
      }

      // Load active subject from user account
      const userAccount = await db.getUserAccount('current')
      if (userAccount?.preferences.defaultSubjectId) {
        activeSubjectId.value = userAccount.preferences.defaultSubjectId
        console.log('Loaded active subject from user account:', activeSubjectId.value)
      } else if (subjects.value.length > 0) {
        // Set first active subject as default if none selected
        activeSubjectId.value = subjects.value.find(s => s.active)?.id || subjects.value[0].id
        console.log('Set first subject as active:', activeSubjectId.value)
      }
    } catch (err) {
      console.error('Failed to load subjects:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  // Initialize store
  loadInitialData()

  // Getters
  const activeSubjects = computed(() =>
    subjects.value.filter(subject => subject.active)
  )

  const currentSubject = computed(() =>
    subjects.value.find(subject => subject.id === activeSubjectId.value)
  )

  const subjectById = computed(() => (id: string) =>
    subjects.value.find(subject => subject.id === id)
  )

  const sortedSubjects = computed(() =>
    [...subjects.value].sort((a, b) => {
      // Active subjects first, then by name
      if (a.active !== b.active) return b.active ? 1 : -1
      return a.name.localeCompare(b.name)
    })
  )

  // Actions
  async function createSubject(name: string): Promise<Subject | null> {
    try {
      const newSubject: Subject = {
        id: getUUID(),
        name,
        active: true,
        created: new Date(),
        lastModified: new Date(),
        settings: {
          defaultMealTags: []
        }
      }

      await db.saveSubject(newSubject)
      subjects.value.push(newSubject)

      // If this is the first subject, make it active
      if (subjects.value.length === 1) {
        activeSubjectId.value = newSubject.id
        await updateUserPreference('defaultSubjectId', newSubject.id)
      }

      return newSubject
    } catch (err) {
      console.error('Failed to create subject:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return null
    }
  }

  async function updateSubject(subject: Subject): Promise<boolean> {
    try {
      const index = subjects.value.findIndex(s => s.id === subject.id)
      if (index === -1) return false

      const updatedSubject = {
        ...subject,
        lastModified: new Date()
      }

      await db.saveSubject(updatedSubject)
      subjects.value[index] = updatedSubject
      return true
    } catch (err) {
      console.error('Failed to update subject:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function deleteSubject(id: string): Promise<boolean> {
    try {
      const index = subjects.value.findIndex(s => s.id === id)
      if (index === -1) return false

      // Don't allow deleting the last subject
      if (subjects.value.length === 1) {
        throw new Error('Cannot delete the last subject')
      }

      // If deleting active subject, switch to another one
      if (id === activeSubjectId.value) {
        const newActive = subjects.value.find(s => s.id !== id && s.active)
        activeSubjectId.value = newActive?.id || subjects.value[0].id
        await updateUserPreference('defaultSubjectId', activeSubjectId.value)
      }

      await db.removeSubject(id)
      subjects.value.splice(index, 1)
      return true
    } catch (err) {
      console.error('Failed to delete subject:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function setActiveSubject(id: string): Promise<boolean> {
    try {
      const subject = subjects.value.find(s => s.id === id)
      if (!subject) return false

      activeSubjectId.value = id
      await updateUserPreference('defaultSubjectId', id)
      return true
    } catch (err) {
      console.error('Failed to set active subject:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function updateUserPreference(key: string, value: unknown): Promise<boolean> {
    try {
      const userAccount = await db.getUserAccount('current')
      if (!userAccount) return false

      const updatedAccount = {
        ...userAccount,
        preferences: {
          ...userAccount.preferences,
          [key]: value
        }
      }

      await db.saveUserAccount(updatedAccount)
      return true
    } catch (err) {
      console.error('Failed to update user preference:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  async function updateSubjectSettings(
    id: string,
    settings: Partial<Subject['settings']>
  ): Promise<boolean> {
    try {
      const subject = subjects.value.find(s => s.id === id)
      if (!subject) return false

      const updatedSubject = {
        ...subject,
        settings: {
          ...subject.settings,
          ...settings
        },
        lastModified: new Date()
      }

      await db.saveSubject(updatedSubject)
      const index = subjects.value.findIndex(s => s.id === id)
      subjects.value[index] = updatedSubject
      return true
    } catch (err) {
      console.error('Failed to update subject settings:', err)
      error.value = err instanceof Error ? err : new Error(String(err))
      return false
    }
  }

  return {
    // State
    subjects,
    activeSubjectId,
    error,

    // Getters
    activeSubjects,
    currentSubject,
    subjectById,
    sortedSubjects,

    // Actions
    createSubject,
    updateSubject,
    deleteSubject,
    setActiveSubject,
    updateSubjectSettings,
    loadInitialData
  }
})