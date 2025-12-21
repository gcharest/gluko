import { ref, computed } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useToast } from './useToast'
import { useI18n } from 'vue-i18n'

// Singleton state for PWA updates
const pwaUpdateState = {
  offlineReady: ref(false),
  needRefresh: ref(false),
  updateServiceWorker: null as (() => Promise<void>) | null,
  hasBeenNotified: ref(false),
  registration: null as ServiceWorkerRegistration | null
}

export function usePWAUpdate() {
  const { t } = useI18n()
  const toast = useToast()

  // Initialize PWA registration only once
  if (!pwaUpdateState.updateServiceWorker) {
    const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
      onRegistered(registration) {
        pwaUpdateState.registration = registration || null
        console.log('Service Worker registered:', registration)
      },
      onRegisterError(error) {
        console.error('Service Worker registration error:', error)
      }
    })

    pwaUpdateState.offlineReady = offlineReady
    pwaUpdateState.needRefresh = needRefresh
    pwaUpdateState.updateServiceWorker = updateServiceWorker
  }

  const hasUpdate = computed(() => pwaUpdateState.needRefresh.value)
  const isOfflineReady = computed(() => pwaUpdateState.offlineReady.value)

  /**
   * Manually check for updates by triggering service worker update
   * Implements best practices from: https://vite-pwa-org.netlify.app/guide/periodic-sw-updates
   */
  async function checkForUpdates(): Promise<boolean> {
    if (!pwaUpdateState.registration) {
      console.warn('No service worker registration found')
      return false
    }

    try {
      // Safety check: Don't check if service worker is currently installing
      if (pwaUpdateState.registration.installing) {
        console.log('Service worker is installing, skipping update check')
        return false
      }

      // Safety check: Don't check if user is offline
      if (!navigator.onLine) {
        console.log('User is offline, skipping update check')
        return false
      }

      // Trigger service worker update
      await pwaUpdateState.registration.update()

      // Check if an update is available after checking
      if (pwaUpdateState.needRefresh.value) {
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to check for updates:', error)
      throw error
    }
  }

  /**
   * Show a toast notification when an update is available
   */
  function notifyUpdateAvailable() {
    if (!pwaUpdateState.hasBeenNotified.value && hasUpdate.value) {
      toast.info(t('pwa.updateAvailable'))
      pwaUpdateState.hasBeenNotified.value = true
    }
  }

  /**
   * Show a toast when app is ready for offline use
   */
  function notifyOfflineReady() {
    if (isOfflineReady.value) {
      toast.success(t('pwa.offlineReady'))
    }
  }

  /**
   * Apply the update by reloading the page with the new service worker
   */
  async function applyUpdate() {
    if (pwaUpdateState.updateServiceWorker) {
      await pwaUpdateState.updateServiceWorker()
      // The page will reload automatically
    }
  }

  /**
   * Dismiss the update notification
   */
  function dismissUpdate() {
    pwaUpdateState.needRefresh.value = false
    pwaUpdateState.hasBeenNotified.value = false
  }

  return {
    hasUpdate,
    isOfflineReady,
    checkForUpdates,
    notifyUpdateAvailable,
    notifyOfflineReady,
    applyUpdate,
    dismissUpdate
  }
}
