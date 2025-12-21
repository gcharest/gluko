import { ref, computed } from 'vue'
import { useNotificationStore, type NotificationContext } from '@/stores/notification'

export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
  duration?: number // milliseconds, default 5000
  action?: {
    label: string
    onClick: () => void
  }
  /** Optional notification context for view-related notifications */
  context?: NotificationContext
  /** ID of the notification in the notification store (if any) */
  notificationId?: string
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  const notificationStore = useNotificationStore()

  const show = (toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${++toastIdCounter}`

    // If the toast has a context, register it in the notification store
    let notificationId: string | undefined
    if (toast.context) {
      notificationId = notificationStore.addNotification(
        toast.message,
        toast.variant,
        toast.context
      )
    }

    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
      notificationId
    }

    toasts.value.push(newToast)

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, newToast.duration)
    }

    return id
  }

  const dismiss = (id: string, markNotificationAsSeen = true) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      const toast = toasts.value[index]
      // If the toast was closed via X button, mark the notification as seen but keep it in the store
      if (markNotificationAsSeen && toast.notificationId) {
        notificationStore.markAsSeen(toast.notificationId)
      }
      toasts.value.splice(index, 1)
    }
  }

  const dismissAll = () => {
    toasts.value = []
  }

  // Convenience methods
  const success = (message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) =>
    show({ message, variant: 'success', ...options })

  const error = (message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) =>
    show({ message, variant: 'error', ...options })

  const warning = (message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) =>
    show({ message, variant: 'warning', ...options })

  const info = (message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) =>
    show({ message, variant: 'info', ...options })

  return {
    toasts: computed(() => toasts.value),
    show,
    dismiss,
    dismissAll,
    success,
    error,
    warning,
    info
  }
}
