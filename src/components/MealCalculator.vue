<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'
import NutrientListItem from './NutrientListItem.vue'
import NutrientModal from './NutrientModal.vue'
import ConfirmationModal from './ConfirmationModal.vue'
import { useMealStore, type Nutrient } from '@/stores/meal'

const store = useMealStore()
onBeforeMount(() => {
  if (store.mealNutrients.length === 0) {
    store.$reset()
  }
})

const currentNutrient: Ref<Nutrient> = ref(store.mealNutrients[0])
const isModalOpen = ref(false)
const showResetConfirmation = ref(false)

function handleResetConfirm() {
  store.$reset()
  currentNutrient.value = store.mealNutrients[0]
  // Let the user decide when to modify the default nutrient
  showResetConfirmation.value = false
}

function resetMealNutrients() {
  showResetConfirmation.value = true
}

function addNewNutrient() {
  store.addEmptyNutrient()
  currentNutrient.value = store.mealNutrients[store.mealNutrients.length - 1]
  isModalOpen.value = true
}

function modifyCurrentNutrient(id: string) {
  const nutrientData = store.mealNutrients.find((item) => item.id === id)
  if (nutrientData) {
    currentNutrient.value = nutrientData
    isModalOpen.value = true
  }
}

function handleModalClose() {
  isModalOpen.value = false
  const nutrientData = store.mealNutrients.find(
    (item) => item.id === currentNutrient.value.id
  )
  if (nutrientData) {
    currentNutrient.value = nutrientData
  }
}
</script>

<template>
  <NutrientListItem
v-for="(nutrient, index) in store.mealNutrients as Nutrient[]" :key="nutrient.id"
    :nutrient="nutrient" :index="index" @modify-current-nutrient="(id: string) => modifyCurrentNutrient(id)" />
  <form class="position-sticky bottom-0">
    <div class="card border-2">
      <div class="card-body pb-0 pb-md-1 pt-1 pt-md-2">
        <h2 class="card-title">
          {{ $t('components.mealCalculator.totalCarbs') }}: {{ (Math.round(store.mealCarbs * 100) / 100).toFixed(2) }} g
        </h2>
        <p>{{ $t('components.mealCalculator.nutrientCount') }}: {{ store.mealNutrients.length }}</p>
      </div>
      <div class="card-footer">
        <button type="button" class="btn btn-primary m-2" @click="addNewNutrient">
          {{ $t('components.mealCalculator.actions.addNutrient') }}
        </button>
        <button type="button" class="btn btn-secondary m-2" @click="resetMealNutrients">
          {{ $t('components.mealCalculator.actions.reset') }}
        </button>
      </div>
    </div>
  </form>
  <NutrientModal
v-if="store.mealNutrients.length > 0" v-model="isModalOpen" :nutrient="currentNutrient"
    @cancel-nutrient-changes="handleModalClose" />

  <ConfirmationModal
v-model="showResetConfirmation" :title="$t('modals.confirmation.reset.title')"
    :message="$t('modals.confirmation.reset.message')" :confirm-label="$t('modals.confirmation.reset.confirmLabel')"
    :cancel-label="$t('modals.confirmation.reset.cancelLabel')" confirm-variant="warning"
    @confirm="handleResetConfirm" />
</template>
