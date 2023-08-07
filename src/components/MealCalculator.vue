<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'
import NutrientListItem from './NutrientListItem.vue'
import NutrientModal from './NutrientModal.vue'
import { useMealStore, type Nutrient } from '@/stores/meal'
import { Modal } from 'bootstrap'

const store = useMealStore()
onBeforeMount(() => {
  if (store.mealNutrients.length === 0) {
    store.$reset()
  }
})

const currentNutrient: Ref<Nutrient> = ref(store.mealNutrients[0])

function resetMealNutrients() {
  store.$reset()
  currentNutrient.value = store.mealNutrients[0]
  showNutrientModal()
}

function showNutrientModal() {
  const nutrientModal = document.getElementById('nutrient-modal')
  if (nutrientModal) {
    const modal = new Modal(nutrientModal)
    modal.show()
  }
}

function addNewNutrient() {
  store.addEmptyNutrient()
  currentNutrient.value = store.mealNutrients[store.mealNutrients.length - 1]
  showNutrientModal()
}

function modifyCurrentNutrient(id: string) {
  //Update current nutrient with a temporary copy of the nutrient
  const nutrientData = store.mealNutrients.find((item) => item.id === id)
  if (nutrientData) {
    currentNutrient.value = nutrientData
    showNutrientModal()
  }
}

function cancelNutrientChanges() {
  //Update current nutrient with a temporary copy of the nutrient
  const nutrientData = store.mealNutrients.find((item) => item.id === currentNutrient.value.id)
  if (nutrientData) {
    currentNutrient.value = nutrientData
  }
}
</script>

<template>
  <div class="container-fluid">
    <NutrientListItem
      v-for="(nutrient) in store.mealNutrients as Nutrient[]"
      :key="nutrient.id"
      :nutrient="nutrient"
      @modifyCurrentNutrient="(id: string) => modifyCurrentNutrient(id)"
    />
  </div>
  <form class="position-sticky bottom-0">
    <div class="card border-2 p-2">
      <div class="row">
        <div class="card-body">
          <h2 class="card-title">
            {{ $t('message') }}: {{ (Math.round(store.mealCarbs * 100) / 100).toFixed(2) }} g
          </h2>
          <p>{{ $t('mealNutrientLength') }}: {{ store.mealNutrients.length }}</p>
        </div>
      </div>

      <div class="col">
        <button type="button" class="btn btn-primary m-2" @click="addNewNutrient">
          {{ $t('Ajouter un aliment') }}
        </button>
        <button type="button" class="btn btn-secondary m-2" @click="resetMealNutrients">
          {{ $t('Reset') }}
        </button>
      </div>
    </div>
  </form>
  <NutrientModal
    v-if="store.mealNutrients.length > 0"
    :nutrient="currentNutrient"
    @cancelNutrientChanges="cancelNutrientChanges"
  />
</template>
