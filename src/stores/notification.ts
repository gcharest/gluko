import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Notification context - defines which view(s) a notification relates to
 */
export interface NotificationContext {
  /** The route path this notification relates to (e.g., '/settings') */
  viewPath: string
  /** Optional: specific section within the view */
  section?: string
  /** Whether the notification should be cleared when the user visits the view */
  clearOnVisit?: boolean
}

/**
 * Notification with optional view context
 */
export interface Notification {
  /** Unique identifier */
  id: string
  /** Notification message */
  message: string
  /** Notification type */
  variant: 'success' | 'error' | 'warning' | 'info'
  /** Optional context - which view(s) this notification relates to */
  context?: NotificationContext
  /** Whether this notification has been seen by the user */
  seen?: boolean
  /** Timestamp when notification was created */
  createdAt: number
}

export const useNotificationStore = defineStore('notification', () => {
  // Store all notifications
  const notifications = ref<Notification[]>([])

  // Track which views have been visited (to clear notifications)
  const visitedViews = ref<Set<string>>(new Set())

  // Counter for generating unique IDs
  let notificationIdCounter = 0

  /**
   * Add a new notification
   */
  function addNotification(
    message: string,
    variant: 'success' | 'error' | 'warning' | 'info',
    context?: NotificationContext
  ): string {
    const id = `notification-${++notificationIdCounter}`
    const notification: Notification = {
      id,
      message,
      variant,
      context,
      seen: false,
      createdAt: Date.now()
    }

    notifications.value.push(notification)
    return id
  }

  /**
   * Remove a notification by ID
   */
  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Mark a notification as seen (but don't remove it)
   */
  function markAsSeen(id: string) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.seen = true
    }
  }

  /**
   * Clear notifications for a specific view path
   * Called when user visits a view to clear related notifications
   */
  function clearNotificationsForView(viewPath: string) {
    // Mark the view as visited
    visitedViews.value.add(viewPath)

    // Remove notifications that should be cleared on visit
    notifications.value = notifications.value.filter((notification) => {
      if (notification.context?.viewPath === viewPath && notification.context.clearOnVisit) {
        return false
      }
      return true
    })
  }

  /**
   * Get all notifications for a specific view path
   */
  function getNotificationsForView(viewPath: string): Notification[] {
    return notifications.value.filter((n) => n.context?.viewPath === viewPath)
  }

  /**
   * Get unseen notifications for a specific view path
   */
  function getUnseenNotificationsForView(viewPath: string): Notification[] {
    return notifications.value.filter((n) => n.context?.viewPath === viewPath && !n.seen)
  }

  /**
   * Check if a view has unseen notifications (for badge display)
   */
  function hasUnseenNotifications(viewPath: string): boolean {
    return notifications.value.some((n) => n.context?.viewPath === viewPath && !n.seen)
  }

  /**
   * Get count of unseen notifications for a view
   */
  function getUnseenCount(viewPath: string): number {
    return notifications.value.filter((n) => n.context?.viewPath === viewPath && !n.seen).length
  }

  /**
   * Clear all notifications
   */
  function clearAll() {
    notifications.value = []
  }

  /**
   * Computed: All active notifications
   */
  const activeNotifications = computed(() => notifications.value)

  /**
   * Computed: Count of all unseen notifications
   */
  const totalUnseenCount = computed(() => notifications.value.filter((n) => !n.seen).length)

  return {
    notifications: activeNotifications,
    totalUnseenCount,
    addNotification,
    removeNotification,
    markAsSeen,
    clearNotificationsForView,
    getNotificationsForView,
    getUnseenNotificationsForView,
    hasUnseenNotifications,
    getUnseenCount,
    clearAll
  }
})
