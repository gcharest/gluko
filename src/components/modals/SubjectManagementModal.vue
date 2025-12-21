<template>
  <BaseModal
    :open="modelValue"
    :title="$t('dialogs.subjectManagement.title')"
    size="lg"
    @update:open="emit('update:modelValue', $event)"
  >
    <!-- Add new subject form -->
    <div v-if="!editingSubject" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('dialogs.subjectManagement.addNew') }}
      </h3>
      <form @submit.prevent="handleCreateSubject" class="flex gap-2">
        <BaseInput
          v-model="newSubjectName"
          type="text"
          :placeholder="$t('dialogs.subjectManagement.namePlaceholder')"
          class="flex-1"
          required
        />
        <BaseButton type="submit" variant="primary" :disabled="!newSubjectName.trim()">
          <PlusCircleIcon class="w-4 h-4 mr-1" />
          {{ $t('common.actions.add') }}
        </BaseButton>
      </form>
    </div>

    <!-- Edit subject form -->
    <div v-if="editingSubject" class="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100">
          {{ $t('dialogs.subjectManagement.editing') }}
        </h3>
        <button
          type="button"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          @click="cancelEdit"
        >
          {{ $t('common.actions.cancel') }}
        </button>
      </div>
      <form @submit.prevent="handleUpdateSubject" class="flex gap-2">
        <BaseInput
          v-model="editSubjectName"
          type="text"
          :placeholder="$t('dialogs.subjectManagement.namePlaceholder')"
          class="flex-1"
          required
        />
        <BaseButton type="submit" variant="primary" :disabled="!editSubjectName.trim()">
          <CheckIcon class="w-4 h-4 mr-1" />
          {{ $t('common.actions.save') }}
        </BaseButton>
      </form>
    </div>

    <!-- Subject list -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('dialogs.subjectManagement.currentSubjects') }}
      </h3>

      <!-- Empty state -->
      <div v-if="!subjects.length" class="text-center py-6 text-gray-500 dark:text-gray-400">
        {{ $t('dialogs.subjectManagement.noSubjects') }}
      </div>

      <!-- Subject items -->
      <div
        v-for="subject in subjects"
        :key="subject.id"
        class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        :class="{ 'ring-2 ring-primary-500': subject.id === activeSubjectId }"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- Active indicator -->
          <div
            v-if="subject.id === activeSubjectId"
            class="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600"
            :title="$t('dialogs.subjectManagement.activeSubject')"
          />
          <div v-else class="flex-shrink-0 w-2 h-2" />

          <!-- Subject name -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ subject.name }}
            </p>
            <p v-if="subject.id === activeSubjectId" class="text-xs text-primary-600 dark:text-primary-400">
              {{ $t('dialogs.subjectManagement.active') }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <!-- Set as active -->
          <button
            v-if="subject.id !== activeSubjectId"
            type="button"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            :title="$t('dialogs.subjectManagement.setActive')"
            @click="handleSetActive(subject.id)"
          >
            <CheckCircleIcon class="w-4 h-4" />
          </button>

          <!-- Edit -->
          <button
            type="button"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            :title="$t('common.actions.modify')"
            @click="startEdit(subject)"
          >
            <PencilIcon class="w-4 h-4" />
          </button>

          <!-- Delete -->
          <button
            type="button"
            class="p-2 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950 disabled:opacity-50 disabled:cursor-not-allowed"
            :title="$t('common.actions.delete')"
            :disabled="subjects.length === 1"
            @click="handleDeleteSubject(subject.id, subject.name)"
          >
            <Trash2Icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Info message -->
    <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
      <div class="flex items-start gap-2">
        <InfoIcon class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p class="text-xs text-blue-900 dark:text-blue-100">
          {{ $t('dialogs.subjectManagement.info') }}
        </p>
      </div>
    </div>

    <!-- Close button -->
    <template #footer>
      <BaseButton variant="secondary" class="w-full" @click="emit('update:modelValue', false)">
        {{ $t('common.actions.close') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import type { Subject } from '@/types/meal-history'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import {
  PlusCircleIcon,
  PencilIcon,
  Trash2Icon,
  CheckCircleIcon,
  CheckIcon,
  InfoIcon
} from 'lucide-vue-next'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const subjectStore = useSubjectStore()
const toast = useToast()
const { t } = useI18n()

// State
const newSubjectName = ref('')
const editingSubject = ref<Subject | null>(null)
const editSubjectName = ref('')

// Computed
const subjects = computed(() => subjectStore.sortedSubjects)
const activeSubjectId = computed(() => subjectStore.activeSubjectId)

// Create subject
async function handleCreateSubject() {
  const name = newSubjectName.value.trim()
  if (!name) return

  const subject = await subjectStore.createSubject(name)
  if (subject) {
    toast.success(t('toasts.subjects.created', { name }))
    newSubjectName.value = ''
  } else {
    toast.error(t('toasts.subjects.createError'))
  }
}

// Edit subject
function startEdit(subject: Subject) {
  editingSubject.value = subject
  editSubjectName.value = subject.name
}

function cancelEdit() {
  editingSubject.value = null
  editSubjectName.value = ''
}

async function handleUpdateSubject() {
  if (!editingSubject.value) return

  const name = editSubjectName.value.trim()
  if (!name) return

  const updatedSubject = {
    ...editingSubject.value,
    name
  }

  const success = await subjectStore.updateSubject(updatedSubject)
  if (success) {
    toast.success(t('toasts.subjects.updated', { name }))
    cancelEdit()
  } else {
    toast.error(t('toasts.subjects.updateError'))
  }
}

// Set active subject
async function handleSetActive(id: string) {
  const success = await subjectStore.setActiveSubject(id)
  if (success) {
    const subject = subjectStore.subjects.find((s) => s.id === id)
    toast.success(t('toasts.subjects.setActive', { name: subject?.name || '' }))
  } else {
    toast.error(t('toasts.subjects.setActiveError'))
  }
}

// Delete subject
async function handleDeleteSubject(id: string, name: string) {
  // Show confirmation
  if (!confirm(t('dialogs.subjectManagement.deleteConfirm', { name }))) {
    return
  }

  const success = await subjectStore.deleteSubject(id)
  if (success) {
    toast.success(t('toasts.subjects.deleted', { name }))
  } else {
    toast.error(t('toasts.subjects.deleteError'))
  }
}
</script>
