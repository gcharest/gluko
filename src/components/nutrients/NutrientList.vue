<script setup lang="ts">
import { ref, type Ref } from 'vue'
import NutrientListItem from './NutrientListItem.vue'
import NutrientModal from '../modals/NutrientModal.vue'
import CalculatorSummary from '../calculator/CalculatorSummary.vue'
import CalculatorControls from '../calculator/CalculatorControls.vue'
import BaseSkeletonCard from '../base/BaseSkeletonCard.vue'
import type { Nutrient } from '@/stores/meal'

const props = defineProps<{
  nutrients: Nutrient[]
}>()

const emit = defineEmits(['add', 'reset'])

const currentNutrient: Ref<Nutrient | null> = ref(null)
const isModalOpen = ref(false)
const isLoading = ref(false)

async function handleAdd() {
  isLoading.value = true
  // Reset currentNutrient to ensure we get a fresh one from props
  currentNutrient.value = null
  await emit('add')
  // Set modal to open immediately
  isModalOpen.value = true
  isLoading.value = false
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
    <div class="nutrient-items flex-grow-1 overflow-auto custom-scrollbar">
      <Transition name="fade" mode="out-in">
        <div v-if="isLoading" key="loading">
          <BaseSkeletonCard v-for="i in 2" :key="i" />
        </div>
        <div v-else key="loaded">
          <TransitionGroup name="list" tag="div">
            <NutrientListItem
              v-for="(nutrient, index) in nutrients"
              :key="nutrient.id"
              :nutrient="nutrient"
              :index="index"
              @modify-current-nutrient="modifyCurrentNutrient"
            />
          </TransitionGroup>
        </div>
      </Transition>
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

/* List transition animations */
.list-enter-active {
  transition: all 0.3s ease-out;
}
.list-leave-active {
  transition: all 0.3s ease-in;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
