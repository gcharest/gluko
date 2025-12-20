<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">{{ $t('settings.title') }}</h1>

    <!-- Dataset Information Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ $t('settings.dataset.title') }}</h2>

      <BaseCard>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="flex flex-col">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.dataset.currentVersion') }}</span>
            <span class="text-base font-semibold text-gray-900 dark:text-white mt-1">{{ datasetVersion || $t('settings.dataset.notInstalled') }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.dataset.totalRecords') }}</span>
            <span class="text-base font-semibold text-gray-900 dark:text-white mt-1">{{ formatNumber(nutrientStore.totalNutrients) }}</span>
          </div>
          <div v-if="datasetInstalledAt" class="flex flex-col">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.dataset.installedAt') }}</span>
            <span class="text-base font-semibold text-gray-900 dark:text-white mt-1">{{ formatDate(datasetInstalledAt) }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <BaseButton
            variant="primary"
            :disabled="isCheckingUpdates"
            :loading="isCheckingUpdates"
            @click="checkForUpdates"
          >
            {{ $t('settings.dataset.checkUpdates') }}
          </BaseButton>
          <BaseButton
            v-if="updateAvailable"
            variant="primary"
            @click="installUpdate"
          >
            {{ $t('settings.dataset.installUpdate', { version: latestVersion }) }}
          </BaseButton>
        </div>

        <BaseAlert
          v-if="updateCheckMessage"
          :variant="updateCheckAlertVariant"
          class="mt-4"
        >
          {{ updateCheckMessage }}
        </BaseAlert>
      </BaseCard>
    </section>

    <!-- Storage Management Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ $t('settings.storage.title') }}</h2>

      <BaseAlert variant="info" class="mb-4">
        {{ $t('settings.storage.info') }}
      </BaseAlert>

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
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
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

const updateCheckAlertVariant = computed<'success' | 'warning' | 'danger' | 'info'>(() => {
  if (updateAvailable.value) return 'info'
  if (updateCheckMessage.value.includes('up to date')) return 'success'
  if (updateCheckMessage.value.includes('error') || updateCheckMessage.value.includes('failed')) return 'danger'
  return 'info'
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
