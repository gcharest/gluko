<template>
  <Teleport to="body">
    <div
      class="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-2 opacity-0"
      >
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @close="handleClose(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import Toast from '@/components/base/Toast.vue'

const { toasts, dismiss } = useToast()

function handleClose(id: string) {
  dismiss(id)
}
</script>
