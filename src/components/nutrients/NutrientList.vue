<script setup lang="ts">
import { ref, type Ref } from 'vue'
import NutrientListItem from './NutrientListItem.vue'
import NutrientModal from '../modals/NutrientModal.vue'
import CalculatorSummary from '../calculator/CalculatorSummary.vue'
import CalculatorControls from '../calculator/CalculatorControls.vue'
import { useMealStore } from '@/stores/meal'
import type { Nutrient } from '@/stores/meal'

const props = defineProps<{
  nutrients: Nutrient[]
}>()

const emit = defineEmits(['add', 'reset'])

const store = useMealStore()
const currentNutrient: Ref<Nutrient | null> = ref(null)
const isModalOpen = ref(false)

// Helper to check if a nutrient is empty/unmodified
function isNutrientEmpty(nutrient: Nutrient): boolean {
  const hasNoData = nutrient.quantity === 0 && nutrient.factor === 0
  const hasDefaultName = nutrient.name === '' || nutrient.name === 'Aliment'
  return hasNoData && hasDefaultName
}

async function handleAdd() {
  // Reset currentNutrient to ensure we get a fresh one from props
  currentNutrient.value = null
  await emit('add')
  // Set modal to open immediately
  isModalOpen.value = true
}

function modifyCurrentNutrient(id: string) {
  const nutrientData = props.nutrients.find((item) => item.id === id)
  if (nutrientData) {
    currentNutrient.value = nutrientData
    isModalOpen.value = true
  }
}

async function handleModalClose() {
  isModalOpen.value = false
  if (!currentNutrient.value) return

  // Check if the nutrient is still empty/unmodified
  const nutrientData = props.nutrients.find((item) => item.id === currentNutrient.value?.id)
  if (nutrientData && isNutrientEmpty(nutrientData)) {
    // Remove empty nutrient when cancelled
    await store.removeNutrient(nutrientData.id)
  } else if (nutrientData) {
    currentNutrient.value = nutrientData
  }
}
</script>

<template>
  <div class="nutrient-list">
    <!-- List of nutrients -->
    <NutrientListItem
      v-for="(nutrient, index) in nutrients"
      :key="nutrient.id"
      :nutrient="nutrient"
      :index="index"
      @modify-current-nutrient="modifyCurrentNutrient"
    />

    <!-- Add/Reset controls - Sticky footer -->
    <div class="sticky bottom-0 left-0 right-0 z-10 mt-6">
      <div
        class="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
      >
        <CalculatorSummary
          :total-carbs="nutrients.reduce((sum, n) => sum + n.quantity * n.factor, 0)"
          :nutrient-count="nutrients.length"
        />
        <CalculatorControls @add="handleAdd" @reset="emit('reset')" />
      </div>
    </div>

    <!-- Nutrient editing modal -->
    <NutrientModal
      v-model="isModalOpen"
      :nutrient="
        currentNutrient ||
        nutrients[nutrients.length - 1] || { id: '', name: '', quantity: 0, factor: 0 }
      "
      @cancel-nutrient-changes="handleModalClose"
    />
  </div>
</template>
