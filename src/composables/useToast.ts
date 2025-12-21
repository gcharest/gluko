import { ref, computed } from 'vue'

export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
  duration?: number // milliseconds, default 5000
  action?: {
    label: string
    onClick: () => void
  }
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  const show = (toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${++toastIdCounter}`
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
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

  const dismiss = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
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
