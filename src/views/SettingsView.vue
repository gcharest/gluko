<template>
  <div class="container py-4">
    <h1 class="mb-4">{{ $t('settings.title') }}</h1>

    <!-- Dataset Information Section -->
    <section class="settings-section">
      <h2 class="section-title">{{ $t('settings.dataset.title') }}</h2>

      <div class="card">
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ $t('settings.dataset.currentVersion') }}</span>
              <span class="info-value">{{ datasetVersion || $t('settings.dataset.notInstalled') }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('settings.dataset.totalRecords') }}</span>
              <span class="info-value">{{ formatNumber(nutrientStore.totalNutrients) }}</span>
            </div>
            <div v-if="datasetInstalledAt" class="info-item">
              <span class="info-label">{{ $t('settings.dataset.installedAt') }}</span>
              <span class="info-value">{{ formatDate(datasetInstalledAt) }}</span>
            </div>
          </div>

          <div class="mt-3">
            <button
              class="btn btn-primary me-2"
              :disabled="isCheckingUpdates"
              @click="checkForUpdates"
            >
              <span v-if="isCheckingUpdates" class="spinner-border spinner-border-sm me-2"></span>
              {{ $t('settings.dataset.checkUpdates') }}
            </button>
            <button
              v-if="updateAvailable"
              class="btn btn-success"
              @click="installUpdate"
            >
              {{ $t('settings.dataset.installUpdate', { version: latestVersion }) }}
            </button>
          </div>

          <div v-if="updateCheckMessage" class="alert mt-3" :class="updateCheckAlertClass">
            {{ updateCheckMessage }}
          </div>
        </div>
      </div>
    </section>

    <!-- Storage Management Section -->
    <section class="settings-section">
      <h2 class="section-title">{{ $t('settings.storage.title') }}</h2>

      <div class="info-box mb-3">
        <div class="info-box-icon">ℹ️</div>
        <div class="info-box-content">
          <p class="info-box-text">
            {{ $t('settings.storage.info') }}
          </p>
        </div>
      </div>

      <StorageQuotaDisplay
        :quota-info="quotaInfo"
        :is-persisted="isPersisted"
        :show-actions="true"
        :can-request-persistence="!isPersisted"
        @request-persistence="handleRequestPersistence"
        @clear-storage="handleClearStorage"
      />
    </section>

    <!-- Dataset Update Progress Modal -->
    <DatasetUpdateProgress
      v-if="isUpdating"
      :progress="loadProgress"
      :is-visible="isUpdating"
      @complete="handleUpdateComplete"
      @cancel="handleUpdateCancel"
      @retry="installUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNutrientFileStore } from '@/stores/nutrientsFile'
import { useStorageQuota } from '@/composables/useStorageQuota'
import { useIndexedDB } from '@/composables/useIndexedDB'
import StorageQuotaDisplay from '@/components/StorageQuotaDisplay.vue'
import DatasetUpdateProgress from '@/components/DatasetUpdateProgress.vue'

const { t } = useI18n()
const nutrientStore = useNutrientFileStore()
const storageQuota = useStorageQuota()
const db = useIndexedDB()

const datasetVersion = ref<string>('')
const datasetInstalledAt = ref<Date | null>(null)
const isPersisted = ref<boolean>(false)
const isCheckingUpdates = ref(false)
const isUpdating = ref(false)
const updateAvailable = ref(false)
const latestVersion = ref<string>('')
const updateCheckMessage = ref<string>('')

const quotaInfo = computed(() => storageQuota.quotaInfo.value)
const loadProgress = computed(() => nutrientStore.loadProgress)

const updateCheckAlertClass = computed(() => {
  if (updateAvailable.value) return 'alert-info'
  if (updateCheckMessage.value.includes('up to date')) return 'alert-success'
  if (updateCheckMessage.value.includes('error') || updateCheckMessage.value.includes('failed')) return 'alert-danger'
  return 'alert-info'
})

onMounted(async () => {
  // Load dataset version info
  const manifestVersion = await db.getCurrentManifestVersion()
  if (manifestVersion) {
    datasetVersion.value = manifestVersion.version
    datasetInstalledAt.value = manifestVersion.installedAt
  } else {
    // Check if legacy v0.2 dataset exists
    const legacyDataset = await db.get('nutrientsFile', 0)
    if (legacyDataset && legacyDataset.length > 0) {
      datasetVersion.value = t('settings.dataset.legacyVersion')
    }
  }

  // Check storage quota
  await storageQuota.checkQuota()

  // Check if storage is persisted
  isPersisted.value = await storageQuota.isPersisted()
})

const checkForUpdates = async () => {
  isCheckingUpdates.value = true
  updateCheckMessage.value = ''
  updateAvailable.value = false

  try {
    const result = await nutrientStore.checkForDatasetUpdates()

    if (result.needsUpdate) {
      updateAvailable.value = true
      latestVersion.value = result.latestVersion || ''
      updateCheckMessage.value = result.currentVersion
        ? t('settings.dataset.updateAvailable', { version: result.latestVersion, current: result.currentVersion })
        : t('settings.dataset.updateAvailableNoCurrent', { version: result.latestVersion })
    } else {
      updateCheckMessage.value = result.currentVersion
        ? t('settings.dataset.upToDate', { version: result.currentVersion })
        : t('settings.dataset.noUpdates')
    }
  } catch (error) {
    updateCheckMessage.value = t('settings.dataset.checkFailed')
    console.error('Update check failed:', error)
  } finally {
    isCheckingUpdates.value = false
  }
}

const installUpdate = async () => {
  try {
    updateCheckMessage.value = ''

    // Check storage quota before updating
    const estimate = storageQuota.estimateDatasetSize(10 * 1024 * 1024)
    await storageQuota.checkQuota(estimate)

    if (!quotaInfo.value.hasEnoughSpace) {
      updateCheckMessage.value = t('settings.dataset.insufficientStorage')
      return
    }

    isUpdating.value = true
    await nutrientStore.updateDataset()

    // Reload version info
    const manifestVersion = await db.getCurrentManifestVersion()
    if (manifestVersion) {
      datasetVersion.value = manifestVersion.version
      datasetInstalledAt.value = manifestVersion.installedAt
    }

    updateAvailable.value = false
    updateCheckMessage.value = t('settings.dataset.updateSuccess')
  } catch (error) {
    updateCheckMessage.value = t('settings.dataset.updateFailed')
    console.error('Update failed:', error)
  } finally {
    isUpdating.value = false
  }
}

const handleUpdateComplete = () => {
  isUpdating.value = false
  updateCheckMessage.value = t('settings.dataset.updateSuccess')
}

const handleUpdateCancel = () => {
  isUpdating.value = false
}

const handleRequestPersistence = async () => {
  const granted = await storageQuota.requestPersistentStorage()
  if (granted) {
    isPersisted.value = true
  }
}

const handleClearStorage = () => {
  // TODO: Implement with confirmation dialog
  alert(t('settings.dataset.clearStoragePrompt'))
}

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

const formatDate = (date: Date): string => {
  // ISO 8601 format: YYYY-MM-DD HH:MM
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.info-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
}

.info-box-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-box-content {
  flex: 1;
}

.info-box-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1e40af;
}

.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.card-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.alert-info {
  background-color: #dbeafe;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

.alert-success {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
}

.alert-danger {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 0.15em;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .me-2 {
    margin-right: 0 !important;
  }
}
</style>
