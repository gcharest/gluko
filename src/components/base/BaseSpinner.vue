<template>
  <div :class="containerClasses">
    <LoaderIcon :class="spinnerClasses" />
    <span v-if="label" :class="labelClasses">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LoaderIcon } from 'lucide-vue-next'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  variant?: 'primary' | 'secondary' | 'white'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  label: '',
  variant: 'primary'
})

const containerClasses = computed(() => ['inline-flex items-center gap-2'])

const spinnerClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const variants = {
    primary: 'text-primary-700 dark:text-primary-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white'
  }

  return ['animate-spin', sizes[props.size], variants[props.variant]]
})

const labelClasses = computed(() => {
  const variants = {
    primary: 'text-gray-700 dark:text-gray-300',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white'
  }

  return ['text-sm font-medium', variants[props.variant]]
})
</script>
