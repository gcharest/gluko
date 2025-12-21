<script setup lang="ts">
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { AlertTriangleIcon, SaveIcon, Trash2Icon } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
  currentNutrientCount: number
  currentTotalCarbs: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saveAndLoad: []
  discardAndLoad: []
  cancel: []
}>()

function handleSaveAndLoad() {
  emit('saveAndLoad')
}

function handleDiscardAndLoad() {
  emit('discardAndLoad')
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :open="modelValue"
    :title="$t('dialogs.unsavedChanges.title')"
    :show-close="false"
    size="lg"
    @update:open="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <div
        class="flex items-start gap-3 p-3 rounded-lg bg-warning-50 border-warning-200 dark:bg-warning-950 dark:border-warning-800 border"
      >
        <AlertTriangleIcon
          class="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5"
        />
        <div>
          <p class="text-sm font-medium text-warning-900 dark:text-warning-100">
            {{ $t('dialogs.unsavedChanges.message') }}
          </p>
          <p class="text-sm text-warning-800 dark:text-warning-200 mt-1">
            {{ $t('dialogs.unsavedChanges.description') }}
          </p>
        </div>
      </div>

      <!-- Current calculation summary -->
      <div
        v-if="currentNutrientCount > 0"
        class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('dialogs.unsavedChanges.currentCalculation') }}
        </p>
        <p class="text-base font-semibold text-gray-900 dark:text-white mt-1">
          {{ currentNutrientCount }} {{ $t('dialogs.unsavedChanges.nutrients') }} •
          {{ currentTotalCarbs.toFixed(1) }}g {{ $t('dialogs.unsavedChanges.carbs') }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-2 w-full sm:flex-row-reverse mt-6">
      <!-- Save & Load -->
      <BaseButton variant="primary" class="w-full sm:w-auto" @click="handleSaveAndLoad">
        <SaveIcon class="w-4 h-4 mr-2" />
        {{ $t('dialogs.unsavedChanges.actions.saveAndLoad') }}
      </BaseButton>

      <!-- Discard & Load -->
      <BaseButton variant="danger" class="w-full sm:w-auto" @click="handleDiscardAndLoad">
        <Trash2Icon class="w-4 h-4 mr-2" />
        {{ $t('dialogs.unsavedChanges.actions.discardAndLoad') }}
      </BaseButton>

      <!-- Cancel -->
      <BaseButton variant="secondary" class="w-full sm:w-auto" @click="handleCancel">
        {{ $t('common.actions.cancel') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
