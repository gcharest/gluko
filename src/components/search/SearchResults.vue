<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { SearchResult } from '@/stores/nutrientsFile'
import BaseCard from '@/components/base/BaseCard.vue'
import { PlusCircleIcon, ExternalLinkIcon } from 'lucide-vue-next'

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
    <h2 v-if="!compact" class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
      {{ $t('components.search.results', { count: results?.length }) }}
    </h2>

    <div v-if="results?.length > 0" class="space-y-2">
      <!-- Header row (only in non-compact mode) -->
      <div v-if="!compact"
        class="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <div class="col-span-8">{{ $t('common.labels.nutrient') }}</div>
        <div class="col-span-4 text-center">{{ $t('common.labels.factor') }}</div>
      </div>

      <!-- Results list -->
      <BaseCard v-for="result in results" :key="result.refIndex"
        class="cursor-pointer transition-all duration-200 hover:translate-x-1 hover:shadow-md focus-within:ring-2 focus-within:ring-primary-500"
        role="button" :aria-label="$t('components.search.selectItem', {
          name: $i18n.locale === 'fr' ? result.item.FoodDescriptionF : result.item.FoodDescription
        })
          " tabindex="0" @click="emit('select', result)" @keydown.enter="emit('select', result)"
        @keydown.space.prevent="emit('select', result)">
        <div class="grid grid-cols-12 gap-4 items-center">
          <div class="col-span-8">
            <p class="flex items-center gap-2 mb-1 text-gray-900 dark:text-white">
              <PlusCircleIcon v-if="compact" class="w-4 h-4 text-primary-700 dark:text-primary-400 shrink-0" />
              <span v-if="$i18n.locale === 'fr'">{{ result.item.FoodDescriptionF }}</span>
              <span v-else>{{ result.item.FoodDescription }}</span>
            </p>
            <a v-if="showSourceLinks" :href="cnfLink(result.item.FoodCode, $i18n.locale)" target="_blank"
              class="inline-flex items-center gap-1 text-sm text-primary-700 dark:text-primary-400 underline hover:no-underline"
              @click.stop>
              {{ $t('components.search.source') }}
              <ExternalLinkIcon class="w-3 h-3" />
            </a>
          </div>
          <div class="col-span-4 text-center">
            <p class="font-semibold text-gray-900 dark:text-white">
              {{
                result.item.FctGluc !== null
                  ? result.item.FctGluc.toFixed(2)
                  : (result.item['205'] / 100).toFixed(2)
              }}
            </p>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
]]>
