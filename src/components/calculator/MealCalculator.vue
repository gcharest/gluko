<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import NutrientList from '@/components/nutrients/NutrientList.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { useMealStore } from '@/stores/meal'

const store = useMealStore()
const showResetConfirmation = ref(false)

onBeforeMount(() => {
  if (store.mealNutrients.length === 0) {
    store.$reset()
  }
})

function handleResetConfirm() {
  store.$reset()
  showResetConfirmation.value = false
}

function handleReset() {
  showResetConfirmation.value = true
}

function handleAdd() {
  store.addEmptyNutrient()
  // Get the last added nutrient
  return store.mealNutrients[store.mealNutrients.length - 1]
}
</script>

<template>
  <NutrientList :nutrients="store.mealNutrients" @add="handleAdd" @reset="handleReset" />

  <ConfirmationModal
v-model="showResetConfirmation" :title="$t('modals.confirmation.reset.title')"
    :message="$t('modals.confirmation.reset.message')" :confirm-label="$t('modals.confirmation.reset.confirmLabel')"
    :cancel-label="$t('modals.confirmation.reset.cancelLabel')" confirm-variant="warning"
    @confirm="handleResetConfirm" />
</template>
