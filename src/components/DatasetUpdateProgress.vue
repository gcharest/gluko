<template>
  <div v-if="isVisible" class="dataset-update-progress">
    <div class="progress-card">
      <div class="progress-header">
        <h3 class="progress-title">
          {{ $t(statusMessage) }}
        </h3>
        <button v-if="canCancel" class="btn-close" aria-label="Close" @click="$emit('cancel')">
          ×
        </button>
      </div>

      <div class="progress-body">
        <!-- Overall Progress Bar -->
        <div class="progress-section">
          <div class="progress-label">
            <span>{{ $t('dataset.progress.overall') }}</span>
            <span class="progress-percent">{{ overallPercent }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :style="{ width: `${overallPercent}%` }"
              :class="progressBarClass"
            ></div>
          </div>
        </div>

        <!-- Detailed Stats -->
        <div v-if="progress.status !== 'idle'" class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">{{ $t('dataset.progress.shards') }}</span>
            <span class="stat-value">{{ progress.currentShard }} / {{ progress.totalShards }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('dataset.progress.records') }}</span>
            <span class="stat-value">{{ formatNumber(progress.recordsLoaded) }} / {{ formatNumber(progress.totalRecords) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('dataset.progress.size') }}</span>
            <span class="stat-value">{{ formatBytes(progress.bytesDownloaded) }} / {{ formatBytes(progress.totalBytes) }}</span>
          </div>
        </div>

        <!-- Current Shard -->
        <div v-if="progress.currentShardName && progress.status === 'downloading'" class="current-shard">
          <span class="current-shard-label">{{ $t('dataset.progress.currentShard') }}:</span>
          <span class="current-shard-name">{{ progress.currentShardName }}</span>
        </div>

        <!-- Error Message -->
        <div v-if="progress.status === 'error' && progress.errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ progress.errorMessage }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="progress-actions">
          <button
            v-if="progress.status === 'complete'"
            class="btn btn-primary"
            @click="$emit('complete')"
          >
            {{ $t('dataset.progress.done') }}
          </button>
          <button
            v-if="progress.status === 'error'"
            class="btn btn-secondary"
            @click="$emit('retry')"
          >
            {{ $t('dataset.progress.retry') }}
          </button>
          <button
            v-if="progress.status === 'error'"
            class="btn btn-tertiary"
            @click="$emit('cancel')"
          >
            {{ $t('dataset.progress.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ShardLoadProgress } from '@/types/shard-loading'

interface Props {
  progress: ShardLoadProgress
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true
})

defineEmits<{
  cancel: []
  complete: []
  retry: []
}>()

const overallPercent = computed(() => {
  if (props.progress.totalRecords === 0) return 0
  const percent = (props.progress.recordsLoaded / props.progress.totalRecords) * 100
  return Math.round(Math.min(percent, 100))
})

const statusMessage = computed(() => {
  switch (props.progress.status) {
    case 'checking':
      return 'dataset.status.checking'
    case 'downloading':
      return 'dataset.status.downloading'
    case 'validating':
      return 'dataset.status.validating'
    case 'complete':
      return 'dataset.status.complete'
    case 'error':
      return 'dataset.status.error'
    default:
      return 'dataset.status.idle'
  }
})

const progressBarClass = computed(() => {
  switch (props.progress.status) {
    case 'complete':
      return 'progress-bar-success'
    case 'error':
      return 'progress-bar-error'
    default:
      return 'progress-bar-active'
  }
})

const canCancel = computed(() => {
  return props.progress.status === 'idle' || props.progress.status === 'error'
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i]
}

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}
</script>

<style scoped>
.dataset-update-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.progress-card {
  background: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  overflow: hidden;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.progress-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: var(--color-background-soft);
}

.progress-body {
  padding: 1.5rem;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.progress-percent {
  font-weight: 600;
  color: var(--color-heading);
}

.progress-bar {
  height: 8px;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-bar-active {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  animation: progress-animation 1.5s ease-in-out infinite;
}

.progress-bar-success {
  background-color: #10b981;
}

.progress-bar-error {
  background-color: #ef4444;
}

@keyframes progress-animation {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 6px;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-label {
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--color-heading);
}

.current-shard {
  padding: 0.75rem;
  background-color: var(--color-background-soft);
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.current-shard-label {
  color: var(--color-text-secondary);
  margin-right: 0.5rem;
}

.current-shard-name {
  font-weight: 600;
  color: var(--color-heading);
  font-family: monospace;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-text {
  color: #991b1b;
  font-size: 0.875rem;
  line-height: 1.5;
}

.progress-actions {
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

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}

.btn-tertiary {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-tertiary:hover {
  background-color: var(--color-background-soft);
}
</style>
