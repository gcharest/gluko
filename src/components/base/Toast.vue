<template>
  <div
    :class="toastClasses"
    role="status"
    :aria-live="toast.variant === 'error' ? 'assertive' : 'polite'"
    class="pointer-events-auto"
    @click="handleToastClick"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <component :is="iconComponent" :class="iconClasses" />

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p :class="messageClasses">
          {{ toast.message }}
        </p>
        <p v-if="toast.context?.viewPath" class="text-xs mt-1 opacity-70">
          {{ $t('notifications.clickToView') }}
        </p>
      </div>

      <!-- Action button (optional) -->
      <button
        v-if="toast.action"
        type="button"
        :class="actionButtonClasses"
        @click.stop="handleAction"
      >
        {{ toast.action.label }}
      </button>

      <!-- Close button -->
      <button
        type="button"
        :class="closeButtonClasses"
        :aria-label="$t('common.actions.close')"
        @click.stop="handleClose"
      >
        <XIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import {
  CheckCircleIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon
} from 'lucide-vue-next'
import type { Toast } from '@/composables/useToast'

interface Props {
  toast: Toast
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const notificationStore = useNotificationStore()

const iconComponent = computed(() => {
  const icons = {
    success: CheckCircleIcon,
    error: AlertCircleIcon,
    warning: AlertTriangleIcon,
    info: InfoIcon
  }
  return icons[props.toast.variant]
})

const toastClasses = computed(() => {
  const base = [
    'flex items-start gap-3 p-4 rounded-lg shadow-lg border',
    'min-w-[320px] max-w-md',
    'transition-all duration-150'
  ]

  // Add cursor pointer if toast has a navigation context
  if (props.toast.context?.viewPath) {
    base.push('cursor-pointer hover:scale-[1.02]')
  }

  const variants = {
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    error: 'bg-danger-50 border-danger-200 dark:bg-danger-950 dark:border-danger-800',
    warning: 'bg-warning-50 border-warning-200 dark:bg-warning-950 dark:border-warning-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
  }

  return [...base, variants[props.toast.variant]]
})

const iconClasses = computed(() => {
  const variants = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-danger-600 dark:text-danger-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-blue-600 dark:text-blue-400'
  }

  return ['w-5 h-5 flex-shrink-0 mt-0.5', variants[props.toast.variant]]
})

const messageClasses = computed(() => {
  const variants = {
    success: 'text-gray-900 dark:text-green-100',
    error: 'text-danger-900 dark:text-danger-100',
    warning: 'text-warning-900 dark:text-warning-100',
    info: 'text-blue-900 dark:text-blue-100'
  }

  return ['text-sm font-medium', variants[props.toast.variant]]
})

const actionButtonClasses = computed(() => {
  const variants = {
    success: 'text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100',
    error: 'text-danger-700 hover:text-danger-900 dark:text-danger-300 dark:hover:text-danger-100',
    warning:
      'text-warning-700 hover:text-warning-900 dark:text-warning-300 dark:hover:text-warning-100',
    info: 'text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100'
  }

  return [
    'text-sm font-medium px-2 py-1 rounded',
    'transition-colors duration-150',
    'hover:bg-black/5 dark:hover:bg-white/5',
    variants[props.toast.variant]
  ]
})

const closeButtonClasses = computed(() => {
  const variants = {
    success: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
    error: 'text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-200',
    warning:
      'text-warning-600 hover:text-warning-800 dark:text-warning-400 dark:hover:text-warning-200',
    info: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'
  }

  return [
    'flex-shrink-0 rounded-lg p-1',
    'transition-colors duration-150',
    'hover:bg-black/5 dark:hover:bg-white/5',
    variants[props.toast.variant]
  ]
})

function handleAction() {
  props.toast.action?.onClick()
  emit('close')
}

function handleClose() {
  emit('close')
}

/**
 * Handle clicking on the toast body (not close button)
 * If the toast has a view context, navigate to that view
 */
function handleToastClick() {
  if (props.toast.context?.viewPath) {
    // Navigate to the related view
    router.push(props.toast.context.viewPath)
    // Remove the notification from the store (user is taking action)
    if (props.toast.notificationId) {
      notificationStore.removeNotification(props.toast.notificationId)
    }
    // Close the toast
    emit('close')
  }
}
</script>
