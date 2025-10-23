<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'warning' | 'error'>('success')

interface ToastOptions {
  message: string
  type?: 'success' | 'warning' | 'error'
  duration?: number
}

const showMessage = ({ message, type = 'success', duration = 3000 }: ToastOptions) => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, duration)
}

// Auto-hide functionality
const hideToast = () => {
  showToast.value = false
}

defineExpose({ showMessage })
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="showToast"
        class="toast-container position-fixed top-0 end-0 p-3"
        style="z-index: 1100"
      >
        <div
          class="toast show"
          :class="`bg-${toastType} text-white`"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="toast-header">
            <i
              class="bi me-2"
              :class="{
                'bi-check-circle-fill': toastType === 'success',
                'bi-exclamation-triangle-fill': toastType === 'warning',
                'bi-x-circle-fill': toastType === 'error'
              }"
            ></i>
            <strong class="me-auto">{{
              toastType === 'success' ? 'Succès' : toastType === 'warning' ? 'Attention' : 'Erreur'
            }}</strong>
            <button
              type="button"
              class="btn-close btn-close-white"
              aria-label="Close"
              @click="hideToast"
            ></button>
          </div>
          <div class="toast-body">
            {{ toastMessage }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.3s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
