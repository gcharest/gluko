<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>

    <div class="relative">
      <input
:id="inputId" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
        :required="required" :aria-label="ariaLabel || label" :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined" :class="inputClasses" v-bind="$attrs"
        @input="handleInput" @blur="handleBlur" />

      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
      {{ error }}
    </p>

    <p v-else-if="hint" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'tel'
  id?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  id: '',
  label: '',
  placeholder: '',
  hint: '',
  error: '',
  disabled: false,
  required: false,
  ariaLabel: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)

const inputClasses = computed(() => [
  'block w-full rounded-lg',
  'px-4 py-2',
  'text-base text-gray-900 dark:text-gray-100',
  'bg-white dark:bg-gray-800',
  'border',
  props.error
    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500',
  'placeholder-gray-400 dark:placeholder-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed',
  'transition-colors duration-150',
])

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

function handleBlur() {
  emit('blur')
}
</script>
