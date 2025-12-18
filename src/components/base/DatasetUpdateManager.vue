<template>
  <div>
    <!-- Update Available Notification -->
    <Teleport to="body">
      <div v-if="showUpdateNotification" class="update-notification">
        <div class="notification-content">
          <div class="notification-icon">📦</div>
          <div class="notification-text">
            <h4 class="notification-title">{{ $t('dataset.update.available') }}</h4>
            <p class="notification-message">
              {{ $t('dataset.update.message', { version: latestVersion }) }}
            </p>
          </div>
          <div class="notification-actions">
            <button class="btn btn-primary" @click="handleUpdate">
              {{ $t('dataset.update.install') }}
            </button>
            <button class="btn btn-secondary" @click="dismissUpdate">
              {{ $t('dataset.update.later') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Storage Quota Warning -->
    <Teleport to="body">
      <div v-if="showQuotaWarning" class="quota-warning-modal">
        <div class="modal-overlay" @click="showQuotaWarning = false"></div>
        <div class="modal-content">
          <StorageQuotaDisplay
            :quota-info="quotaInfo"
            :is-persisted="isPersisted"
            @request-persistence="handleRequestPersistence"
            @clear-storage="handleClearStorage"
          />
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showQuotaWarning = false">
              {{ $t('common.actions.close') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Dataset Update Progress -->
    <DatasetUpdateProgress
      v-if="isUpdating"
      :progress="loadProgress"
      :is-visible="isUpdating"
      @complete="handleUpdateComplete"
      @cancel="handleUpdateCancel"
      @retry="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNutrientFileStore } from '@/stores/nutrientsFile'
import { useStorageQuota } from '@/composables/useStorageQuota'
import DatasetUpdateProgress from '@/components/DatasetUpdateProgress.vue'
import StorageQuotaDisplay from '@/components/StorageQuotaDisplay.vue'

const nutrientStore = useNutrientFileStore()
const storageQuota = useStorageQuota()

const showUpdateNotification = ref(false)
const showQuotaWarning = ref(false)
const isUpdating = ref(false)
const latestVersion = ref<string>('')
const currentVersion = ref<string>('')
const isPersisted = ref<boolean>(false)

const loadProgress = computed(() => nutrientStore.loadProgress)
const quotaInfo = computed(() => storageQuota.quotaInfo.value)

// Check for updates on mount
onMounted(async () => {
  try {
    // Check storage quota
    await storageQuota.checkQuota()

    // Check if storage is persisted
    isPersisted.value = await storageQuota.isPersisted()

    // Check for dataset updates
    const updateCheck = await nutrientStore.checkForDatasetUpdates()

    if (updateCheck.needsUpdate) {
      latestVersion.value = updateCheck.latestVersion || ''
      currentVersion.value = updateCheck.currentVersion || ''

      // Check if we have enough space
      // Estimate: Manifest file indicates total dataset size
      // For now, we'll show the notification and check quota before downloading
      showUpdateNotification.value = true
    }
  } catch (error) {
    console.error('Failed to check for dataset updates:', error)
  }
})

const handleUpdate = async () => {
  try {
    showUpdateNotification.value = false

    // Check storage quota before updating
    const estimate = storageQuota.estimateDatasetSize(10 * 1024 * 1024) // Rough estimate
    await storageQuota.checkQuota(estimate)

    if (!quotaInfo.value.hasEnoughSpace) {
      showQuotaWarning.value = true
      return
    }

    // Start update
    isUpdating.value = true
    await nutrientStore.updateDataset()
  } catch (error) {
    console.error('Failed to update dataset:', error)
    isUpdating.value = false
  }
}

const handleUpdateComplete = () => {
  isUpdating.value = false
  // Optionally show success message
  console.log('Dataset update complete')
}

const handleUpdateCancel = () => {
  isUpdating.value = false
  showUpdateNotification.value = false
}

const dismissUpdate = () => {
  showUpdateNotification.value = false
  // Optionally set a flag to not show again for this session
}

const handleRequestPersistence = async () => {
  const granted = await storageQuota.requestPersistentStorage()
  if (granted) {
    isPersisted.value = true
    console.log('Persistent storage granted')
  } else {
    console.warn('Persistent storage denied')
  }
}

const handleClearStorage = () => {
  // This should trigger a confirmation dialog
  console.warn('Clear storage action triggered - implement confirmation')
  // TODO: Implement clear storage with confirmation
}
</script>

<style scoped>
.update-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9998;
  max-width: 400px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.notification-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.notification-text {
  margin-bottom: 1rem;
}

.notification-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-heading);
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  gap: 0.75rem;
}

.quota-warning-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: var(--color-background);
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}

@media (max-width: 640px) {
  .update-notification {
    top: auto;
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  .notification-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
