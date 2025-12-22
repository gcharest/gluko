<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import {
  InfoIcon,
  ExternalLinkIcon,
  CalculatorIcon,
  SearchIcon,
  HistoryIcon,
  UsersIcon,
  LanguagesIcon,
  MoonIcon,
  SmartphoneIcon,
  MonitorIcon,
  DownloadIcon,
  ShareIcon,
  PlusIcon,
  MoreVerticalIcon
} from 'lucide-vue-next'
import { computed } from 'vue'

// Detect user platform for installation instructions
const userPlatform = computed(() => {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/mac/.test(ua)) return 'desktop-mac'
  return 'desktop'
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="p-3 bg-primary-100 dark:bg-primary-950 rounded-lg">
        <InfoIcon class="w-8 h-8 text-primary-700 dark:text-primary-400" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ $t('views.about.title') }}
      </h1>
    </div>

    <!-- What is Gluko -->
    <BaseCard variant="elevated" class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {{ $t('views.about.what.title') }}
      </h2>
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        {{ $t('views.about.what.description') }}
      </p>
      <p class="text-gray-700 dark:text-gray-300">
        {{ $t('views.about.what.source') }}
        <a
          href="https://food-nutrition.canada.ca/cnf-fce/?lang=eng"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 text-primary-700 dark:text-primary-400 underline hover:no-underline font-medium"
        >
          {{ $t('views.about.what.cnf') }}
          <ExternalLinkIcon class="w-4 h-4" />
        </a>
      </p>
    </BaseCard>

    <!-- Why Gluko -->
    <BaseCard variant="elevated" class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {{ $t('views.about.why.title') }}
      </h2>
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        {{ $t('views.about.why.description') }}
      </p>
      <ul class="space-y-2 text-gray-700 dark:text-gray-300">
        <li class="flex items-start gap-2">
          <span class="text-primary-600 dark:text-primary-400 mt-1">•</span>
          <span>{{ $t('views.about.why.benefit1') }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-600 dark:text-primary-400 mt-1">•</span>
          <span>{{ $t('views.about.why.benefit2') }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-600 dark:text-primary-400 mt-1">•</span>
          <span>{{ $t('views.about.why.benefit3') }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-600 dark:text-primary-400 mt-1">•</span>
          <span>{{ $t('views.about.why.benefit4') }}</span>
        </li>
      </ul>
    </BaseCard>

    <!-- Features -->
    <BaseCard variant="elevated" class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {{ $t('views.about.features.title') }}
      </h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg shrink-0">
            <CalculatorIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ $t('views.about.features.calculator.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('views.about.features.calculator.description') }}
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg shrink-0">
            <SearchIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ $t('views.about.features.search.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('views.about.features.search.description') }}
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg shrink-0">
            <HistoryIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ $t('views.about.features.history.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('views.about.features.history.description') }}
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg shrink-0">
            <UsersIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ $t('views.about.features.multiSubject.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('views.about.features.multiSubject.description') }}
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg shrink-0">
            <LanguagesIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ $t('views.about.features.bilingual.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('views.about.features.bilingual.description') }}
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg shrink-0">
            <MoonIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ $t('views.about.features.darkMode.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('views.about.features.darkMode.description') }}
            </p>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- PWA Installation Instructions -->
    <BaseCard variant="elevated" class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <DownloadIcon class="w-6 h-6 text-primary-700 dark:text-primary-400" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('views.about.install.title') }}
        </h2>
      </div>
      <p class="text-gray-700 dark:text-gray-300 mb-6">
        {{ $t('views.about.install.description') }}
      </p>

      <!-- iOS Instructions -->
      <div v-if="userPlatform === 'ios'" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-2 mb-3">
          <SmartphoneIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ $t('views.about.install.ios.title') }}
          </h3>
        </div>
        <ol class="space-y-3 text-gray-700 dark:text-gray-300">
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">1.</span>
            <span>
              {{ $t('views.about.install.ios.step1') }}
              <ShareIcon class="w-4 h-4 inline-block mx-1" />
              {{ $t('views.about.install.ios.step1b') }}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">2.</span>
            <span>
              {{ $t('views.about.install.ios.step2') }}
              <PlusIcon class="w-4 h-4 inline-block mx-1" />
              {{ $t('views.about.install.ios.step2b') }}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">3.</span>
            <span>{{ $t('views.about.install.ios.step3') }}</span>
          </li>
        </ol>
      </div>

      <!-- Android Instructions -->
      <div
        v-else-if="userPlatform === 'android'"
        class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div class="flex items-center gap-2 mb-3">
          <SmartphoneIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ $t('views.about.install.android.title') }}
          </h3>
        </div>
        <ol class="space-y-3 text-gray-700 dark:text-gray-300">
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">1.</span>
            <span>
              {{ $t('views.about.install.android.step1') }}
              <MoreVerticalIcon class="w-4 h-4 inline-block mx-1" />
              {{ $t('views.about.install.android.step1b') }}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">2.</span>
            <span>{{ $t('views.about.install.android.step2') }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">3.</span>
            <span>{{ $t('views.about.install.android.step3') }}</span>
          </li>
        </ol>
      </div>

      <!-- Desktop Instructions -->
      <div v-else class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-2 mb-3">
          <MonitorIcon class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ $t('views.about.install.desktop.title') }}
          </h3>
        </div>
        <ol class="space-y-3 text-gray-700 dark:text-gray-300">
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">1.</span>
            <span>{{ $t('views.about.install.desktop.step1') }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-semibold shrink-0">2.</span>
            <span>{{ $t('views.about.install.desktop.step2') }}</span>
          </li>
        </ol>
      </div>

      <div class="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
        <InfoIcon class="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
        <p class="text-blue-800 dark:text-blue-300">
          {{ $t('views.about.install.benefit') }}
        </p>
      </div>
    </BaseCard>

    <!-- Disclaimer -->
    <BaseCard variant="elevated" class="mb-6 border-2 border-warning-300 dark:border-warning-700">
      <div class="flex items-start gap-3 mb-3">
        <InfoIcon class="w-6 h-6 text-warning-700 dark:text-warning-400 shrink-0" />
        <h2 class="text-2xl font-bold text-warning-900 dark:text-warning-200">
          {{ $t('views.about.disclaimer.title') }}
        </h2>
      </div>
      <p class="text-warning-800 dark:text-warning-300 font-semibold mb-3">
        {{ $t('views.about.disclaimer.notMedical') }}
      </p>
      <ul class="space-y-2 text-warning-800 dark:text-warning-300">
        <li class="flex items-start gap-2">
          <span class="mt-1">•</span>
          <span>{{ $t('views.about.disclaimer.point1') }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1">•</span>
          <span>{{ $t('views.about.disclaimer.point2') }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1">•</span>
          <span>{{ $t('views.about.disclaimer.point3') }}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1">•</span>
          <span>{{ $t('views.about.disclaimer.point4') }}</span>
        </li>
      </ul>
    </BaseCard>

    <!-- Additional Info Cards -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <BaseCard>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {{ $t('views.about.opensource.title') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ $t('views.about.opensource.description') }}
        </p>
        <a
          href="https://github.com/gcharest/gluko"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2"
        >
          <BaseButton variant="secondary" size="sm">
            <ExternalLinkIcon class="w-4 h-4" />
            {{ $t('views.about.opensource.github') }}
          </BaseButton>
        </a>
      </BaseCard>

      <BaseCard>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {{ $t('views.about.author.title') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300">{{ $t('views.about.author.name') }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {{ $t('views.about.author.copyright') }}
        </p>
      </BaseCard>
    </div>
  </div>
</template>
