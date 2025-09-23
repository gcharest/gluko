import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

export interface UserSession {
  dismissedExperimentNotice: boolean
}

export const useUserSessionStore = defineStore('userSession', () => {
  // State
  const userSession = useLocalStorage('userSession', {
    dismissedExperimentNotice: false
  } as UserSession)

  // Getters (computed)
  const getUserSession = computed(() => userSession.value)
  const hasExperimentNoticeBeenDismissed = computed(() => userSession.value.dismissedExperimentNotice)

  // Actions
  function initialize() {
    try {
      userSession.value = {
        dismissedExperimentNotice: false
      }
    } catch (error) {
      console.error('Failed to initialize user session:', error)
    }
  }

  function reset() {
    try {
      userSession.value = {
        dismissedExperimentNotice: false
      }
    } catch (error) {
      console.error('Failed to reset user session:', error)
    }
  }

  function dismissExperimentNotice() {
    try {
      userSession.value.dismissedExperimentNotice = true
    } catch (error) {
      console.error('Failed to dismiss experiment notice:', error)
    }
  }

  function updateUserSession(updates: Partial<UserSession>) {
    try {
      userSession.value = { ...userSession.value, ...updates }
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
