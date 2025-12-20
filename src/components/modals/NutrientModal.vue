<script setup lang="ts">
import { ref, type PropType, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Nutrient } from '@/stores/meal'
import type { SearchResult } from '@/stores/nutrientsFile'
import { useMealStore } from '@/stores/meal'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import NutrientSearch from '@/components/search/NutrientSearch.vue'

const { locale } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nutrient: { type: Object as PropType<Nutrient>, required: true }
})

const emit = defineEmits(['update:modelValue', 'cancelNutrientChanges'])
const mealStore = useMealStore()

const currentNutrient = ref<Nutrient>({
  id: crypto.randomUUID(),
  name: '',
  quantity: 0,
  factor: 0
})

// Watch for nutrient changes to update local state
watch(
  () => props.nutrient,
  (newVal) => {
    if (newVal) {
      // Deep clone the nutrient, preserving the ID for existing nutrients
      currentNutrient.value = JSON.parse(JSON.stringify(newVal))
    }
  },
  { immediate: true }
)

async function saveNutrient() {
  try {
    if (!props.nutrient.id) {
      // For new nutrients
      await mealStore.addNutrient(currentNutrient.value)
    } else {
      // For existing nutrients
      await mealStore.updateNutrient(currentNutrient.value)
    }
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Failed to save nutrient:', err)
  }
}

function cancelNutrientChanges() {
  currentNutrient.value = JSON.parse(JSON.stringify(props.nutrient))
  emit('cancelNutrientChanges')
  emit('update:modelValue', false)
}

// Input event handlers
function handleInputFocus(event: FocusEvent) {
  const input = event.target as HTMLInputElement
  input?.select?.()
}

function handleNutrientSelect(result: SearchResult) {
  currentNutrient.value.name = result.item[`FoodDescription${locale.value === 'fr' ? 'F' : ''}`]
  currentNutrient.value.factor =
    result.item.FctGluc !== null ? result.item.FctGluc : result.item['205'] / 100

  // Focus quantity field after selection
  const quantityInput = document.getElementById('nutrient-quantity') as HTMLInputElement | null
  quantityInput?.focus()
}
</script>

<template>
  <BaseModal
    :open="modelValue"
    :title="currentNutrient.name || $t('components.nutrientModal.fields.name')"
    @update:open="(val) => emit('update:modelValue', val)"
  >
    <!-- Search Section -->
    <div class="mb-6">
      <label for="searchInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ $t('components.nutrientModal.search.label') }}
      </label>
      <NutrientSearch
        :auto-search="false"
        :clear-after-select="true"
        :show-source-links="false"
        :compact-results="true"
        :search-button-label="$t('components.nutrientModal.search.button')"
        :placeholder="$t('components.nutrientModal.search.placeholder')"
        @select="handleNutrientSelect"
      />
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('components.nutrientModal.search.helper') }}
      </p>
    </div>

    <!-- Form Fields -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <div class="md:col-span-2 lg:col-span-3">
        <BaseInput
          id="nutrient-name"
          v-model="currentNutrient.name"
          type="text"
          :label="$t('components.nutrientModal.fields.name')"
          :aria-label="$t('components.nutrientModal.fields.name')"
          @focus="handleInputFocus"
        />
      </div>
      <div class="lg:col-span-1.5">
        <BaseInput
          id="nutrient-quantity"
          v-model.number="currentNutrient.quantity"
          type="number"
          pattern="[0-9]*"
          inputmode="decimal"
          :label="$t('components.nutrientModal.fields.quantity')"
          :aria-label="$t('components.nutrientModal.fields.quantity')"
          @focus="handleInputFocus"
        />
      </div>
      <div class="lg:col-span-1.5">
        <BaseInput
          id="nutrient-factor"
          v-model.number="currentNutrient.factor"
          type="number"
          pattern="[0-9]*"
          inputmode="decimal"
          :label="$t('components.nutrientModal.fields.factor')"
          :aria-label="$t('components.nutrientModal.fields.factor')"
          @focus="handleInputFocus"
        />
      </div>
    </div>

    <!-- Subtotal Display -->
    <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
      <p class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('common.labels.subtotal') }}:
        <span class="text-primary-700 dark:text-primary-400">
          {{ (currentNutrient.quantity * currentNutrient.factor).toFixed(2) }} g
        </span>
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 justify-end">
      <BaseButton variant="secondary" @click="cancelNutrientChanges">
        {{ $t('components.nutrientModal.actions.close') }}
      </BaseButton>
      <BaseButton variant="primary" @click="saveNutrient">
        {{ $t('components.nutrientModal.actions.save') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
