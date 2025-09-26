<template>
  <div class="subject-selector">
    <div v-if="allSubjectsOption" class="form-check">
      <input
        :id="allSubjectsId"
        v-model="selectedSubjectId"
        class="form-check-input"
        type="radio"
        name="subject"
        :value="null"
        @change="handleChange"
      />
      <label class="form-check-label" :for="allSubjectsId">
        {{ $t('components.subjectSelector.allSubjects') }}
      </label>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-2">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">{{ $t('common.loading') }}</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger py-2" role="alert">
      {{ error }}
    </div>

    <!-- No subjects state -->
    <div v-else-if="!subjects.length" class="text-center py-2">
      <p class="text-muted mb-2">{{ $t('components.subjectSelector.noSubjects') }}</p>
      <button type="button" class="btn btn-primary btn-sm" @click="handleAddSubject">
        {{ $t('components.subjectSelector.addSubject') }}
      </button>
    </div>

    <!-- Subject list -->
    <div v-else class="subject-list">
      <div v-for="subject in subjects" :key="subject.id" class="form-check">
        <input
          :id="getSubjectInputId(subject.id)"
          v-model="selectedSubjectId"
          class="form-check-input"
          type="radio"
          name="subject"
          :value="subject.id"
          @change="handleChange"
        />
        <label class="form-check-label" :for="getSubjectInputId(subject.id)">
          {{ subject.name }}
        </label>
      </div>
    </div>

    <!-- Add subject button -->
    <div class="mt-2">
      <button type="button" class="btn btn-primary btn-sm w-100" @click="handleAddSubject">
        <i class="bi bi-plus-circle me-1"></i>
        {{ $t('components.subjectSelector.addSubject') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import type { Subject } from '@/types/meal-history'

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

<style scoped>
.subject-selector {
  width: 100%;
}

.subject-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
