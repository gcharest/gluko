<script setup lang="ts">
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: undefined },
  cancelLabel: { type: String, default: undefined },
  confirmVariant: { type: String, default: 'danger' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :open="modelValue"
    :title="title"
    :show-close="false"
    @update:open="emit('update:modelValue', $event)"
  >
    <p class="text-gray-700 dark:text-gray-300 mb-6">
      {{ message }}
    </p>

    <div class="flex gap-3 justify-end">
      <BaseButton
        variant="secondary"
        @click="handleCancel"
      >
        {{ cancelLabel || $t('modals.general.cancel') }}
      </BaseButton>
      <BaseButton
        :variant="confirmVariant as 'primary' | 'secondary' | 'danger' | 'ghost'"
        @click="handleConfirm"
      >
        {{ confirmLabel || $t('modals.general.confirm') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
