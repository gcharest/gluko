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
  if (!currentNutrient.value) return

  const nutrientData = props.nutrients.find((item) => item.id === currentNutrient.value?.id)
  if (nutrientData) {
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

    <!-- Add/Reset controls -->
    <form class="position-sticky bottom-0">
      <div class="card border-2">
        <CalculatorSummary
          :total-carbs="nutrients.reduce((sum, n) => sum + n.quantity * n.factor, 0)"
          :nutrient-count="nutrients.length"
        />
        <CalculatorControls @add="handleAdd" @reset="emit('reset')" />
      </div>
    </form>

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
