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
  TabletIcon,
  DownloadIcon,
  ShareIcon,
  MoreVerticalIcon
} from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

type InstallTab = 'ios' | 'android' | 'desktop'

// Active tab for installation instructions
const activeInstallTab = ref<InstallTab>('ios')

// Detect user platform to set default tab
const detectPlatform = (): InstallTab => {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'desktop'
}

// Set default tab based on platform on mount
onMounted(() => {
  activeInstallTab.value = detectPlatform()
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

      <!-- Tab Navigation -->
      <div
        class="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide"
      >
        <button
          type="button"
          :class="[
            'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 snap-start',
            activeInstallTab === 'ios'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
          @click="activeInstallTab = 'ios'"
        >
          <SmartphoneIcon class="w-4 h-4" />
          {{ $t('views.about.install.ios.title') }}
        </button>
        <button
          type="button"
          :class="[
            'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 snap-start',
            activeInstallTab === 'android'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
          @click="activeInstallTab = 'android'"
        >
          <TabletIcon class="w-4 h-4" />
          {{ $t('views.about.install.android.title') }}
        </button>
        <button
          type="button"
          :class="[
            'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 snap-start',
            activeInstallTab === 'desktop'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
          @click="activeInstallTab = 'desktop'"
        >
          <MonitorIcon class="w-4 h-4" />
          {{ $t('views.about.install.desktop.title') }}
        </button>
      </div>

      <!-- Tab Content -->
      <!-- iOS Instructions -->
      <div v-if="activeInstallTab === 'ios'">
        <ol class="space-y-4 text-gray-700 dark:text-gray-300 mb-4">
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >1</span
            >
            <span>{{ $t('views.about.install.ios.step1') }}</span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >2</span
            >
            <span>
              {{ $t('views.about.install.ios.step2') }}
              <ShareIcon class="w-4 h-4 inline-block mx-1" />
              {{ $t('views.about.install.ios.step2b') }}
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >3</span
            >
            <span>{{ $t('views.about.install.ios.step3') }}</span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >4</span
            >
            <span>{{ $t('views.about.install.ios.step4') }}</span>
          </li>
        </ol>
        <div class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
          <InfoIcon class="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <p class="text-amber-800 dark:text-amber-300">
            {{ $t('views.about.install.ios.note') }}
          </p>
        </div>
      </div>

      <!-- Android Instructions -->
      <div v-else-if="activeInstallTab === 'android'">
        <ol class="space-y-4 text-gray-700 dark:text-gray-300 mb-4">
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >1</span
            >
            <span>{{ $t('views.about.install.android.step1') }}</span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >2</span
            >
            <span>{{ $t('views.about.install.android.step2') }}</span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >3</span
            >
            <span>
              {{ $t('views.about.install.android.step3') }}
              <MoreVerticalIcon class="w-4 h-4 inline-block mx-1" />
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >4</span
            >
            <span>{{ $t('views.about.install.android.step4') }}</span>
          </li>
        </ol>
        <div class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
          <InfoIcon class="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <p class="text-amber-800 dark:text-amber-300">
            {{ $t('views.about.install.android.note') }}
          </p>
        </div>
      </div>

      <!-- Desktop Instructions -->
      <div v-else-if="activeInstallTab === 'desktop'">
        <ol class="space-y-4 text-gray-700 dark:text-gray-300 mb-4">
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >1</span
            >
            <span>{{ $t('views.about.install.desktop.step1') }}</span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >2</span
            >
            <span>{{ $t('views.about.install.desktop.step2') }}</span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 font-semibold text-sm shrink-0"
              >3</span
            >
            <span>{{ $t('views.about.install.desktop.step3') }}</span>
          </li>
        </ol>
        <div class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
          <InfoIcon class="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <p class="text-amber-800 dark:text-amber-300">
            {{ $t('views.about.install.desktop.note') }}
          </p>
        </div>
      </div>

      <div class="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm mt-6">
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
