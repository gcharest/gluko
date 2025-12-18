<template>
  <div>
    <!-- Update Available Notification -->
    <Teleport to="body">
      <aside v-if="showUpdateNotification" class="update-notification" role="complementary" aria-label="Dataset update notification">
        <div class="notification-content">
          <div class="notification-icon" aria-hidden="true">📦</div>
          <div class="notification-text">
            <h2 class="notification-title">{{ $t('dataset.update.available') }}</h2>
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
      </aside>
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
  background-color: #ffffff;
  color: #1a202c;
  border: 2px solid #2c5282;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  color: #1a202c;
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  color: #1a202c;
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
  background-color: #ffffff;
  color: #1a202c;
  border: 2px solid #2c5282;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border: 2px solid #2c5282;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #2c5282;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #2a4365;
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

.btn-secondary {
  background-color: #ffffff;
  color: #2c5282;
}

.btn-secondary:hover {
  background-color: #ebf8ff;
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
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
