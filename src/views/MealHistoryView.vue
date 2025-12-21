<template>
  <div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
      {{ $t('navigation.history') }}
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Filters Sidebar -->
      <div class="md:col-span-1">
        <BaseCard>
          <template #header>
            <button
              type="button"
              class="flex items-center justify-between w-full text-left md:cursor-default"
              :class="{ 'md:pointer-events-none': true }"
              @click="toggleFilters"
            >
              <h2 class="text-lg font-semibold">{{ $t('views.mealHistory.filters.title') }}</h2>
              <ChevronDownIcon
                class="w-5 h-5 transition-transform duration-200 md:hidden"
                :class="{ 'rotate-180': filtersExpanded }"
              />
            </button>
          </template>

          <div v-show="filtersExpanded || isDesktop" class="space-y-4">
            <!-- Date Range Filter -->
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('views.mealHistory.filters.dateRange') }}
              </h3>
              <DateRangeFilter v-model="dateRange" />
            </div>

            <!-- Subject Filter -->
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('views.mealHistory.filters.subject') }}
              </h3>
              <SubjectSelector v-model="selectedSubjectId" @add="handleAddSubject" />
            </div>

            <!-- Tags Filter -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-base font-medium text-gray-900 dark:text-white">
                  {{ $t('views.mealHistory.filters.tags') }}
                </h3>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  :aria-label="$t('views.mealHistory.filters.manageTags')"
                  @click="handleManageTags"
                >
                  <TagIcon class="w-4 h-4" />
                </BaseButton>
              </div>
              <TagSelector v-model="selectedTagIds" @manage="handleManageTags" />
            </div>

            <!-- Search Filter -->
            <div>
              <label
                for="searchInput"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >{{ $t('views.mealHistory.filters.search') }}</label
              >
              <BaseInput
                id="searchInput"
                v-model="searchQuery"
                type="search"
                :placeholder="$t('views.mealHistory.filters.searchPlaceholder')"
              />
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Main Content -->
      <div class="md:col-span-3">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('views.mealHistory.results.title') }}
          </h2>
          <div class="flex gap-2">
            <!-- Export/Import buttons -->
            <BaseButton variant="secondary" @click="handleExport">
              <DownloadIcon class="w-4 h-4" />
              {{ $t('views.mealHistory.actions.export') }}
            </BaseButton>
            <BaseButton variant="secondary" @click="handleImport">
              <UploadIcon class="w-4 h-4" />
              {{ $t('views.mealHistory.actions.import') }}
            </BaseButton>
          </div>
        </div>

        <!-- Results count and page size selector -->
        <div class="flex justify-between items-center mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('views.mealHistory.results.count', { count: totalResults }) }}
          </p>
          <div class="flex items-center gap-2">
            <label for="page-size-select" class="text-sm text-gray-700 dark:text-gray-300">{{
              $t('views.mealHistory.results.perPage')
            }}</label>
            <select
              id="page-size-select"
              v-model="pageSize"
              class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              :aria-label="$t('views.mealHistory.results.perPage')"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
            role="status"
          >
            <span class="sr-only">Loading...</span>
          </div>
        </div>

        <!-- Error state -->
        <BaseAlert v-else-if="error" variant="danger">
          {{ error }}
        </BaseAlert>

        <!-- Empty state -->
        <div v-else-if="!totalResults" class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400">{{ $t('views.mealHistory.empty') }}</p>
        </div>

        <!-- Results list -->
        <div v-else class="space-y-3">
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
        <nav v-if="totalPages > 1" aria-label="Meal history pagination" class="mt-6">
          <ul class="flex justify-center items-center gap-1">
            <!-- Previous page -->
            <li>
              <button
                type="button"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="currentPage === 1"
                :aria-label="$t('common.pagination.previous')"
                @click="currentPage--"
              >
                <ChevronLeftIcon class="w-4 h-4" />
              </button>
            </li>

            <!-- Page numbers -->
            <li v-for="page in displayedPages" :key="page">
              <button
                v-if="typeof page === 'number'"
                type="button"
                class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                :class="
                  page === currentPage
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                "
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <span v-else class="px-2 text-gray-500">{{ page }}</span>
            </li>

            <!-- Next page -->
            <li>
              <button
                type="button"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="currentPage === totalPages"
                :aria-label="$t('common.pagination.next')"
                @click="currentPage++"
              >
                <ChevronRightIcon class="w-4 h-4" />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <UnsavedChangesModal
      v-model="showUnsavedDialog"
      :current-nutrient-count="mealStore.nutrientCount"
      :current-total-carbs="mealStore.mealCarbs"
      @save-and-load="handleSaveAndLoad"
      @discard-and-load="handleDiscardAndLoad"
      @cancel="handleCancelDialog"
    />

    <!-- Import Confirmation Modal -->
    <ImportConfirmModal
      v-model="showImportDialog"
      :entry-count="importValidation?.entryCount"
      :version="importValidation?.version"
      @merge="handleImportMerge"
      @replace="handleImportReplace"
      @cancel="handleImportCancel"
    />

    <!-- Subject Management Modal -->
    <SubjectManagementModal v-model="showSubjectManagementDialog" />

    <!-- Tag Management Modal -->
    <TagManagementModal v-model="showTagManagementDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMealHistoryStore } from '@/stores/mealHistory'
import { useSubjectStore } from '@/stores/subject'
import { useMealStore } from '@/stores/meal'
import { useToast } from '@/composables/useToast'
import type { MealHistoryEntry } from '@/types/meal-history'
import type { HistoryExport } from '@/types/history-export'
import { downloadJSON, pickFile, readJSONFile, generateExportFilename } from '@/utils/fileHandling'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import SubjectSelector from '@/components/filters/SubjectSelector.vue'
import TagSelector from '@/components/filters/TagSelector.vue'
import MealHistoryCard from '@/components/history/MealHistoryCard.vue'
import UnsavedChangesModal from '@/components/modals/UnsavedChangesModal.vue'
import ImportConfirmModal from '@/components/modals/ImportConfirmModal.vue'
import SubjectManagementModal from '@/components/modals/SubjectManagementModal.vue'
import TagManagementModal from '@/components/modals/TagManagementModal.vue'
import {
  DownloadIcon,
  UploadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TagIcon
} from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const mealHistoryStore = useMealHistoryStore()
const subjectStore = useSubjectStore()
const mealStore = useMealStore()
const toast = useToast()

// Filters collapse state (mobile)
const filtersExpanded = ref(false)
const isDesktop = ref(window.innerWidth >= 768) // md breakpoint

function toggleFilters() {
  if (!isDesktop.value) {
    filtersExpanded.value = !filtersExpanded.value
  }
}

function handleResize() {
  isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

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
const selectedTagIds = computed({
  get: () => mealHistoryStore.selectedTags,
  set: (val: string[]) => mealHistoryStore.setSelectedTags(val)
})

// Get paginated meals from store
const paginatedMeals = computed(() => mealHistoryStore.paginatedEntries)

// UI state
const loading = ref(false) // Could be set from store if async
const localError = ref<Error | null>(null)
const error = computed(() => localError.value?.message || mealHistoryStore.error?.message || null)

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

// Unsaved changes dialog state
const showUnsavedDialog = ref(false)
const pendingHistoryId = ref<string | null>(null)
const pendingAction = ref<'edit' | 'duplicate'>('edit')

// Import dialog state
const showImportDialog = ref(false)
const pendingImportData = ref<HistoryExport | null>(null)
const importValidation = ref<{ version?: string; entryCount?: number } | null>(null)

// Subject management dialog state
const showSubjectManagementDialog = ref(false)

// Tag management dialog state
const showTagManagementDialog = ref(false)

// Event handlers
function handleAddSubject() {
  showSubjectManagementDialog.value = true
}

function handleManageTags() {
  showTagManagementDialog.value = true
}

async function handleEditMeal(meal: MealHistoryEntry) {
  // Attempt to load history entry into calculator
  const result = await mealStore.loadFromHistory(meal.id)

  if (!result.success && result.reason === 'unsaved-changes') {
    // Show confirmation dialog
    pendingHistoryId.value = meal.id
    pendingAction.value = 'edit'
    showUnsavedDialog.value = true
  } else if (result.success) {
    // Navigate to calculator
    toast.success(t('toasts.history.loadedForEditing'))
    router.push('/calculator')
  } else {
    // Show error
    console.error('Failed to load meal:', result.reason)
    localError.value = new Error(result.reason || 'Failed to load meal')
  }
}

async function handleSaveAndLoad() {
  if (!pendingHistoryId.value) return

  const success = await mealStore.saveAndLoad(pendingHistoryId.value)

  showUnsavedDialog.value = false

  if (success) {
    // If duplicating, clear editing mode so it saves as new
    if (pendingAction.value === 'duplicate') {
      mealStore.clearEditingMode()
      toast.info(t('toasts.history.duplicated'))
    } else {
      toast.success(t('toasts.history.loadedForEditing'))
    }
    router.push('/calculator')
  } else {
    localError.value = new Error('Failed to save and load meal')
    toast.error(t('toasts.history.exportError'))
  }

  pendingHistoryId.value = null
  pendingAction.value = 'edit'
}

async function handleDiscardAndLoad() {
  if (!pendingHistoryId.value) return

  const success = await mealStore.discardAndLoad(pendingHistoryId.value)

  showUnsavedDialog.value = false

  if (success) {
    // If duplicating, clear editing mode so it saves as new
    if (pendingAction.value === 'duplicate') {
      mealStore.clearEditingMode()
      toast.info(t('toasts.history.duplicated'))
    } else {
      toast.success(t('toasts.history.loadedForEditing'))
    }
    router.push('/calculator')
  }

  pendingHistoryId.value = null
  pendingAction.value = 'edit'
}

function handleCancelDialog() {
  showUnsavedDialog.value = false
  pendingHistoryId.value = null
  pendingAction.value = 'edit'
}

async function handleDuplicateMeal(meal: MealHistoryEntry) {
  // Check for unsaved changes (same as edit)
  const result = await mealStore.loadFromHistory(meal.id)

  if (!result.success && result.reason === 'unsaved-changes') {
    // Show confirmation dialog with duplicate action
    pendingHistoryId.value = meal.id
    pendingAction.value = 'duplicate'
    showUnsavedDialog.value = true
  } else if (result.success) {
    // Clear editing mode (so it saves as new)
    mealStore.clearEditingMode()
    toast.info(t('toasts.history.duplicated'))
    router.push('/calculator')
  }
}

async function handleDeleteMeal(meal: MealHistoryEntry) {
  const success = await mealHistoryStore.deleteEntry(meal.id)
  if (success) {
    toast.success(t('toasts.history.mealDeleted'))
  }
}

function handleExport() {
  try {
    // Get current subject name for filename
    const currentSubject = selectedSubjectId.value
      ? subjectStore.subjects.find((s) => s.id === selectedSubjectId.value)
      : null
    const subjectSuffix = currentSubject ? currentSubject.name : undefined

    // Export history data
    const exportData = mealHistoryStore.exportHistory(
      currentSubject ? { subjectId: currentSubject.id } : undefined
    )

    // Generate filename and download
    const filename = generateExportFilename('gluko-history', subjectSuffix)
    downloadJSON(exportData, filename)

    // Show success toast
    toast.success(
      t('toasts.history.exportSuccess', {
        count: exportData.metadata.entryCount
      })
    )
  } catch (err) {
    console.error('Export failed:', err)
    toast.error(t('toasts.history.exportError'))
  }
}

async function handleImport() {
  try {
    // Pick file
    const file = await pickFile('.json')
    if (!file) return // User cancelled

    // Read and parse JSON
    const data = await readJSONFile(file)

    // Validate import data
    const validation = mealHistoryStore.validateImport(data)

    if (!validation.valid) {
      // Show validation errors
      const errorMessage = validation.errors.join(', ')
      toast.error(`Import failed: ${errorMessage}`)
      return
    }

    // Store data and show confirmation modal
    pendingImportData.value = data as HistoryExport
    importValidation.value = {
      version: validation.version,
      entryCount: validation.entryCount
    }
    showImportDialog.value = true
  } catch (err) {
    console.error('Import failed:', err)
    toast.error(t('toasts.history.exportError'))
  }
}

async function handleImportMerge() {
  if (!pendingImportData.value) return

  try {
    const result = await mealHistoryStore.importHistory(pendingImportData.value, 'merge')

    if (result.errors.length > 0) {
      toast.warning(
        t('toasts.history.importPartialError', {
          imported: result.imported,
          failed: result.errors.length
        })
      )
    } else {
      toast.success(
        t('toasts.history.importSuccess', {
          imported: result.imported,
          skipped: result.skipped
        })
      )
    }
  } catch (err) {
    console.error('Merge import failed:', err)
    toast.error(t('toasts.history.exportError'))
  } finally {
    pendingImportData.value = null
    importValidation.value = null
  }
}

async function handleImportReplace() {
  if (!pendingImportData.value) return

  try {
    const result = await mealHistoryStore.importHistory(pendingImportData.value, 'replace')

    if (result.errors.length > 0) {
      toast.warning(
        t('toasts.history.importPartialError', {
          imported: result.imported,
          failed: result.errors.length
        })
      )
    } else {
      toast.success(
        t('toasts.history.importSuccess', {
          imported: result.imported,
          skipped: result.skipped
        })
      )
    }
  } catch (err) {
    console.error('Replace import failed:', err)
    toast.error(t('toasts.history.exportError'))
  } finally {
    pendingImportData.value = null
    importValidation.value = null
  }
}

function handleImportCancel() {
  pendingImportData.value = null
  importValidation.value = null
}
</script>
