<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNutrientFileStore } from '@/stores/nutrientsFile'

const store = useNutrientFileStore()

const search = ref('')
const searchInput = ref('')

const searchResults = computed(() => {
  return store.searchNutrients(search.value)
})

const cnfLink = computed(() => (foodID: number, locale: string) => {
  return `https://food-nutrition.canada.ca/cnf-fce/serving-portion?id=${foodID}&lang=${locale === 'fr' ? 'fre' : 'eng'
    }`
})

// Trigger search from button click or enter key
const triggerSearch = () => {
  search.value = searchInput.value.trim()
}

// Handle enter key in input
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    triggerSearch()
  }
}
</script>
<template>
  <div class="container">
    <h2>{{ $t('Search a nutrient') }}</h2>
    <div class="row">
      <div class="col">
        <div class="input-group mb-3">
          <button class="btn btn-outline-secondary" type="button" id="button-search-nutrient" aria-label="Search"
            @click="triggerSearch">
            <i class="bi bi-search" /> {{ $t('Search') }}
          </button>
          <input type="text" class="form-control" :placeholder="$t('Search a nutrient')" v-model="searchInput"
            @keydown="handleKeydown" id="searchInput" />
        </div>
      </div>
      <div>
        <h2>
          {{ $t('Results')
          }}<span v-if="searchResults.length > 0"> ({{ searchResults.length }})</span>
        </h2>
        <ul class="list-group" v-if="searchResults !== undefined && searchResults.length > 0">
          <li class="list-group-item">
            <div class="row">
              <div class="col-8 display-6">{{ $t('Nutrient') }}</div>
              <div class="col-4 display-6 text-center">{{ $t('Facteur') }}</div>
            </div>
          </li>
          <li class="list-group-item" v-for="result in searchResults" :key="result.refIndex">
            <div class="row">
              <div class="col-8">
                <p>
                  <span v-if="$i18n.locale === 'fr'">{{ result.item.FoodDescriptionF }}</span>
                  <span v-else>{{ result.item.FoodDescription }}</span>
                  <a :href="cnfLink(result.item.FoodCode, $i18n.locale)" target="_blank" class="link-primary small">
                    Source <i class="bi bi-box-arrow-up-right" />
                  </a>
                </p>
              </div>
              <div class="col-4">
                <p class="text-center">
                  {{
                    result.item.FctGluc !== null
                      ? result.item.FctGluc.toFixed(2)
                      : (result.item['205'] / 100).toFixed(2)
                  }}
                </p>
              </div>
            </div>
          </li>
        </ul>
        <ul class="list-group" v-else>
          <li class="list-group-item">{{ $t('No results') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
