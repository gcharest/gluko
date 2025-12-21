<template>
  <BaseModal
    :open="modelValue"
    :title="$t('dialogs.tagManagement.title')"
    size="lg"
    @update:open="emit('update:modelValue', $event)"
  >
    <!-- Add new tag form -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {{ $t('dialogs.tagManagement.addNew') }}
      </h3>
      <form class="flex gap-2" @submit.prevent="handleCreateTag">
        <BaseInput
          v-model="newTagName"
          type="text"
          :placeholder="$t('dialogs.tagManagement.namePlaceholder')"
          class="flex-1"
          required
        />
        <BaseButton type="submit" variant="primary" :disabled="!newTagName.trim()">
          <PlusCircleIcon class="w-4 h-4 mr-1" />
          {{ $t('common.actions.add') }}
        </BaseButton>
      </form>
    </div>

    <!-- Edit tag form -->
    <div
      v-if="editingTag"
      class="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100">
          {{ $t('dialogs.tagManagement.editing') }}
        </h3>
        <button
          type="button"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          @click="cancelEdit"
        >
          {{ $t('common.actions.cancel') }}
        </button>
      </div>
      <form class="flex gap-2" @submit.prevent="handleUpdateTag">
        <BaseInput
          v-model="editTagName"
          type="text"
          :placeholder="$t('dialogs.tagManagement.namePlaceholder')"
          class="flex-1"
          required
        />
        <BaseButton type="submit" variant="primary" :disabled="!editTagName.trim()">
          <CheckIcon class="w-4 h-4 mr-1" />
          {{ $t('common.actions.save') }}
        </BaseButton>
      </form>
    </div>

    <!-- Tag list -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('dialogs.tagManagement.currentTags') }}
      </h3>

      <!-- Empty state -->
      <div v-if="!tags.length" class="text-center py-6 text-gray-500 dark:text-gray-400">
        {{ $t('dialogs.tagManagement.noTags') }}
      </div>

      <!-- Tag items -->
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- Tag name with optional color -->
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span
              v-if="tag.color"
              class="flex-shrink-0 w-3 h-3 rounded-full"
              :style="{ backgroundColor: tag.color }"
            />
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ tag.name }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <!-- Edit -->
          <button
            type="button"
            class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            :title="$t('common.actions.modify')"
            @click="startEdit(tag)"
          >
            <PencilIcon class="w-4 h-4" />
          </button>

          <!-- Delete -->
          <button
            type="button"
            class="p-2 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950"
            :title="$t('common.actions.delete')"
            @click="handleDeleteTag(tag.id, tag.name)"
          >
            <Trash2Icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Info message -->
    <div
      class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
    >
      <div class="flex items-start gap-2">
        <InfoIcon class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p class="text-xs text-blue-900 dark:text-blue-100">
          {{ $t('dialogs.tagManagement.info') }}
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-2 w-full sm:flex-row-reverse mt-6">
      <BaseButton
        variant="secondary"
        class="w-full sm:w-auto"
        @click="emit('update:modelValue', false)"
      >
        {{ $t('common.actions.close') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTagStore } from '@/stores/tag'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import type { Tag } from '@/types/tag'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { PlusCircleIcon, PencilIcon, Trash2Icon, CheckIcon, InfoIcon } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const tagStore = useTagStore()
const toast = useToast()
const { t } = useI18n()

// State
const newTagName = ref('')
const editingTag = ref<Tag | null>(null)
const editTagName = ref('')

// Computed
const tags = computed(() => tagStore.sortedTags)

// Create tag
async function handleCreateTag() {
  const name = newTagName.value.trim()
  if (!name) return

  const tag = await tagStore.createTag(name)
  if (tag) {
    toast.success(t('toasts.tags.created', { name }))
    newTagName.value = ''
  } else {
    toast.error(t('toasts.tags.createError'))
  }
}

// Edit tag
function startEdit(tag: Tag) {
  editingTag.value = tag
  editTagName.value = tag.name
}

function cancelEdit() {
  editingTag.value = null
  editTagName.value = ''
}

async function handleUpdateTag() {
  if (!editingTag.value) return

  const name = editTagName.value.trim()
  if (!name) return

  const updatedTag = {
    ...editingTag.value,
    name
  }

  const success = await tagStore.updateTag(updatedTag)
  if (success) {
    toast.success(t('toasts.tags.updated', { name }))
    cancelEdit()
  } else {
    toast.error(t('toasts.tags.updateError'))
  }
}

// Delete tag
async function handleDeleteTag(id: string, name: string) {
  // Show confirmation
  if (!confirm(t('dialogs.tagManagement.deleteConfirm', { name }))) {
    return
  }

  const success = await tagStore.deleteTag(id)
  if (success) {
    toast.success(t('toasts.tags.deleted', { name }))
  } else {
    toast.error(t('toasts.tags.deleteError'))
  }
}
</script>
