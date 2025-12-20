<template>
  <header
    class="sticky top-0 z-20 lg:hidden"
    :class="topBarClasses"
  >
    <!-- Skip to content link -->
    <a
      href="#content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-700 focus:rounded-lg focus:shadow-lg"
    >
      {{ $t('navigation.skipToContent') }}
    </a>

    <div class="flex items-center justify-between h-14 px-4">
      <!-- Left: Menu Button (if needed) or Brand -->
      <div class="flex items-center">
        <RouterLink
          to="/"
          class="text-xl font-bold text-gray-900 dark:text-white"
        >
          Gluko
        </RouterLink>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center space-x-2">
        <!-- Theme Toggle -->
        <button
          type="button"
          class="flex items-center justify-center w-10 h-10 min-h-11 min-w-11 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          :aria-label="$t('navigation.toggleTheme')"
          @click="toggleTheme"
        >
          <SunIcon v-if="isDark" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>

        <!-- Language Toggle -->
        <button
          type="button"
          class="flex items-center justify-center w-10 h-10 min-h-11 min-w-11 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          :aria-label="$t('navigation.changeLanguage')"
          @click="toggleLanguage"
        >
          <LanguagesIcon class="w-5 h-5" />
        </button>

        <!-- Menu Button (if we need overflow menu) -->
        <button
          type="button"
          class="flex items-center justify-center w-10 h-10 min-h-11 min-w-11 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          :aria-label="$t('navigation.menu')"
          @click="showMenu = true"
        >
          <MoreVerticalIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>

  <!-- Overflow Menu Modal -->
  <BaseModal v-model:open="showMenu" :title="$t('navigation.menu')" size="sm">
    <nav class="space-y-2">
      <RouterLink
        v-for="item in overflowItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
        @click="showMenu = false"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </RouterLink>

      <!-- GitHub Link -->
      <a
        href="https://github.com/gcharest/gluko"
        target="_blank"
        rel="noopener"
        class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
        @click="showMenu = false"
      >
        <GithubIcon class="w-5 h-5" />
        <span>{{ $t('navigation.sourceCode') }}</span>
      </a>
    </nav>

    <!-- Version Info -->
    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>Gluko © Guillaume Charest 2021-2023</p>
      <p class="text-xs">ver. {{ version }} ({{ buildDate }})</p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNavigationStore } from '@/stores/navigation'
import { useDarkMode } from '@/composables/useDarkMode'
import { useI18n } from 'vue-i18n'
import BaseModal from './BaseModal.vue'
import {
  SunIcon,
  MoonIcon,
  LanguagesIcon,
  MoreVerticalIcon,
  GithubIcon,
} from 'lucide-vue-next'

const navigationStore = useNavigationStore()
const { isDark, setLight, setDark } = useDarkMode()
const { locale } = useI18n()
const showMenu = ref(false)

// Access build-time constants
const version = __APP_VERSION__
const buildDate = new Date(__BUILD_DATE__).toISOString().slice(0, 10)

const topBarClasses = computed(() => [
  'bg-white dark:bg-gray-900',
  'border-b border-gray-200 dark:border-gray-800',
  'shadow-sm',
])

// Items that don't fit in bottom nav (overflow items)
const overflowItems = computed(() =>
  navigationStore.navigationItems.filter((item) => !item.showInBottomNav)
)

function toggleTheme() {
  if (isDark.value) {
    setLight()
  } else {
    setDark()
  }
}

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'fr' : 'en'
}
</script>
