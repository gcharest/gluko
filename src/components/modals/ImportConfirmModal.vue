<template>
  <BaseModal
    :open="modelValue"
    :title="$t('dialogs.importConfirm.title')"
    :show-close="false"
    size="lg"
    @update:open="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <!-- Info banner -->
      <div
        class="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 border"
      >
        <InfoIcon class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-blue-900 dark:text-blue-100">
            {{ $t('dialogs.importConfirm.message') }}
          </p>
          <p class="text-sm text-blue-800 dark:text-blue-200 mt-1">
            {{ $t('dialogs.importConfirm.description') }}
          </p>
        </div>
      </div>

      <!-- Import summary -->
      <div
        v-if="entryCount"
        class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('dialogs.importConfirm.importSummary') }}
        </p>
        <p class="text-base font-semibold text-gray-900 dark:text-white mt-1">
          {{ $t('dialogs.importConfirm.entryCount', { count: entryCount }) }}
        </p>
        <p v-if="version" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {{ $t('dialogs.importConfirm.version', { version }) }}
        </p>
      </div>

      <!-- Strategy explanation -->
      <div class="space-y-2">
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          {{ $t('dialogs.importConfirm.strategyLabel') }}
        </p>
        <div class="space-y-2">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p class="font-medium text-gray-700 dark:text-gray-300">
              {{ $t('dialogs.importConfirm.mergeStrategy') }}
            </p>
            <p>{{ $t('dialogs.importConfirm.mergeDescription') }}</p>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p class="font-medium text-gray-700 dark:text-gray-300">
              {{ $t('dialogs.importConfirm.replaceStrategy') }}
            </p>
            <p class="text-danger-600 dark:text-danger-400">
              {{ $t('dialogs.importConfirm.replaceWarning') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-2 w-full sm:flex-row-reverse mt-6">
      <!-- Merge (recommended) -->
      <BaseButton variant="primary" class="w-full sm:w-auto" @click="handleMerge">
        <DatabaseIcon class="w-4 h-4 mr-2" />
        {{ $t('dialogs.importConfirm.actions.merge') }}
      </BaseButton>

      <!-- Replace -->
      <BaseButton variant="danger" class="w-full sm:w-auto" @click="handleReplace">
        <Trash2Icon class="w-4 h-4 mr-2" />
        {{ $t('dialogs.importConfirm.actions.replace') }}
      </BaseButton>

      <!-- Cancel -->
      <BaseButton variant="secondary" class="w-full sm:w-auto" @click="handleCancel">
        {{ $t('common.actions.cancel') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { InfoIcon, DatabaseIcon, Trash2Icon } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
  entryCount?: number
  version?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  merge: []
  replace: []
  cancel: []
}>()

function handleMerge() {
  emit('merge')
  emit('update:modelValue', false)
}

function handleReplace() {
  emit('replace')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
