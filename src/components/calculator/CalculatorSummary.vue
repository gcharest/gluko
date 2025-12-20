<script setup lang="ts">
import BaseBadge from '@/components/base/BaseBadge.vue'

defineProps<{
  totalCarbs: number
  nutrientCount: number
}>()
</script>

<template>
  <div class="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {{ $t('components.mealCalculator.totalCarbs') }}
        </h2>
        <p class="text-3xl font-bold text-primary-700 dark:text-primary-400">
          {{ (Math.round(totalCarbs * 100) / 100).toFixed(2) }} g
        </p>
      </div>
      <BaseBadge variant="primary" size="lg" rounded>
        {{ nutrientCount }} {{ nutrientCount === 1 ? 'item' : 'items' }}
      </BaseBadge>
    </div>
  </div>
</template>
