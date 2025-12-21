import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    const toast = useToast()
    toast.dismissAll() // Clear all toasts between tests
    vi.runAllTimers() // Run any pending timers
  })

  describe('Toast Creation', () => {
    it('creates a success toast', () => {
      const toast = useToast()
      const id = toast.success('Operation completed')

      expect(id).toBeDefined()
      expect(toast.toasts.value.length).toBeGreaterThan(0)
      const successToast = toast.toasts.value.find((t) => t.message === 'Operation completed')
      expect(successToast).toBeDefined()
      expect(successToast?.variant).toBe('success')
    })

    it('creates an error toast', () => {
      const toast = useToast()
      const id = toast.error('Something went wrong')

      expect(id).toBeDefined()
      const errorToast = toast.toasts.value.find((t) => t.message === 'Something went wrong')
      expect(errorToast).toBeDefined()
      expect(errorToast?.variant).toBe('error')
    })

    it('creates a warning toast', () => {
      const toast = useToast()
      const id = toast.warning('Please be careful')

      expect(id).toBeDefined()
      const warningToast = toast.toasts.value.find((t) => t.message === 'Please be careful')
      expect(warningToast).toBeDefined()
      expect(warningToast?.variant).toBe('warning')
    })

    it('creates an info toast', () => {
      const toast = useToast()
      const id = toast.info('Here is some information')

      expect(id).toBeDefined()
      const infoToast = toast.toasts.value.find((t) => t.message === 'Here is some information')
      expect(infoToast).toBeDefined()
      expect(infoToast?.variant).toBe('info')
    })

    it('creates toast with custom duration', () => {
      const toast = useToast()
      const id = toast.show({
        message: 'Custom duration',
        variant: 'success',
        duration: 10000
      })

      expect(id).toBeDefined()
      const customToast = toast.toasts.value.find((t) => t.message === 'Custom duration')
      expect(customToast?.duration).toBe(10000)
    })

    it('creates toast with action', () => {
      const toast = useToast()
      const mockAction = vi.fn()
      const id = toast.show({
        message: 'With action',
        variant: 'info',
        action: {
          label: 'Undo',
          onClick: mockAction
        }
      })

      expect(id).toBeDefined()
      const actionToast = toast.toasts.value.find((t) => t.message === 'With action')
      expect(actionToast?.action).toBeDefined()
      expect(actionToast?.action?.label).toBe('Undo')
    })

    it('generates unique IDs', () => {
      const toast = useToast()
      const id1 = toast.success('First')
      const id2 = toast.success('Second')

      expect(id1).not.toBe(id2)
      expect(id1.startsWith('toast-')).toBe(true)
      expect(id2.startsWith('toast-')).toBe(true)
    })
  })

  describe('Toast Dismissal', () => {
    it('dismisses a single toast by id', () => {
      const toast = useToast()
      const id = toast.success('Test')
      const initialCount = toast.toasts.value.length
      expect(initialCount).toBeGreaterThan(0)

      toast.dismiss(id)

      expect(toast.toasts.value.find((t) => t.id === id)).toBeUndefined()
    })

    it('does nothing when dismissing non-existent id', () => {
      const toast = useToast()
      toast.success('Test')
      const initialCount = toast.toasts.value.length

      toast.dismiss('non-existent-id')

      expect(toast.toasts.value.length).toBe(initialCount)
    })

    it('dismisses all toasts', () => {
      const toast = useToast()
      toast.success('First')
      toast.error('Second')
      toast.warning('Third')

      expect(toast.toasts.value.length).toBeGreaterThan(0)

      toast.dismissAll()

      expect(toast.toasts.value.length).toBe(0)
    })
  })

  describe('Auto-dismiss', () => {
    it('auto-dismisses toast after duration', () => {
      const toast = useToast()
      const id = toast.success('Auto-dismiss', { duration: 3000 })

      expect(toast.toasts.value.find((t) => t.id === id)).toBeDefined()

      vi.advanceTimersByTime(3000)

      expect(toast.toasts.value.find((t) => t.id === id)).toBeUndefined()
    })

    it('does not auto-dismiss when duration is 0', () => {
      const toast = useToast()
      const id = toast.success('Persistent', { duration: 0 })

      expect(toast.toasts.value.find((t) => t.id === id)).toBeDefined()

      vi.advanceTimersByTime(10000)

      expect(toast.toasts.value.find((t) => t.id === id)).toBeDefined()
    })

    it('uses default duration of 5000ms', () => {
      const toast = useToast()
      const id = toast.success('Default duration')

      expect(toast.toasts.value.find((t) => t.id === id)).toBeDefined()

      vi.advanceTimersByTime(5000)

      expect(toast.toasts.value.find((t) => t.id === id)).toBeUndefined()
    })
  })

  describe('Convenience Methods', () => {
    it('success method returns id and creates success variant', () => {
      const toast = useToast()
      const id = toast.success('Success message')

      expect(typeof id).toBe('string')
      expect(id).toMatch(/^toast-\d+$/)
      const t = toast.toasts.value.find((x) => x.id === id)
      expect(t?.variant).toBe('success')
      expect(t?.message).toBe('Success message')
    })

    it('error method returns id and creates error variant', () => {
      const toast = useToast()
      const id = toast.error('Error message')

      expect(typeof id).toBe('string')
      const t = toast.toasts.value.find((x) => x.id === id)
      expect(t?.variant).toBe('error')
      expect(t?.message).toBe('Error message')
    })

    it('warning method returns id and creates warning variant', () => {
      const toast = useToast()
      const id = toast.warning('Warning message')

      expect(typeof id).toBe('string')
      const t = toast.toasts.value.find((x) => x.id === id)
      expect(t?.variant).toBe('warning')
      expect(t?.message).toBe('Warning message')
    })

    it('info method returns id and creates info variant', () => {
      const toast = useToast()
      const id = toast.info('Info message')

      expect(typeof id).toBe('string')
      const t = toast.toasts.value.find((x) => x.id === id)
      expect(t?.variant).toBe('info')
      expect(t?.message).toBe('Info message')
    })

    it('convenience methods accept options', () => {
      const toast = useToast()
      const mockAction = vi.fn()

      const id = toast.success('With options', {
        duration: 2000,
        action: {
          label: 'Click me',
          onClick: mockAction
        }
      })

      const t = toast.toasts.value.find((x) => x.id === id)
      expect(t?.duration).toBe(2000)
      expect(t?.action?.label).toBe('Click me')
    })
  })

  describe('Show Method', () => {
    it('creates toast with all properties', () => {
      const toast = useToast()
      const id = toast.show({
        message: 'Complete toast',
        variant: 'warning',
        duration: 3000
      })

      const t = toast.toasts.value.find((x) => x.id === id)
      expect(t?.message).toBe('Complete toast')
      expect(t?.variant).toBe('warning')
      expect(t?.duration).toBe(3000)
    })

    it('returns a unique id', () => {
      const toast = useToast()
      const id1 = toast.show({ message: 'Toast 1', variant: 'info' })
      const id2 = toast.show({ message: 'Toast 2', variant: 'info' })

      expect(id1).not.toBe(id2)
    })
  })
})
