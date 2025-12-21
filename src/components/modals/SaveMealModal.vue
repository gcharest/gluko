<template>
  <BaseModal
    :open="modelValue"
    :title="isEditing ? $t('dialogs.saveMeal.titleEdit') : $t('dialogs.saveMeal.title')"
    size="lg"
    @update:open="emit('update:modelValue', $event)"
  >
    <!-- Modal Body -->
    <div class="space-y-4">
      <!-- Subject selector (only show if multiple subjects) -->
      <div v-if="subjects.length > 1">
        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('dialogs.saveMeal.subject') }}
        </label>
        <select
          v-model="selectedSubjectId"
          class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        >
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
            <span v-if="subject.id === activeSubjectId" class="text-primary-600">
              ({{ $t('dialogs.saveMeal.default') }})
            </span>
          </option>
        </select>
      </div>

      <!-- Meal name (optional) -->
      <div>
        <label for="meal-name" class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('dialogs.saveMeal.mealName') }}
          <span class="text-gray-500 dark:text-gray-400 font-normal">
            ({{ $t('dialogs.saveMeal.optional') }})
          </span>
        </label>
        <BaseInput
          id="meal-name"
          v-model="mealName"
          type="text"
          :placeholder="$t('dialogs.saveMeal.mealNamePlaceholder')"
        />
      </div>

      <!-- Notes (optional) -->
      <div>
        <label for="meal-notes" class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('dialogs.saveMeal.notes') }}
          <span class="text-gray-500 dark:text-gray-400 font-normal">
            ({{ $t('dialogs.saveMeal.optional') }})
          </span>
        </label>
        <textarea
          id="meal-notes"
          v-model="mealNotes"
          rows="3"
          class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          :placeholder="$t('dialogs.saveMeal.notesPlaceholder')"
        />
      </div>

      <!-- Tags (placeholder for future) -->
      <div v-if="false">
        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('dialogs.saveMeal.tags') }}
        </label>
        <!-- TODO: Tag selector component -->
      </div>

      <!-- Summary info -->
      <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ $t('dialogs.saveMeal.nutrientCount') }}
          </span>
          <span class="font-medium text-gray-900 dark:text-white">{{ nutrientCount }}</span>
        </div>
        <div class="flex items-center justify-between text-sm mt-1">
          <span class="text-gray-600 dark:text-gray-400">
            {{ $t('dialogs.saveMeal.totalCarbs') }}
          </span>
          <span class="font-semibold text-lg text-primary-600 dark:text-primary-400">
            {{ totalCarbs.toFixed(1) }} g
          </span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-2 w-full sm:flex-row-reverse mt-6">
      <BaseButton variant="primary" class="w-full sm:w-auto" @click="handleSave">
        <BookPlusIcon class="w-4 h-4 mr-2" />
        {{ isEditing ? $t('common.actions.save') : $t('dialogs.saveMeal.saveButton') }}
      </BaseButton>
      <BaseButton variant="secondary" class="w-full sm:w-auto" @click="emit('update:modelValue', false)">
        {{ $t('common.actions.cancel') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { BookPlusIcon } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
  nutrientCount: number
  totalCarbs: number
  isEditing?: boolean
  initialName?: string
  initialNotes?: string
  initialTags?: string[]
  initialSubjectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  initialName: '',
  initialNotes: '',
  initialTags: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: { subjectId: string; name?: string; notes?: string; tags?: string[] }]
}>()

const subjectStore = useSubjectStore()

// Local state
const selectedSubjectId = ref<string>('')
const mealName = ref('')
const mealNotes = ref('')

// Computed
const subjects = computed(() => subjectStore.sortedSubjects.filter((s) => s.active))
const activeSubjectId = computed(() => subjectStore.activeSubjectId)

// Initialize form when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      // Set subject: use initial, active, or first available
      selectedSubjectId.value =
        props.initialSubjectId || subjectStore.activeSubjectId || subjects.value[0]?.id || ''
      mealName.value = props.initialName || ''
      mealNotes.value = props.initialNotes || ''
    }
  },
  { immediate: true }
)

function handleSave() {
  if (!selectedSubjectId.value) return

  emit('save', {
    subjectId: selectedSubjectId.value,
    name: mealName.value.trim() || undefined,
    notes: mealNotes.value.trim() || undefined,
    tags: props.initialTags.length > 0 ? props.initialTags : []
  })

  emit('update:modelValue', false)
}
</script>
