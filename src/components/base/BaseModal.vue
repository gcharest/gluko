<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" @click="handleClose" />
      <DialogContent :class="modalClasses" @escape-key-down="handleClose">
        <DialogTitle v-if="title" class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {{ title }}
        </DialogTitle>

        <DialogDescription v-if="description" class="sr-only">
          {{ description }}
        </DialogDescription>

        <div class="modal-body">
          <slot />
        </div>

        <DialogClose
v-if="showClose"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close">
          <XIcon class="w-5 h-5" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'
import { XIcon } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  size: 'md',
  showClose: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const modalClasses = computed(() => {
  const base = [
    'fixed left-1/2 top-1/2 z-50',
    'transform -translate-x-1/2 -translate-y-1/2',
    'bg-white dark:bg-gray-800',
    'rounded-lg shadow-xl',
    'p-6',
    'max-h-[90vh] overflow-y-auto',
  ]

  const sizes = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
  }

  return [
    ...base,
    sizes[props.size],
  ]
})

function handleClose() {
  emit('update:open', false)
}
</script>
