<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useNutrientFileStore } from '@/stores/nutrientsFile'
import SearchResults from './SearchResults.vue'

const props = defineProps({
  placeholder: { type: String, default: '' },
  autoSearch: { type: Boolean, default: false }, // If true, search happens on input
  clearAfterSelect: { type: Boolean, default: false },
  showSourceLinks: { type: Boolean, default: true }, // Whether to show CNF source links
  compactResults: { type: Boolean, default: false }, // Use a more compact results display
  searchButtonLabel: { type: String, default: '' }, // Custom label for search button
  searchOnEnter: { type: Boolean, default: true } // Whether to trigger search on Enter key
})

const emit = defineEmits(['select'])

const store = useNutrientFileStore()
const searchInput = ref('')
const search = ref('')
const loading = ref(false)

const searchResults = computed(() => {
  return store.searchNutrients(search.value)
})

// Update loading state when search changes
watch(search, async () => {
  if (search.value) {
    loading.value = true
    try {
      await nextTick() // Wait for search results to be computed
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

// Trigger search from button click or enter key
const triggerSearch = () => {
  search.value = searchInput.value.trim()
}

// Handle enter key in input
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && props.searchOnEnter) {
    event.preventDefault()
    triggerSearch()
  }
}

// Handle input changes
const handleInput = () => {
  if (props.autoSearch) {
    const trimmedValue = searchInput.value.trim()
    if (trimmedValue.length >= 2) {
      // Only search if there are at least 2 characters
      search.value = trimmedValue
    } else {
      search.value = '' // Clear results if input is too short
    }
  }
}

const handleSelect = (item: any) => {
  emit('select', item)
  if (props.clearAfterSelect) {
    searchInput.value = ''
    search.value = ''
  }
}
</script>

<template>
  <div class="nutrient-search">
    <div class="input-group mb-3">
      <input
        id="searchInput"
        ref="inputRef"
        v-model="searchInput"
        type="text"
        class="form-control"
        :placeholder="placeholder || $t('components.search.placeholder')"
        :aria-label="placeholder || $t('components.search.placeholder')"
        @keydown="handleKeydown"
        @input="handleInput"
      />
      <button
        v-if="!autoSearch"
        id="button-search-nutrient"
        class="btn btn-outline-secondary"
        type="button"
        :aria-label="searchButtonLabel || $t('common.actions.search')"
        @click="triggerSearch"
      >
        <i class="bi bi-search" /> {{ searchButtonLabel || $t('common.actions.search') }}
      </button>
    </div>

    <div v-if="search" aria-live="polite">
      <div v-if="loading" class="mt-2">{{ $t('common.labels.loading') }}...</div>
      <SearchResults
        v-if="searchResults.length > 0"
        :results="searchResults"
        :show-source-links="showSourceLinks"
        :compact="compactResults"
        @select="handleSelect"
      />
      <p v-else class="mt-2 text-muted">
        {{ $t('components.search.noResults') }}
      </p>
    </div>
  </div>
</template>
