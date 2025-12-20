<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import { InfoIcon, ExternalLinkIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 bg-primary-100 dark:bg-primary-950 rounded-lg">
          <InfoIcon class="w-8 h-8 text-primary-700 dark:text-primary-400" />
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {{ $t('navigation.about') }}
        </h1>
      </div>
    </div>

    <!-- About Content Card -->
    <BaseCard variant="elevated">
      <div class="prose prose-gray dark:prose-invert max-w-none">
        <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">
          {{ $t('aboutText.para1') }}
        </p>

        <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">
          {{ $t('aboutText.para2') }}
        </p>

        <p class="text-lg text-gray-700 dark:text-gray-300">
          {{ $t('aboutText.para3') }}
          <a
            :href="$t('aboutText.url')"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 text-primary-700 dark:text-primary-400 hover:underline font-medium"
          >
            {{ $t('aboutText.CNF') }}
            <ExternalLinkIcon class="w-4 h-4" />
          </a>
        </p>
      </div>
    </BaseCard>

    <!-- Additional Info Cards -->
    <div class="grid md:grid-cols-2 gap-6 mt-8">
      <BaseCard>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Open Source
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          This project is open source and available on GitHub.
        </p>
        <a
          href="https://github.com/gcharest/gluko"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 hover:underline font-medium"
        >
          View on GitHub
          <ExternalLinkIcon class="w-4 h-4" />
        </a>
      </BaseCard>

      <BaseCard>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Author
        </h2>
        <p class="text-gray-600 dark:text-gray-300">
          Created by Guillaume Charest
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          © 2021-2023
        </p>
      </BaseCard>
    </div>
  </div>
</template>
