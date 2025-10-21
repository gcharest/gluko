<script setup lang="ts">
import { ref, type Ref } from 'vue'
import NutrientListItem from './NutrientListItem.vue'
import NutrientModal from '../modals/NutrientModal.vue'
import CalculatorSummary from '../calculator/CalculatorSummary.vue'
import CalculatorControls from '../calculator/CalculatorControls.vue'
import type { Nutrient } from '@/stores/meal'

const props = defineProps<{
  nutrients: Nutrient[]
}>()

const emit = defineEmits(['add', 'reset'])

const currentNutrient: Ref<Nutrient | null> = ref(null)
const isModalOpen = ref(false)

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

function handleModalClose() {
  isModalOpen.value = false
  // Clear currentNutrient to ensure fresh data on next open
  currentNutrient.value = null
}
</script>

<template>
  <div class="nutrient-list d-flex flex-column h-100">
    <!-- Scrollable list of nutrients -->
    <div class="nutrient-items flex-grow-1 overflow-auto">
      <NutrientListItem
        v-for="(nutrient, index) in nutrients"
        :key="nutrient.id"
        :nutrient="nutrient"
        :index="index"
        @modify-current-nutrient="modifyCurrentNutrient"
      />
    </div>

    <!-- Fixed controls at bottom -->
    <div class="nutrient-controls flex-shrink-0 mt-3">
      <div class="card border-2">
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

<style scoped>
.nutrient-list {
  height: 100%;
  max-height: calc(100vh - 200px); /* Reserve space for header and save button */
}

.nutrient-items {
  overflow-y: auto;
  padding-right: 8px; /* Space for scrollbar */
}

.nutrient-items::-webkit-scrollbar {
  width: 6px;
}

.nutrient-items::-webkit-scrollbar-track {
  background: transparent;
}

.nutrient-items::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.nutrient-items::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
