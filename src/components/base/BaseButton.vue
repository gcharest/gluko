<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <LoaderIcon class="w-5 h-5 animate-spin" />
    </span>
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LoaderIcon } from 'lucide-vue-next'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false
})

const buttonClasses = computed(() => {
  const base = [
    'relative inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'min-h-[44px]' // Touch target
  ]

  const variants = {
    primary: [
      'bg-primary-700 text-white',
      'hover:bg-primary-800 active:bg-primary-900',
      'focus:ring-primary-500'
    ],
    secondary: [
      'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
      'hover:bg-gray-300 dark:hover:bg-gray-600',
      'focus:ring-gray-500'
    ],
    danger: [
      'bg-danger-600 text-white',
      'hover:bg-danger-700 active:bg-danger-800',
      'focus:ring-danger-500'
    ],
    ghost: [
      'bg-transparent text-gray-700 dark:text-gray-300',
      'hover:bg-gray-100 dark:hover:bg-gray-800',
      'focus:ring-gray-500'
    ]
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return [...base, ...variants[props.variant], sizes[props.size]]
})
</script>
