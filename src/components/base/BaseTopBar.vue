<template>
  <header class="sticky top-0 z-20 lg:hidden" :class="topBarClasses">
    <!-- Skip to content link -->
    <a
      href="#content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-700 focus:rounded-lg focus:shadow-lg"
    >
      {{ $t('navigation.skipToContent') }}
    </a>

    <div class="flex items-center justify-center h-14 px-4">
      <!-- Brand / Home Link -->
      <RouterLink to="/" class="text-xl font-bold text-gray-900 dark:text-white">
        Gluko
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const topBarClasses = computed(() => [
  'bg-white dark:bg-gray-900',
  'border-b border-gray-200 dark:border-gray-800',
  'shadow-sm'
])
</script>
