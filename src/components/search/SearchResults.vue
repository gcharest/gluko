<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { SearchResult } from '@/stores/nutrientsFile'

const props = defineProps<{
  results: SearchResult[]
  showSourceLinks?: boolean
  compact?: boolean
}>()

// Destructure props with refs to maintain reactivity
const { results, showSourceLinks, compact } = toRefs(props)

const emit = defineEmits(['select'])

const cnfLink = computed(() => (foodID: number, locale: string) => {
  return `https://food-nutrition.canada.ca/cnf-fce/serving-portion?id=${foodID}&lang=${locale === 'fr' ? 'fre' : 'eng'}`
})
</script>

<template>
  <div class="search-results">
    <h2 v-if="!compact">
      {{ $t('components.search.results', { count: results?.length }) }}
    </h2>
    <ul v-if="results?.length > 0" class="list-group search-results-list">
      <li v-if="!compact" class="list-group-item">
        <div class="row">
          <div class="col-8 display-6">{{ $t('common.labels.nutrient') }}</div>
          <div class="col-4 display-6 text-center">{{ $t('common.labels.factor') }}</div>
        </div>
      </li>
      <li
        v-for="result in results"
        :key="result.refIndex"
        class="list-group-item list-group-item-action"
        role="button"
        :aria-label="$t('components.search.selectItem', { 
          name: $i18n.locale === 'fr' ? result.item.FoodDescriptionF : result.item.FoodDescription 
        })"
        tabindex="0"
        @click="emit('select', result)"
        @keydown.enter="emit('select', result)"
        @keydown.space.prevent="emit('select', result)">
        <div class="row">
          <div class="col-8">
            <p class="mb-1">
              <i v-if="compact" class="bi bi-plus-circle me-2"></i>
              <span v-if="$i18n.locale === 'fr'">{{ result.item.FoodDescriptionF }}</span>
              <span v-else>{{ result.item.FoodDescription }}</span>
            </p>
            <a
              v-if="showSourceLinks"
              :href="cnfLink(result.item.FoodCode, $i18n.locale)"
              target="_blank"
              class="link-primary small"
              @click.stop>
              {{ $t('components.search.source') }}
              <i class="bi bi-box-arrow-up-right" />
            </a>
          </div>
          <div class="col-4">
            <p class="text-center mb-0">
              {{ result.item.FctGluc !== null
                ? result.item.FctGluc.toFixed(2)
                : (result.item['205'] / 100).toFixed(2)
              }}
            </p>
          </div>
        </div>
      </li>
    </ul>
    <ul v-else class="list-group">
      <li class="list-group-item">{{ $t('common.labels.noResults') }}</li>
    </ul>
  </div>
</template>

<style scoped>
.search-results-list .list-group-item-action {
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-results-list .list-group-item-action:hover,
.search-results-list .list-group-item-action:focus {
  transform: translateX(4px);
  background-color: var(--bs-list-group-action-hover-bg);
}

.search-results-list .list-group-item-action:focus {
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
  z-index: 1;
}

.search-results-list .list-group-item-action:active {
  transform: translateX(2px);
}
</style>]]>