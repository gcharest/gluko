import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../notification'

describe('notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Notification Management', () => {
    it('adds a notification', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Test message', 'info', {
        viewPath: '/settings',
        clearOnVisit: true
      })

      expect(id).toBeDefined()
      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].message).toBe('Test message')
      expect(store.notifications[0].variant).toBe('info')
    })

    it('removes a notification', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Test message', 'info')

      expect(store.notifications.length).toBe(1)

      store.removeNotification(id)

      expect(store.notifications.length).toBe(0)
    })

    it('marks notification as seen', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Test message', 'info')

      expect(store.notifications[0].seen).toBe(false)

      store.markAsSeen(id)

      expect(store.notifications[0].seen).toBe(true)
    })

    it('clears notifications for a view', () => {
      const store = useNotificationStore()
      store.addNotification('Test 1', 'info', {
        viewPath: '/settings',
        clearOnVisit: true
      })
      store.addNotification('Test 2', 'info', {
        viewPath: '/settings',
        clearOnVisit: true
      })
      store.addNotification('Test 3', 'info', {
        viewPath: '/about',
        clearOnVisit: true
      })

      expect(store.notifications.length).toBe(3)

      store.clearNotificationsForView('/settings')

      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].message).toBe('Test 3')
    })

    it('checks if view has unseen notifications', () => {
      const store = useNotificationStore()
      store.addNotification('Test', 'info', {
        viewPath: '/settings'
      })

      expect(store.hasUnseenNotifications('/settings')).toBe(true)
      expect(store.hasUnseenNotifications('/about')).toBe(false)
    })

    it('gets unseen count for a view', () => {
      const store = useNotificationStore()
      store.addNotification('Test 1', 'info', {
        viewPath: '/settings'
      })
      store.addNotification('Test 2', 'info', {
        viewPath: '/settings'
      })
      const id = store.addNotification('Test 3', 'info', {
        viewPath: '/settings'
      })

      expect(store.getUnseenCount('/settings')).toBe(3)

      store.markAsSeen(id)

      expect(store.getUnseenCount('/settings')).toBe(2)
    })

    it('clears all notifications', () => {
      const store = useNotificationStore()
      store.addNotification('Test 1', 'info')
      store.addNotification('Test 2', 'error')
      store.addNotification('Test 3', 'warning')

      expect(store.notifications.length).toBe(3)

      store.clearAll()

      expect(store.notifications.length).toBe(0)
    })

    it('tracks total unseen count', () => {
      const store = useNotificationStore()
      store.addNotification('Test 1', 'info')
      store.addNotification('Test 2', 'info')
      const id = store.addNotification('Test 3', 'info')

      expect(store.totalUnseenCount).toBe(3)

      store.markAsSeen(id)

      expect(store.totalUnseenCount).toBe(2)
    })
  })
})
