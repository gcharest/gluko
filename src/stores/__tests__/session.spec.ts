import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserSessionStore } from '../session'

describe('User Session Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes and toggles experiment notice', async () => {
    const store = useUserSessionStore()

    // initialize should set default session and not throw
    await store.initialize()
    expect(store.getUserSession.dismissedExperimentNotice).toBe(false)

    // dismiss experiment notice
    await store.dismissExperimentNotice()
    expect(store.getUserSession.dismissedExperimentNotice).toBe(true)
  })

  it('updates user session', async () => {
    const store = useUserSessionStore()

    await store.updateUserSession({ dismissedExperimentNotice: true })
    expect(store.getUserSession.dismissedExperimentNotice).toBe(true)

    await store.reset()
    expect(store.getUserSession.dismissedExperimentNotice).toBe(false)
  })
})
