<template>
  <div class="base-select">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>

    <div class="relative">
      <select
:id="selectId" :value="modelValue" :disabled="disabled" :required="required"
        :aria-label="ariaLabel || label" :aria-invalid="!!error"
        :aria-describedby="error ? `${selectId}-error` : undefined" :class="selectClasses" v-bind="$attrs"
        @change="handleChange">
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="getOptionValue(option)" :value="getOptionValue(option)">
          {{ getOptionLabel(option) }}
        </option>
      </select>

      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon class="w-5 h-5 text-gray-400" />
      </div>
    </div>

    <p v-if="error" :id="`${selectId}-error`" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
      {{ error }}
    </p>

    <p v-else-if="hint" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'

interface Option {
  value: string | number
  label: string
  [key: string]: any
}

interface Props {
  modelValue: string | number
  options: (string | number | Option)[]
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  ariaLabel?: string
  valueKey?: string
  labelKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  hint: '',
  error: '',
  disabled: false,
  required: false,
  ariaLabel: '',
  valueKey: 'value',
  labelKey: 'label',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectId = ref(`select-${Math.random().toString(36).substring(2, 9)}`)

const selectClasses = computed(() => [
  'block w-full rounded-lg',
  'px-4 py-2 pr-10',
  'text-base text-gray-900 dark:text-gray-100',
  'bg-white dark:bg-gray-800',
  'border',
  props.error
    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500',
  'appearance-none',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed',
  'transition-colors duration-150',
])

function getOptionValue(option: string | number | Option): string | number {
  if (typeof option === 'object') {
    return option[props.valueKey]
  }
  return option
}

function getOptionLabel(option: string | number | Option): string {
  if (typeof option === 'object') {
    return option[props.labelKey]
  }
  return String(option)
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('update:modelValue', value)
}
</script>
