<template>
  <div class="subject-selector">
    <div v-if="allSubjectsOption" class="flex items-center mb-2">
      <input
        :id="allSubjectsId"
        v-model="selectedSubjectId"
        class="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:ring-2"
        type="radio"
        name="subject"
        :value="null"
        @change="handleChange"
      />
      <label class="ml-2 text-sm text-gray-900 dark:text-white" :for="allSubjectsId">
        {{ $t('components.subjectSelector.allSubjects') }}
      </label>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-3">
      <div
        class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"
        role="status"
      >
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <!-- Error state -->
    <BaseAlert v-else-if="error" variant="danger" class="py-2">
      {{ error }}
    </BaseAlert>

    <!-- No subjects state -->
    <div v-else-if="!subjects.length" class="text-center py-3">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {{ $t('components.subjectSelector.noSubjects') }}
      </p>
      <BaseButton variant="primary" size="sm" @click="handleAddSubject">
        {{ $t('components.subjectSelector.addSubject') }}
      </BaseButton>
    </div>

    <!-- Subject list -->
    <div v-else class="subject-list max-h-48 overflow-y-auto space-y-2">
      <div v-for="subject in subjects" :key="subject.id" class="flex items-center">
        <input
          :id="getSubjectInputId(subject.id)"
          v-model="selectedSubjectId"
          class="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:ring-2"
          type="radio"
          name="subject"
          :value="subject.id"
          @change="handleChange"
        />
        <label
          class="ml-2 text-sm text-gray-900 dark:text-white"
          :for="getSubjectInputId(subject.id)"
        >
          {{ subject.name }}
        </label>
      </div>
    </div>

    <!-- Add subject button -->
    <div class="mt-3">
      <BaseButton variant="primary" size="sm" class="w-full" @click="handleAddSubject">
        <PlusCircleIcon class="w-4 h-4 mr-1" />
        {{ $t('components.subjectSelector.addSubject') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import type { Subject } from '@/types/meal-history'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import { PlusCircleIcon } from 'lucide-vue-next'

interface Props {
  modelValue: string | null
  allSubjectsOption?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  allSubjectsOption: true
})

const emit = defineEmits(['update:modelValue', 'add'])

const subjectStore = useSubjectStore()

// Generate unique ID for inputs to ensure proper label association
const allSubjectsId = `subject-all-${Math.random().toString(36).substr(2, 9)}`
const getSubjectInputId = (id: string) => `subject-${id}`

// Local state
const loading = ref(false)
const error = ref<string | null>(null)
const selectedSubjectId = ref<string | null>(props.modelValue)

// Get subjects from store
const subjects = computed<Subject[]>(() => {
  return subjectStore.subjects
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    selectedSubjectId.value = newValue
  }
)

// Event handlers
function handleChange() {
  emit('update:modelValue', selectedSubjectId.value)
}

function handleAddSubject() {
  emit('add')
}

// Load subjects on mount
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    await subjectStore.loadInitialData()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load subjects'
  } finally {
    loading.value = false
  }
})
</script>
