<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  rounded: false,
})

const badgeClasses = computed(() => {
  const base = [
    'inline-flex items-center justify-center',
    'font-medium',
    'transition-colors duration-150',
  ]

  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-950 dark:text-danger-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const shape = props.rounded ? 'rounded-full' : 'rounded'

  return [
    ...base,
    variants[props.variant],
    sizes[props.size],
    shape,
  ]
})
</script>
