<template>
  <div class="date-range-filter">
    <!-- Start Date -->
    <div class="mb-3">
      <label
        :for="startInputId"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >{{ $t('components.dateRangeFilter.start') }}</label
      >
      <input
        :id="startInputId"
        v-model="startDate"
        type="date"
        class="w-full max-w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 overflow-hidden"
        :max="maxStartDate"
        @change="handleStartDateChange"
      />
    </div>

    <!-- End Date -->
    <div class="mb-3">
      <label
        :for="endInputId"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >{{ $t('components.dateRangeFilter.end') }}</label
      >
      <input
        :id="endInputId"
        v-model="endDate"
        type="date"
        class="w-full max-w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 overflow-hidden"
        :min="minEndDate"
        :max="todayFormatted"
        @change="handleEndDateChange"
      />
    </div>

    <!-- Quick select buttons -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        class="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        @click="applyPreset(preset.key)"
      >
        {{ $t(`components.dateRangeFilter.presets.${preset.key}`) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface DateRange {
  start: string | null
  end: string | null
}

interface Preset {
  key: string
  days: number
}

const presets: Preset[] = [
  { key: 'today', days: 0 },
  { key: 'lastWeek', days: 7 },
  { key: 'lastMonth', days: 30 },
  { key: 'lastQuarter', days: 90 }
]

const props = defineProps<{
  modelValue: DateRange
}>()

const emit = defineEmits(['update:modelValue'])

// Generate unique IDs for input fields to ensure proper label association
const startInputId = `date-range-start-${Math.random().toString(36).substr(2, 9)}`
const endInputId = `date-range-end-${Math.random().toString(36).substr(2, 9)}`

// Local state for v-model binding
const startDate = ref<string | null>(props.modelValue.start)
const endDate = ref<string | null>(props.modelValue.end)

// Today's date formatted as YYYY-MM-DD
const todayFormatted = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Computed min/max dates for validation
const maxStartDate = computed(() => endDate.value || todayFormatted.value)
const minEndDate = computed(() => startDate.value || undefined)

// Event handlers
function handleStartDateChange() {
  // If start date is after end date, adjust end date
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    endDate.value = startDate.value
  }
  emit('update:modelValue', {
    start: startDate.value,
    end: endDate.value
  })
}

function handleEndDateChange() {
  // If end date is before start date, adjust start date
  if (startDate.value && endDate.value && endDate.value < startDate.value) {
    startDate.value = endDate.value
  }
  emit('update:modelValue', {
    start: startDate.value,
    end: endDate.value
  })
}

// Apply preset date ranges
function applyPreset(presetKey: string) {
  const preset = presets.find((p) => p.key === presetKey)
  if (!preset) return

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const start = new Date()
  if (preset.days > 0) {
    start.setDate(start.getDate() - preset.days)
  }
  start.setHours(0, 0, 0, 0)

  startDate.value = start.toISOString().split('T')[0]
  endDate.value = end.toISOString().split('T')[0]

  emit('update:modelValue', {
    start: startDate.value,
    end: endDate.value
  })
}
</script>
