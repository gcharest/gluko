<script setup lang="ts">
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

const props = withDefaults(defineProps<Props>(), {
  confirmVariant: 'danger'
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
        :variant="props.confirmVariant"
        @click="handleConfirm"
      >
        {{ confirmLabel || $t('modals.general.confirm') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
