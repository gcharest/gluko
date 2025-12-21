<script setup lang="ts">
// Modernized PWA update manager using toast notifications and settings management
import { watch, onMounted } from 'vue'
import { usePWAUpdate } from '@/composables/usePWAUpdate'
import { useNavigationStore } from '@/stores/navigation'

const pwaUpdate = usePWAUpdate()
const navigationStore = useNavigationStore()

// Watch for offline ready state and show toast
watch(
  () => pwaUpdate.isOfflineReady.value,
  (isReady) => {
    if (isReady) {
      pwaUpdate.notifyOfflineReady()
    }
  }
)

// Watch for update available and show toast + badge
watch(
  () => pwaUpdate.hasUpdate.value,
  (hasUpdate) => {
    if (hasUpdate) {
      pwaUpdate.notifyUpdateAvailable()
      navigationStore.setSettingsBadge(true)
    } else {
      navigationStore.setSettingsBadge(false)
    }
  }
)

onMounted(() => {
  // Check initial states
  if (pwaUpdate.isOfflineReady.value) {
    pwaUpdate.notifyOfflineReady()
  }
  if (pwaUpdate.hasUpdate.value) {
    pwaUpdate.notifyUpdateAvailable()
    navigationStore.setSettingsBadge(true)
  }
})
</script>

<template>
  <!-- This component now only handles PWA update detection and toast notifications -->
  <!-- The actual update UI is handled in the Settings view -->
  <div />
</template>
