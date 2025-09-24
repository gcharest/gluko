import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'

export interface UserSession {
  dismissedExperimentNotice: boolean
}

export const useUserSessionStore = defineStore('userSession', () => {
  // Initialize IndexedDB
  const db = useIndexedDB()

  // State
  const userSession = ref<UserSession>({
    dismissedExperimentNotice: false
  })

  // Load initial data
  const loadInitialData = async () => {
    try {
      const storedSession = await db.get('userSession', 'current')
      if (storedSession) {
        userSession.value = storedSession
      }
    } catch (error) {
      console.error('Failed to load initial user session:', error)
    }
  }

  // Load data when store is initialized
  loadInitialData()

  // Save helper
  const saveSession = async () => {
    try {
      await db.put('userSession', userSession.value, 'current')
    } catch (error) {
      console.error('Failed to save user session:', error)
    }
  }

  // Getters (computed)
  const getUserSession = computed(() => userSession.value)
  const hasExperimentNoticeBeenDismissed = computed(
    () => userSession.value.dismissedExperimentNotice
  )

  // Actions
  async function initialize() {
    try {
      userSession.value = {
        dismissedExperimentNotice: false
      }
      await saveSession()
    } catch (error) {
      console.error('Failed to initialize user session:', error)
    }
  }

  async function reset() {
    try {
      userSession.value = {
        dismissedExperimentNotice: false
      }
      await saveSession()
    } catch (error) {
      console.error('Failed to reset user session:', error)
    }
  }

  async function dismissExperimentNotice() {
    try {
      userSession.value.dismissedExperimentNotice = true
      await saveSession()
    } catch (error) {
      console.error('Failed to dismiss experiment notice:', error)
    }
  }

  async function updateUserSession(updates: Partial<UserSession>) {
    try {
      userSession.value = { ...userSession.value, ...updates }
      await saveSession()
    } catch (error) {
      console.error('Failed to update user session:', error)
    }
  }

  return {
    // State
    userSession,
    // Getters
    getUserSession,
    hasExperimentNoticeBeenDismissed,
    // Actions
    initialize,
    reset,
    dismissExperimentNotice,
    updateUserSession
  }
})
