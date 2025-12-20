<template>
  <div :class="alertClasses" role="alert">
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <component :is="iconComponent" :class="iconClasses" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 v-if="title" :class="titleClasses">
          {{ title }}
        </h3>
        <div :class="contentClasses">
          <slot />
        </div>
      </div>

      <!-- Close button -->
      <button
        v-if="dismissible"
        type="button"
        :class="closeButtonClasses"
        aria-label="Close"
        @click="handleClose"
      >
        <XIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  InfoIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  XIcon,
} from 'lucide-vue-next'

interface Props {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false,
})

const emit = defineEmits<{
  'close': []
}>()

const iconComponent = computed(() => {
  const icons = {
    info: InfoIcon,
    success: CheckCircleIcon,
    warning: AlertTriangleIcon,
    danger: AlertCircleIcon,
  }
  return icons[props.variant]
})

const alertClasses = computed(() => {
  const base = ['rounded-lg p-4', 'border']

  const variants = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    warning: 'bg-warning-50 border-warning-200 dark:bg-warning-950 dark:border-warning-800',
    danger: 'bg-danger-50 border-danger-200 dark:bg-danger-950 dark:border-danger-800',
  }

  return [...base, variants[props.variant]]
})

const iconClasses = computed(() => {
  const variants = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-warning-600 dark:text-warning-400',
    danger: 'text-danger-600 dark:text-danger-400',
  }

  return ['w-5 h-5', variants[props.variant]]
})

const titleClasses = computed(() => {
  const variants = {
    info: 'text-blue-900 dark:text-blue-100',
    success: 'text-green-900 dark:text-green-100',
    warning: 'text-warning-900 dark:text-warning-100',
    danger: 'text-danger-900 dark:text-danger-100',
  }

  return ['font-medium text-sm mb-1', variants[props.variant]]
})

const contentClasses = computed(() => {
  const variants = {
    info: 'text-blue-800 dark:text-blue-200',
    success: 'text-green-800 dark:text-green-200',
    warning: 'text-warning-800 dark:text-warning-200',
    danger: 'text-danger-800 dark:text-danger-200',
  }

  return ['text-sm', variants[props.variant]]
})

const closeButtonClasses = computed(() => {
  const variants = {
    info: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
    success: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
    warning: 'text-warning-600 hover:text-warning-800 dark:text-warning-400 dark:hover:text-warning-200',
    danger: 'text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-200',
  }

  return [
    'flex-shrink-0 rounded-lg p-1',
    'transition-colors duration-150',
    'hover:bg-black/5 dark:hover:bg-white/5',
    variants[props.variant],
  ]
})

function handleClose() {
  emit('close')
}
</script>
