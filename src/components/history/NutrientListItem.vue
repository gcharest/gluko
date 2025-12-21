<template>
  <div class="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
    <div
      class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-xs font-medium text-primary-700 dark:text-primary-300"
    >
      {{ index + 1 }}
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
        {{ nutrient.name }}
      </p>
      <p class="text-xs text-gray-600 dark:text-gray-400">
        {{ nutrient.quantity }}g × {{ nutrient.factor }} =
        <span class="font-medium">{{ carbValue.toFixed(1) }}g</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Nutrient } from '@/stores/meal'

interface Props {
  nutrient: Nutrient
  index: number
}

const props = defineProps<Props>()

const carbValue = computed(() => props.nutrient.quantity * props.nutrient.factor)
</script>
