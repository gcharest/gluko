<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NutrientList from '@/components/nutrients/NutrientList.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import SaveMealModal from '@/components/modals/SaveMealModal.vue'
import TagManagementModal from '@/components/modals/TagManagementModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useMealStore } from '@/stores/meal'
import { useToast } from '@/composables/useToast'
import type { Nutrient } from '@/types/meal-history'
import { BookPlusIcon } from 'lucide-vue-next'

const store = useMealStore()
const toast = useToast()
const { t } = useI18n()

const showResetConfirmation = ref(false)
const showSaveDialog = ref(false)
const showTagManagementDialog = ref(false)

const nutrientCount = computed(() => store.nutrientCount)
const totalCarbs = computed(() => store.mealCarbs)
const isEditing = computed(() => !!store.editingHistoryId)

onBeforeMount(async () => {
  if (store.nutrientEmpty) {
    await store.addEmptyNutrient()
  }
})

async function handleResetConfirm() {
  await store.clearSession()
  await store.addEmptyNutrient()
  showResetConfirmation.value = false
}

function handleReset() {
  showResetConfirmation.value = true
}

async function handleAdd() {
  await store.addEmptyNutrient()
}

function handleSaveToHistory() {
  showSaveDialog.value = true
}

async function handleSaveConfirm(data: {
  subjectId: string
  name?: string
  notes?: string
  tags?: string[]
}) {
  const result = await store.saveMealToHistory(data)

  if (result.success) {
    if (isEditing.value) {
      toast.success(t('toasts.calculator.mealUpdated'))
    } else {
      toast.success(t('toasts.calculator.mealSaved'))
    }
  } else {
    toast.error(t('toasts.history.exportError'))
  }
}

function handleManageTags() {
  showTagManagementDialog.value = true
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <NutrientList :nutrients="store.currentNutrients" @add="handleAdd" @reset="handleReset" />

    <!-- Save to history button -->
    <BaseButton
      variant="primary"
      class="w-full"
      :disabled="
        !store.currentNutrients.length || store.currentNutrients.every((n: Nutrient) => !n.quantity)
      "
      @click="handleSaveToHistory"
    >
      <BookPlusIcon class="w-5 h-5 mr-2" />
      {{ $t('components.mealCalculator.actions.saveToHistory') }}
    </BaseButton>
  </div>

  <ConfirmationModal
    v-model="showResetConfirmation"
    :title="$t('modals.confirmation.reset.title')"
    :message="$t('modals.confirmation.reset.message')"
    :confirm-label="$t('modals.confirmation.reset.confirmLabel')"
    :cancel-label="$t('modals.confirmation.reset.cancelLabel')"
    confirm-variant="danger"
    @confirm="handleResetConfirm"
  />

  <SaveMealModal
    v-model="showSaveDialog"
    :nutrient-count="nutrientCount"
    :total-carbs="totalCarbs"
    :is-editing="isEditing"
    @save="handleSaveConfirm"
    @manage-tags="handleManageTags"
  />

  <TagManagementModal v-model="showTagManagementDialog" />
</template>
