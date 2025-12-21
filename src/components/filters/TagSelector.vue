<template>
  <div class="tag-selector">
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

    <!-- No tags state -->
    <div v-else-if="!tags.length" class="text-center py-3">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {{ $t('dialogs.tagManagement.noTags') }}
      </p>
      <BaseButton variant="primary" size="sm" class="w-full" @click="handleManageTags">
        <SettingsIcon class="w-4 h-4" />
        {{ $t('dialogs.tagManagement.title') }}
      </BaseButton>
    </div>

    <!-- Tag list with checkboxes -->
    <div v-else class="tag-list max-h-48 overflow-y-auto space-y-2">
      <div v-for="tag in tags" :key="tag.id" class="flex items-center">
        <input
          :id="getTagInputId(tag.id)"
          v-model="selectedTagIds"
          class="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:ring-2 rounded"
          type="checkbox"
          :value="tag.id"
          @change="handleChange"
        />
        <label
          class="ml-2 text-sm text-gray-900 dark:text-white flex items-center gap-2"
          :for="getTagInputId(tag.id)"
        >
          <span
            v-if="tag.color"
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: tag.color }"
          />
          {{ tag.name }}
        </label>
      </div>
    </div>

    <!-- Manage tags button -->
    <div v-if="tags.length" class="mt-3">
      <BaseButton variant="secondary" size="sm" class="w-full" @click="handleManageTags">
        <TagIcon class="w-4 h-4" />
        {{ $t('dialogs.tagManagement.title') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTagStore } from '@/stores/tag'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import { SettingsIcon, TagIcon } from 'lucide-vue-next'

interface Props {
  modelValue: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  manage: []
}>()

const tagStore = useTagStore()

// Generate unique ID for inputs
const getTagInputId = (id: string) => `tag-${id}`

// Local state
const loading = ref(false)
const error = ref<string | null>(null)
const selectedTagIds = ref<string[]>([...props.modelValue])

// Get tags from store
const tags = computed(() => tagStore.sortedTags)

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    selectedTagIds.value = [...newValue]
  }
)

// Event handlers
function handleChange() {
  emit('update:modelValue', selectedTagIds.value)
}

function handleManageTags() {
  emit('manage')
}

// Load tags on mount
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    await tagStore.loadInitialData()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load tags'
  } finally {
    loading.value = false
  }
})
</script>
