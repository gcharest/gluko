<template>
  <div class="date-range-filter">
    <!-- Start Date -->
    <div class="mb-2">
      <label :for="startInputId" class="form-label">{{ $t('components.dateRangeFilter.start') }}</label>
      <input
:id="startInputId" v-model="startDate" type="date" class="form-control" :max="maxStartDate"
        @change="handleStartDateChange" />
    </div>

    <!-- End Date -->
    <div class="mb-2">
      <label :for="endInputId" class="form-label">{{ $t('components.dateRangeFilter.end') }}</label>
      <input
:id="endInputId" v-model="endDate" type="date" class="form-control" :min="minEndDate" :max="todayFormatted"
        @change="handleEndDateChange" />
    </div>

    <!-- Quick select buttons -->
    <div class="d-flex gap-2 flex-wrap">
      <button
v-for="preset in presets" :key="preset.key" type="button" class="btn btn-outline-secondary btn-sm"
        @click="applyPreset(preset.key)">
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

// Generate unique IDs

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
  emit('update:modelValue', {
    start: startDate.value,
    end: endDate.value
  })
}

function handleEndDateChange() {
  emit('update:modelValue', {
    start: startDate.value,
    end: endDate.value
  })
}

// Apply preset date ranges
function applyPreset(presetKey: string) {
  const preset = presets.find(p => p.key === presetKey)
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

<style scoped>
.date-range-filter {
  width: 100%;
}
</style>