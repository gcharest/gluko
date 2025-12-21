<script setup lang="ts">
// Modernized PWA update manager using toast notifications and settings management
import { watch, onMounted } from 'vue'
import { usePWAUpdate } from '@/composables/usePWAUpdate'
import { useNavigationStore } from '@/stores/navigation'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const pwaUpdate = usePWAUpdate()
const navigationStore = useNavigationStore()
const toast = useToast()
const { t } = useI18n()

// Watch for offline ready state and show toast
watch(
  () => pwaUpdate.isOfflineReady.value,
  (isReady) => {
    if (isReady) {
      // Offline ready notification doesn't need a view context
      toast.success(t('pwa.offlineReady'))
    }
  }
)

// Watch for update available and show toast + badge
watch(
  () => pwaUpdate.hasUpdate.value,
  (hasUpdate) => {
    if (hasUpdate) {
      // Show toast with context pointing to settings view
      toast.info(t('pwa.updateAvailable'), {
        context: {
          viewPath: '/settings',
          clearOnVisit: true
        },
        duration: 10000 // Show longer for important updates
      })
      navigationStore.setSettingsBadge(true)
    } else {
      navigationStore.setSettingsBadge(false)
    }
  }
)

onMounted(() => {
  // Check initial states
  if (pwaUpdate.isOfflineReady.value) {
    toast.success(t('pwa.offlineReady'))
  }
  if (pwaUpdate.hasUpdate.value) {
    toast.info(t('pwa.updateAvailable'), {
      context: {
        viewPath: '/settings',
        clearOnVisit: true
      },
      duration: 10000
    })
    navigationStore.setSettingsBadge(true)
  }
})
</script>

<template>
  <!-- This component now only handles PWA update detection and toast notifications -->
  <!-- The actual update UI is handled in the Settings view -->
  <div />
</template>
