<template>
  <div :class="cardClasses">
    <div
      v-if="$slots.header || title"
      class="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
    >
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ title }}
        </h3>
      </slot>
    </div>

    <div class="px-4 py-3">
      <slot />
    </div>

    <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  variant: 'default',
  padding: 'md'
})

const cardClasses = computed(() => {
  const base = ['bg-white dark:bg-gray-800', 'rounded-lg', 'overflow-hidden']

  const variants = {
    default: 'shadow-sm',
    elevated: 'shadow-md',
    outlined: 'border border-gray-200 dark:border-gray-700'
  }

  return [...base, variants[props.variant]]
})
</script>
