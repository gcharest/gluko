import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../notification'

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addNotification', () => {
    it('adds a notification', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Test message', 'info')

      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].id).toBe(id)
      expect(store.notifications[0].message).toBe('Test message')
      expect(store.notifications[0].variant).toBe('info')
      expect(store.notifications[0].seen).toBe(false)
    })

    it('adds a notification with context', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Settings updated', 'success', {
        viewPath: '/settings',
        section: 'dataset',
        clearOnVisit: true
      })

      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].context?.viewPath).toBe('/settings')
      expect(store.notifications[0].context?.section).toBe('dataset')
      expect(store.notifications[0].context?.clearOnVisit).toBe(true)
    })

    it('generates unique IDs for multiple notifications', () => {
      const store = useNotificationStore()
      const id1 = store.addNotification('First', 'info')
      const id2 = store.addNotification('Second', 'warning')

      expect(id1).not.toBe(id2)
      expect(store.notifications.length).toBe(2)
    })
  })

  describe('removeNotification', () => {
    it('removes a notification by ID', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Test', 'info')

      expect(store.notifications.length).toBe(1)

      store.removeNotification(id)

      expect(store.notifications.length).toBe(0)
    })

    it('does nothing when removing non-existent ID', () => {
      const store = useNotificationStore()
      store.addNotification('Test', 'info')

      store.removeNotification('non-existent-id')

      expect(store.notifications.length).toBe(1)
    })
  })

  describe('markAsSeen', () => {
    it('marks a notification as seen', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Test', 'info')

      expect(store.notifications[0].seen).toBe(false)

      store.markAsSeen(id)

      expect(store.notifications[0].seen).toBe(true)
    })

    it('does nothing when marking non-existent ID', () => {
      const store = useNotificationStore()
      store.addNotification('Test', 'info')

      store.markAsSeen('non-existent-id')

      expect(store.notifications[0].seen).toBe(false)
    })
  })

  describe('clearNotificationsForView', () => {
    it('clears notifications with clearOnVisit for the view', () => {
      const store = useNotificationStore()
      store.addNotification('Update available', 'info', {
        viewPath: '/settings',
        clearOnVisit: true
      })
      store.addNotification('Persistent message', 'warning', {
        viewPath: '/settings',
        clearOnVisit: false
      })

      expect(store.notifications.length).toBe(2)

      store.clearNotificationsForView('/settings')

      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].message).toBe('Persistent message')
    })

    it('does not clear notifications for other views', () => {
      const store = useNotificationStore()
      store.addNotification('Settings notification', 'info', {
        viewPath: '/settings',
        clearOnVisit: true
      })
      store.addNotification('History notification', 'info', {
        viewPath: '/history',
        clearOnVisit: true
      })

      store.clearNotificationsForView('/settings')

      expect(store.notifications.length).toBe(1)
      expect(store.notifications[0].message).toBe('History notification')
    })
  })

  describe('getNotificationsForView', () => {
    it('returns notifications for a specific view', () => {
      const store = useNotificationStore()
      store.addNotification('Settings notification', 'info', {
        viewPath: '/settings'
      })
      store.addNotification('History notification', 'info', {
        viewPath: '/history'
      })

      const settingsNotifications = store.getNotificationsForView('/settings')

      expect(settingsNotifications.length).toBe(1)
      expect(settingsNotifications[0].message).toBe('Settings notification')
    })

    it('returns empty array when no notifications for view', () => {
      const store = useNotificationStore()
      const notifications = store.getNotificationsForView('/settings')

      expect(notifications.length).toBe(0)
    })
  })

  describe('getUnseenNotificationsForView', () => {
    it('returns only unseen notifications for a view', () => {
      const store = useNotificationStore()
      const id1 = store.addNotification('Unseen', 'info', {
        viewPath: '/settings'
      })
      const id2 = store.addNotification('Seen', 'info', {
        viewPath: '/settings'
      })

      store.markAsSeen(id2)

      const unseenNotifications = store.getUnseenNotificationsForView('/settings')

      expect(unseenNotifications.length).toBe(1)
      expect(unseenNotifications[0].id).toBe(id1)
    })
  })

  describe('hasUnseenNotifications', () => {
    it('returns true when view has unseen notifications', () => {
      const store = useNotificationStore()
      store.addNotification('Test', 'info', {
        viewPath: '/settings'
      })

      expect(store.hasUnseenNotifications('/settings')).toBe(true)
    })

    it('returns false when view has no unseen notifications', () => {
      const store = useNotificationStore()
      const id = store.addNotification('Test', 'info', {
        viewPath: '/settings'
      })

      store.markAsSeen(id)

      expect(store.hasUnseenNotifications('/settings')).toBe(false)
    })

    it('returns false when view has no notifications', () => {
      const store = useNotificationStore()

      expect(store.hasUnseenNotifications('/settings')).toBe(false)
    })
  })

  describe('getUnseenCount', () => {
    it('returns count of unseen notifications for a view', () => {
      const store = useNotificationStore()
      store.addNotification('First', 'info', {
        viewPath: '/settings'
      })
      store.addNotification('Second', 'info', {
        viewPath: '/settings'
      })
      const id3 = store.addNotification('Third', 'info', {
        viewPath: '/settings'
      })

      store.markAsSeen(id3)

      expect(store.getUnseenCount('/settings')).toBe(2)
    })

    it('returns 0 when no unseen notifications', () => {
      const store = useNotificationStore()

      expect(store.getUnseenCount('/settings')).toBe(0)
    })
  })

  describe('clearAll', () => {
    it('clears all notifications', () => {
      const store = useNotificationStore()
      store.addNotification('First', 'info')
      store.addNotification('Second', 'warning')
      store.addNotification('Third', 'error')

      expect(store.notifications.length).toBe(3)

      store.clearAll()

      expect(store.notifications.length).toBe(0)
    })
  })

  describe('totalUnseenCount', () => {
    it('returns total count of unseen notifications across all views', () => {
      const store = useNotificationStore()
      store.addNotification('Settings 1', 'info', { viewPath: '/settings' })
      store.addNotification('Settings 2', 'info', { viewPath: '/settings' })
      store.addNotification('History 1', 'info', { viewPath: '/history' })
      const id4 = store.addNotification('History 2', 'info', { viewPath: '/history' })

      store.markAsSeen(id4)

      expect(store.totalUnseenCount).toBe(3)
    })
  })
})
