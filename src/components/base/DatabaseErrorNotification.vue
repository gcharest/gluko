<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'

const db = useIndexedDB()
const toastRef = ref<HTMLDivElement | null>(null)
const refreshButtonRef = ref<HTMLButtonElement | null>(null)
let previousActiveElement: Element | null = null

// Compute whether error requires refresh (version change scenario)
const needsRefresh = computed(() => {
  return db.error.value?.message.includes('new version') ?? false
})

// Show toast when error exists
const showToast = computed(() => !!db.error.value)

// Watch for error changes and manage focus
watch(showToast, (newValue) => {
  if (newValue) {
    // Store the previously focused element when toast appears
    previousActiveElement = document.activeElement
    // Focus the primary action button when toast appears
    setTimeout(() => {
      if (needsRefresh.value) {
        refreshButtonRef.value?.focus()
      } else {
        toastRef.value?.focus()
      }
    }, 100)
  } else if (previousActiveElement && 'focus' in previousActiveElement) {
    // Restore focus when toast is closed
    ;(previousActiveElement as HTMLElement).focus()
  }
})

const close = () => {
  db.error.value = null
}

const refresh = () => {
  window.location.reload()
}

// Handle escape key to close toast
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showToast.value) {
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
    v-if="showToast"
    ref="toastRef"
    class="db-error-toast"
    role="alertdialog"
    aria-labelledby="db-error-title"
    aria-describedby="db-error-message"
    tabindex="-1"
  >
    <div class="message">
      <span id="db-error-title" class="sr-only">{{ $t('databaseError.title') }}</span>
      <p id="db-error-message">
        {{ db.error.value?.message }}
      </p>
    </div>
    <div class="db-error-toast-actions">
      <button
        v-if="needsRefresh"
        ref="refreshButtonRef"
        class="db-error-toast-button primary"
        :aria-label="$t('databaseError.refreshAriaLabel')"
        @click="refresh"
      >
        {{ $t('databaseError.refresh') }}
      </button>
      <button
        class="db-error-toast-button"
        :aria-label="$t('databaseError.closeAriaLabel')"
        @click="close"
      >
        {{ $t('common.actions.close') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.db-error-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 16px;
  min-width: 300px;
  max-width: 500px;
  border: 2px solid #c53030;
  border-radius: 6px;
  z-index: 9999;
  text-align: left;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: #fff5f5;
  color: #742a2a;
}

.db-error-toast .message {
  margin-bottom: 12px;
  font-size: 1rem;
  line-height: 1.5;
  color: #742a2a;
}

.db-error-toast-actions {
  display: flex;
  gap: 8px;
}

.db-error-toast-button {
  padding: 8px 16px;
  border: 2px solid #c53030;
  border-radius: 4px;
  background-color: #ffffff;
  color: #c53030;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.db-error-toast-button:hover {
  background-color: #fed7d7;
}

.db-error-toast-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(254, 178, 178, 0.5);
}

.db-error-toast-button.primary {
  background-color: #c53030;
  color: #ffffff;
}

.db-error-toast-button.primary:hover {
  background-color: #9b2c2c;
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
