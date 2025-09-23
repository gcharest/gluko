<template>
  <div class="meal-history-card card mb-3">
    <div class="card-body">
      <!-- Header with timestamp and actions -->
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h5 class="card-title mb-1">
            {{ formattedDate }}
          </h5>
          <p v-if="subjectName" class="text-muted small mb-0">
            {{ subjectName }}
          </p>
        </div>
        <div class="dropdown">
          <button
:id="dropdownId" class="btn btn-link btn-sm text-muted p-0" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" :aria-labelledby="dropdownId">
            <li>
              <button type="button" class="dropdown-item" @click="$emit('edit', meal)">
                <i class="bi bi-pencil me-2"></i>
                {{ $t('components.mealHistoryCard.actions.edit') }}
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item" @click="$emit('duplicate', meal)">
                <i class="bi bi-copy me-2"></i>
                {{ $t('components.mealHistoryCard.actions.duplicate') }}
              </button>
            </li>
            <li>
              <hr class="dropdown-divider" />
            </li>
            <li>
              <button type="button" class="dropdown-item text-danger" @click="$emit('delete', meal)">
                <i class="bi bi-trash me-2"></i>
                {{ $t('components.mealHistoryCard.actions.delete') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Summary -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <span class="me-3">
            <i class="bi bi-archive me-1"></i>
            {{ meal.nutrients.length }} {{ $t('components.mealHistoryCard.nutrients') }}
          </span>
          <span>
            <i class="bi bi-tags me-1"></i>
            {{ meal.tags?.length || 0 }} {{ $t('components.mealHistoryCard.tags') }}
          </span>
        </div>
        <div class="text-end">
          <span class="total-carbs">
            {{ totalCarbs.toFixed(1) }}g
          </span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="meal.tags?.length" class="meal-tags">
        <span v-for="tag in meal.tags" :key="tag" class="badge rounded-pill text-bg-secondary me-1">
          {{ tag }}
        </span>
      </div>

      <!-- Notes -->
      <p v-if="meal.notes" class="card-text small text-muted mt-2 mb-0">
        {{ meal.notes }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import type { MealHistoryEntry } from '@/types/meal-history'

interface Props {
  meal: MealHistoryEntry
}

const props = defineProps<Props>()
const subjectStore = useSubjectStore()

defineEmits(['edit', 'duplicate', 'delete'])

// Get subject name from store
const subjectName = computed(() => {
  const subject = subjectStore.subjectById(props.meal.subjectId)
  return subject?.name
})

// Generate unique ID for dropdown
const dropdownId = `meal-actions-${Math.random().toString(36).substr(2, 9)}`

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
    return total + (nutrient.quantity * nutrient.factor)
  }, 0)
})
</script>

<style scoped>
.meal-history-card {
  transition: transform 0.2s ease;
}

.meal-history-card:hover {
  transform: translateY(-2px);
}

.total-carbs {
  font-size: 1.25rem;
  font-weight: 500;
}

.meal-tags {
  margin-top: 0.5rem;
}
</style>