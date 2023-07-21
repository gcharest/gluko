import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export type userSession = {
  dismissedExperimentNotice: boolean
}

export const userSessionStore = defineStore({
  id: 'userSession',
  state: () => ({
    userSession: useLocalStorage('userSession', {} as userSession)
  }),
  getters: {
    getUserSession(): userSession {
      return this.userSession
    }
  },
  actions: {
    initialize() {
      this.userSession = {
        dismissedExperimentNotice: false
      }
    },
    reset() {
      this.userSession = {
        dismissedExperimentNotice: false
      }
    }
  }
})
