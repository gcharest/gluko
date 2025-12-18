<template>
  <div class="storage-quota-display" :class="warningClass">
    <div class="quota-header">
      <div class="quota-icon">
        <span>{{ warningIcon }}</span>
      </div>
      <div class="quota-info">
        <h4 class="quota-title">{{ $t('storage.quota.title') }}</h4>
        <p class="quota-subtitle">{{ warningMessage }}</p>
      </div>
    </div>

    <div class="quota-bar-container">
      <div class="quota-bar">
        <div
          class="quota-bar-fill"
          :style="{ width: `${percentUsed}%` }"
          :class="quotaBarClass"
        ></div>
      </div>
      <div class="quota-text">
        <span class="quota-used">{{ formatBytes(quotaInfo.usage) }}</span>
        <span class="quota-separator">/</span>
        <span class="quota-total">{{ formatBytes(quotaInfo.quota) }}</span>
        <span class="quota-percent">({{ percentUsed }}%)</span>
      </div>
    </div>

    <div class="quota-details">
      <div class="detail-item">
        <span class="detail-label">{{ $t('storage.quota.available') }}</span>
        <span class="detail-value">{{ formatBytes(quotaInfo.available) }}</span>
      </div>
      <div v-if="quotaInfo.estimatedSpaceNeeded > 0" class="detail-item">
        <span class="detail-label">{{ $t('storage.quota.needed') }}</span>
        <span class="detail-value">{{ formatBytes(quotaInfo.estimatedSpaceNeeded) }}</span>
      </div>
      <div v-if="isPersisted !== null" class="detail-item">
        <span class="detail-label">{{ $t('storage.quota.persistent') }}</span>
        <span class="detail-value">
          {{ isPersisted ? $t('storage.quota.yes') : $t('storage.quota.no') }}
        </span>
      </div>
    </div>

    <div v-if="showActions" class="quota-actions">
      <button
        v-if="!isPersisted && canRequestPersistence"
        class="btn btn-primary"
        @click="$emit('request-persistence')"
      >
        {{ $t('storage.quota.requestPersistence') }}
      </button>
      <button
        v-if="warningLevel === 'critical'"
        class="btn btn-warning"
        @click="$emit('clear-storage')"
      >
        {{ $t('storage.quota.clearStorage') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StorageQuotaInfo } from '@/types/shard-loading'

const { t } = useI18n()

interface Props {
  quotaInfo: StorageQuotaInfo
  isPersisted?: boolean | null
  showActions?: boolean
  canRequestPersistence?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPersisted: null,
  showActions: true,
  canRequestPersistence: true
})

defineEmits<{
  'request-persistence': []
  'clear-storage': []
}>()

const percentUsed = computed(() => {
  return Math.round(Math.min(props.quotaInfo.percentUsed, 100))
})

const warningLevel = computed(() => {
  const percent = props.quotaInfo.percentUsed

  if (percent >= 90) return 'critical'
  if (percent >= 75) return 'warning'
  return 'safe'
})

const warningClass = computed(() => {
  return `quota-${warningLevel.value}`
})

const quotaBarClass = computed(() => {
  return `quota-bar-${warningLevel.value}`
})

const warningIcon = computed(() => {
  switch (warningLevel.value) {
    case 'critical':
      return '🔴'
    case 'warning':
      return '⚠️'
    default:
      return '✅'
  }
})

const warningMessage = computed(() => {
  switch (warningLevel.value) {
    case 'critical':
      return t('storage.quota.messages.critical')
    case 'warning':
      return t('storage.quota.messages.warning')
    default:
      return t('storage.quota.messages.healthy')
  }
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return value.toFixed(i === 0 ? 0 : 1) + ' ' + sizes[i]
}
</script>

<style scoped>
.storage-quota-display {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.quota-safe {
  border-color: #10b981;
}

.quota-warning {
  border-color: #f59e0b;
  background-color: #fffbeb;
}

.quota-critical {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.quota-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.quota-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.quota-info {
  flex: 1;
}

.quota-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-heading);
}

.quota-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.quota-bar-container {
  margin-bottom: 1rem;
}

.quota-bar {
  height: 12px;
  background-color: var(--color-background-soft);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.quota-bar-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 6px;
}

.quota-bar-safe {
  background: linear-gradient(90deg, #10b981, #059669);
}

.quota-bar-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.quota-bar-critical {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.quota-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.quota-used {
  font-weight: 600;
  color: var(--color-heading);
}

.quota-separator {
  color: var(--color-text-secondary);
}

.quota-total {
  color: var(--color-text-secondary);
}

.quota-percent {
  margin-left: 0.25rem;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.quota-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 6px;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--color-text-secondary);
}

.detail-value {
  font-weight: 600;
  color: var(--color-heading);
}

.quota-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
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

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background-color: #d97706;
}

@media (max-width: 640px) {
  .storage-quota-display {
    padding: 1rem;
  }

  .quota-header {
    gap: 0.75rem;
  }

  .quota-icon {
    font-size: 1.5rem;
  }

  .quota-title {
    font-size: 1rem;
  }

  .quota-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
