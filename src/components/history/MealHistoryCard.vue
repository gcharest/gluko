<template>
  <BaseCard class="transition-transform hover:-translate-y-1">
    <!-- Header with timestamp and actions -->
    <div class="flex justify-between items-start mb-3">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {{ formattedDate }}
        </h2>
        <p v-if="subjectName" class="text-sm text-gray-600 dark:text-gray-400">
          {{ subjectName }}
        </p>
      </div>
      <div class="relative">
        <button
          type="button"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          @click="showMenu = !showMenu"
        >
          <MoreVerticalIcon class="w-5 h-5" />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
          @click="showMenu = false"
        >
          <button
            type="button"
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            @click="$emit('edit', meal)"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            {{ $t('components.mealHistoryCard.actions.edit') }}
          </button>
          <button
            type="button"
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="$emit('duplicate', meal)"
          >
            <CopyIcon class="w-4 h-4 mr-2" />
            {{ $t('components.mealHistoryCard.actions.duplicate') }}
          </button>
          <hr class="border-gray-200 dark:border-gray-700" />
          <button
            type="button"
            class="flex items-center w-full px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
            @click="$emit('delete', meal)"
          >
            <Trash2Icon class="w-4 h-4 mr-2" />
            {{ $t('components.mealHistoryCard.actions.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span class="flex items-center">
          <PackageIcon class="w-4 h-4 mr-1" />
          {{ meal.nutrients.length }} {{ $t('components.mealHistoryCard.nutrients') }}
        </span>
        <span class="flex items-center">
          <TagIcon class="w-4 h-4 mr-1" />
          {{ meal.tags?.length || 0 }} {{ $t('components.mealHistoryCard.tags') }}
        </span>
      </div>
      <div>
        <span class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ totalCarbs.toFixed(1) }}g
        </span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="meal.tags?.length" class="flex flex-wrap gap-2 mb-3">
      <span
        v-for="tag in meal.tags"
        :key="tag"
        class="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Notes -->
    <p v-if="meal.notes" class="text-sm text-gray-600 dark:text-gray-400">
      {{ meal.notes }}
    </p>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import type { MealHistoryEntry } from '@/types/meal-history'
import BaseCard from '@/components/base/BaseCard.vue'
import {
  MoreVerticalIcon,
  PencilIcon,
  CopyIcon,
  Trash2Icon,
  PackageIcon,
  TagIcon
} from 'lucide-vue-next'

interface Props {
  meal: MealHistoryEntry
}

const props = defineProps<Props>()
const subjectStore = useSubjectStore()

defineEmits(['edit', 'duplicate', 'delete'])

const showMenu = ref(false)

// Get subject name from store
const subjectName = computed(() => {
  const subject = subjectStore.subjectById(props.meal.subjectId)
  return subject?.name
})

// Format date based on current locale
const formattedDate = computed(() => {
  const date = new Date(props.meal.date)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
})

// Calculate total carbs
const totalCarbs = computed(() => {
  return props.meal.nutrients.reduce((total, nutrient) => {
    return total + nutrient.quantity * nutrient.factor
  }, 0)
})
</script>
