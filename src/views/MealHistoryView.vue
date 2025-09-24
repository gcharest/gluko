<template>
  <div class="container-fluid">
    <h1>{{ $t('navigation.history') }}</h1>
    <div class="row">
      <!-- Filters Sidebar -->
      <div class="col-md-3">
        <div class="card">
          <div class="card-header">
            <h2 class="h5 card-title mb-0">{{ $t('views.mealHistory.filters.title') }}</h2>
          </div>
          <div class="card-body">
            <!-- Date Range Filter -->
            <div class="mb-3">
              <label class="form-label">{{ $t('views.mealHistory.filters.dateRange') }}</label>
              <DateRangeFilter v-model="dateRange" />
            </div>

            <!-- Subject Filter -->
            <div class="mb-3">
              <label class="form-label">{{ $t('views.mealHistory.filters.subject') }}</label>
              <SubjectSelector v-model="selectedSubjectId" @add="handleAddSubject" />
            </div>

            <!-- Tags Filter -->
            <div class="mb-3">
              <label class="form-label">{{ $t('views.mealHistory.filters.tags') }}</label>
              <!-- TODO: Add tags selector component -->
            </div>

            <!-- Search Filter -->
            <div class="mb-3">
              <label class="form-label">{{ $t('views.mealHistory.filters.search') }}</label>
              <input
                v-model="searchQuery"
                type="search"
                class="form-control"
                :placeholder="$t('views.mealHistory.filters.searchPlaceholder')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-md-9">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h4 mb-0">{{ $t('views.mealHistory.results.title') }}</h2>
          <div class="d-flex gap-2">
            <!-- Export/Import buttons -->
            <button type="button" class="btn btn-outline-secondary" @click="handleExport">
              <i class="bi bi-download me-1"></i>
              {{ $t('views.mealHistory.actions.export') }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="handleImport">
              <i class="bi bi-upload me-1"></i>
              {{ $t('views.mealHistory.actions.import') }}
            </button>
          </div>
        </div>

        <!-- Results count and page size selector -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <p class="mb-0">
            {{ $t('views.mealHistory.results.count', { count: totalResults }) }}
          </p>
          <div class="d-flex align-items-center gap-2">
            <label for="page-size-select" class="form-label mb-0">{{
              $t('views.mealHistory.results.perPage')
            }}</label>
            <select
              id="page-size-select"
              v-model="pageSize"
              class="form-select"
              style="width: auto"
              :aria-label="$t('views.mealHistory.results.perPage')"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ $t('common.loading') }}</span>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <!-- Empty state -->
        <div v-else-if="!totalResults" class="text-center py-5">
          <p class="mb-0">{{ $t('views.mealHistory.empty') }}</p>
        </div>

        <!-- Results list -->
        <div v-else class="meal-history-list">
          <MealHistoryCard
            v-for="meal in paginatedMeals"
            :key="meal.id"
            :meal="meal"
            @edit="handleEditMeal"
            @duplicate="handleDuplicateMeal"
            @delete="handleDeleteMeal"
          />
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" aria-label="Meal history pagination" class="mt-3">
          <ul class="pagination justify-content-center">
            <!-- Previous page -->
            <li :class="['page-item', { disabled: currentPage === 1 }]">
              <button
                type="button"
                class="page-link"
                :aria-label="$t('common.pagination.previous')"
                @click="currentPage--"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>

            <!-- Page numbers -->
            <li
              v-for="page in displayedPages"
              :key="page"
              :class="['page-item', { active: page === currentPage }]"
            >
              <button
                type="button"
                class="page-link"
                :disabled="typeof page === 'string'"
                @click="typeof page === 'number' ? (currentPage = page) : undefined"
              >
                {{ page }}
              </button>
            </li>

            <!-- Next page -->
            <li :class="['page-item', { disabled: currentPage === totalPages }]">
              <button
                type="button"
                class="page-link"
                :aria-label="$t('common.pagination.next')"
                @click="currentPage++"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMealHistoryStore } from '@/stores/mealHistory'
import { useSubjectStore } from '@/stores/subject'
import type { MealHistoryEntry } from '@/types/meal-history'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import SubjectSelector from '@/components/filters/SubjectSelector.vue'
import MealHistoryCard from '@/components/history/MealHistoryCard.vue'

const mealHistoryStore = useMealHistoryStore()
const subjectStore = useSubjectStore()

// Pagination state
const currentPage = computed({
  get: () => mealHistoryStore.currentPage,
  set: (val: number) => mealHistoryStore.setPage(val)
})
const pageSize = ref(10) // Not used in store, but can be used for future custom page sizes
const pageSizeOptions = [10, 25, 50, 100]

// Filter state
const searchQuery = computed({
  get: () => mealHistoryStore.searchQuery,
  set: (val: string) => mealHistoryStore.setSearchQuery(val)
})
const dateRange = computed({
  get: () => {
    const dr = mealHistoryStore.dateRange
    return {
      start: dr.start ? dr.start.toISOString().split('T')[0] : null,
      end: dr.end ? dr.end.toISOString().split('T')[0] : null
    }
  },
  set: (val: { start: string | null; end: string | null }) => {
    const start = val.start ? new Date(val.start) : null
    const end = val.end ? new Date(val.end) : null
    mealHistoryStore.setDateRange(start, end)
  }
})
const selectedSubjectId = computed({
  get: () => subjectStore.activeSubjectId,
  set: (val: string | null) => {
    if (val) subjectStore.setActiveSubject(val)
  }
})

// Get paginated meals from store
const paginatedMeals = computed(() => mealHistoryStore.paginatedEntries)

// UI state
const loading = ref(false) // Could be set from store if async
const error = computed(() => mealHistoryStore.error?.message || null)

// Results and pagination
const totalResults = computed(() => mealHistoryStore.filteredEntries.length)
const totalPages = computed(() => mealHistoryStore.totalPages)

// Calculate which page numbers to display
const displayedPages = computed<(number | '...')[]>(() => {
  const delta = 2 // Number of pages to show before and after current page
  const range: number[] = []
  const rangeWithDots: (number | '...')[] = []
  let lastPage: number | undefined

  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= currentPage.value - delta && i <= currentPage.value + delta)
    ) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (lastPage) {
      if (i - lastPage === 2) {
        rangeWithDots.push(lastPage + 1)
      } else if (i - lastPage !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    lastPage = i
  }

  return rangeWithDots
})

// Event handlers
function handleAddSubject() {
  // TODO: Show subject creation modal
  console.log('Add subject clicked')
}

function handleEditMeal(meal: MealHistoryEntry) {
  // TODO: Implement edit meal
  console.log('Edit meal:', meal)
}

function handleDuplicateMeal(meal: MealHistoryEntry) {
  mealHistoryStore.duplicateEntry(meal.id)
}

function handleDeleteMeal(meal: MealHistoryEntry) {
  mealHistoryStore.deleteEntry(meal.id)
}

function handleExport() {
  // TODO: Implement export functionality
  console.log('Export clicked')
}

function handleImport() {
  // TODO: Implement import functionality
  console.log('Import clicked')
}
</script>

<style scoped>
.meal-history-list {
  min-height: 200px;
}
</style>
