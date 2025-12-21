<template>
  <aside
    class="hidden lg:flex fixed left-0 top-0 bottom-0 z-30"
    :class="sideRailClasses"
    :aria-label="$t('navigation.mainNavigation')"
  >
    <div class="flex flex-col h-full py-4 px-3">
      <!-- Logo/Brand -->
      <div class="mb-6">
        <RouterLink
          to="/"
          class="flex items-center justify-center w-full h-12 rounded-lg bg-primary-600 text-white font-bold text-xl hover:bg-primary-700 transition-colors"
          aria-label="Gluko Home"
        >
          G
        </RouterLink>
      </div>

      <!-- Navigation Items -->
      <nav class="flex-1 space-y-1">
        <RouterLink
          v-for="item in sideRailItems"
          :key="item.to"
          :to="item.to"
          class="nav-item relative"
          :class="navItemClasses(item.to)"
          :aria-label="item.label"
          :title="item.label"
        >
          <component :is="item.icon" class="w-6 h-6" />
          <span
            v-if="item.showBadge"
            class="absolute top-1 right-1 w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
            aria-hidden="true"
          />
          <span class="text-xs mt-1 font-medium text-center">{{ item.shortLabel || item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Bottom Actions -->
      <div class="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
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
          <!-- GitHub icon from Simple Icons -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
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
import { SunIcon, MoonIcon, LanguagesIcon } from 'lucide-vue-next'

const route = useRoute()
const navigationStore = useNavigationStore()
const { isDark, setLight, setDark } = useDarkMode()
const { locale } = useI18n()

const sideRailItems = computed(() => navigationStore.sideRailItems)

const sideRailClasses = computed(() => [
  'w-20',
  'bg-white dark:bg-gray-900',
  'border-r border-gray-200 dark:border-gray-800',
  'shadow-sm'
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
      ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
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
