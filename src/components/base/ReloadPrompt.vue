<script setup lang="ts">
// Source: https://vite-pwa-org.netlify.app/frameworks/vue.html#prompt-for-update
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { ref, onMounted, onUnmounted } from 'vue'

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
const toastRef = ref<HTMLDivElement | null>(null)
const reloadButtonRef = ref<HTMLButtonElement | null>(null)
let previousActiveElement: Element | null = null

onMounted(() => {
  // Store the previously focused element when toast appears
  if (offlineReady.value || needRefresh.value) {
    previousActiveElement = document.activeElement
    // Focus the primary action button when toast appears
    reloadButtonRef.value?.focus()
  }
})

const close = async () => {
  offlineReady.value = false
  needRefresh.value = false
  // Restore focus to the previous element when toast is closed
  if (previousActiveElement && 'focus' in previousActiveElement) {
    ;(previousActiveElement as HTMLElement).focus()
  }
}

// Handle escape key to close toast
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div
    v-if="offlineReady || needRefresh"
    ref="toastRef"
    class="pwa-toast"
    role="alertdialog"
    aria-labelledby="pwa-toast-title"
    aria-describedby="pwa-toast-message"
  >
    <div class="message">
      <span id="pwa-toast-title" class="sr-only">Application Update Available</span>
      <p id="pwa-toast-message">
        <span v-if="offlineReady">
          {{ $t('reloadPrompt.offlineReady') }}
        </span>
        <span v-else>
          {{ $t('reloadPrompt.newContentAvailable') }}
        </span>
      </p>
    </div>
    <div class="pwa-toast-actions">
      <button
        v-if="needRefresh"
        ref="reloadButtonRef"
        class="pwa-toast-button primary"
        aria-label="Reload application to update"
        @click="updateServiceWorker()"
      >
        {{ $t('reloadPrompt.reload') }}
      </button>
      <button class="pwa-toast-button" aria-label="Close update notification" @click="close">
        {{ $t('reloadPrompt.close') }}
      </button>
    </div>
  </div>
</template>

<style>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 16px;
  min-width: 300px;
  max-width: 500px;
  border: 2px solid #2c5282;
  border-radius: 6px;
  z-index: 9999;
  text-align: left;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
  color: #1a202c;
}

.pwa-toast .message {
  margin-bottom: 12px;
  font-size: 1rem;
  line-height: 1.5;
  color: #000000;
}

.pwa-toast-actions {
  display: flex;
  gap: 8px;
}

.pwa-toast-button {
  padding: 8px 16px;
  border: 2px solid #2c5282;
  border-radius: 4px;
  background-color: #ffffff;
  color: #2c5282;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pwa-toast-button:hover {
  background-color: #ebf8ff;
}

.pwa-toast-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

.pwa-toast-button.primary {
  background-color: #2c5282;
  color: #ffffff;
}

.pwa-toast-button.primary:hover {
  background-color: #2a4365;
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
