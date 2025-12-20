<template>
  <aside
    class="hidden lg:flex fixed left-0 top-0 bottom-0 z-30"
    :class="sideRailClasses"
    :aria-label="$t('navigation.mainNavigation')"
  >
    <div class="flex flex-col h-full py-4">
      <!-- Logo/Brand -->
      <div class="px-4 mb-6">
        <RouterLink
          to="/"
          class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-600 text-white font-bold text-xl hover:bg-primary-700 transition-colors"
          aria-label="Gluko Home"
        >
          G
        </RouterLink>
      </div>

      <!-- Navigation Items -->
      <nav class="flex-1 px-3 space-y-1">
        <RouterLink
          v-for="item in sideRailItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="navItemClasses(item.to)"
          :aria-label="item.label"
          :title="item.label"
        >
          <component :is="item.icon" class="w-6 h-6" />
          <span class="text-xs mt-1 font-medium">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Bottom Actions -->
      <div class="px-3 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <!-- Theme Toggle -->
        <button
          type="button"
          class="flex items-center justify-center w-full h-12 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 hover:scale-105"
          :aria-label="$t('navigation.toggleTheme')"
          :title="$t('navigation.toggleTheme')"
          @click="toggleTheme"
        >
          <SunIcon v-if="isDark" class="w-6 h-6" />
          <MoonIcon v-else class="w-6 h-6" />
        </button>

        <!-- Language Toggle -->
        <button
          type="button"
          class="flex items-center justify-center w-full h-12 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 hover:scale-105"
          :aria-label="$t('navigation.changeLanguage')"
          :title="$t('navigation.changeLanguage')"
          @click="toggleLanguage"
        >
          <LanguagesIcon class="w-6 h-6" />
        </button>

        <!-- GitHub Link -->
        <a
          href="https://github.com/gcharest/gluko"
          target="_blank"
          rel="noopener"
          class="flex items-center justify-center w-full h-12 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 hover:scale-105"
          :aria-label="$t('navigation.sourceCode')"
          :title="$t('navigation.sourceCode')"
        >
          <GithubIcon class="w-6 h-6" />
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigationStore } from '@/stores/navigation'
import { useDarkMode } from '@/composables/useDarkMode'
import { useI18n } from 'vue-i18n'
import {
  SunIcon,
  MoonIcon,
  LanguagesIcon,
  GithubIcon,
} from 'lucide-vue-next'

const route = useRoute()
const navigationStore = useNavigationStore()
const { isDark, setLight, setDark } = useDarkMode()
const { locale } = useI18n()

const sideRailItems = computed(() => navigationStore.sideRailItems)

const sideRailClasses = computed(() => [
  'w-20',
  'bg-white dark:bg-gray-900',
  'border-r border-gray-200 dark:border-gray-800',
  'shadow-sm',
])

function navItemClasses(to: string) {
  const isActive = route.path === to
  return [
    'flex flex-col items-center justify-center',
    'w-full h-16',
    'rounded-lg',
    'transition-all duration-150',
    'hover:scale-105',
    isActive
      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800',
  ]
}

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
