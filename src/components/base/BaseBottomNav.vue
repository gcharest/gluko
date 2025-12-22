<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
    :class="navClasses"
    :aria-label="$t('navigation.mainNavigation')"
  >
    <div class="flex justify-around items-center h-16 px-2 pb-safe">
      <RouterLink
        v-for="item in bottomNavItems"
        :key="item.to"
        :to="item.to"
        class="nav-item relative"
        :class="navItemClasses(item.to)"
        :aria-label="item.label"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span
          v-if="item.showBadge"
          class="absolute top-1 right-1 w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
          aria-hidden="true"
        />
        <span class="sr-only">{{ item.label }}</span>
      </RouterLink>

      <!-- Menu Button -->
      <button
        type="button"
        class="nav-item relative"
        :class="menuButtonClasses"
        :aria-label="$t('navigation.menu')"
        @click="showMenu = true"
      >
        <MoreHorizontalIcon class="w-6 h-6" />
        <!-- Show badge if any overflow item has a badge -->
        <span
          v-if="hasOverflowBadge"
          class="absolute top-1 right-1 w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
          aria-hidden="true"
        />
        <span class="sr-only">{{ $t('navigation.menu') }}</span>
      </button>
    </div>
  </nav>

  <!-- Menu Modal -->
  <BaseModal v-model:open="showMenu" :title="$t('navigation.menu')" size="sm">
    <nav class="space-y-2">
      <!-- Navigation Items (Home, About, Settings) -->
      <RouterLink
        v-for="item in overflowItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
        @click="showMenu = false"
      >
        <div class="flex items-center space-x-3">
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </div>
        <!-- Badge indicator for items with notifications -->
        <span
          v-if="item.showBadge"
          class="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
          aria-hidden="true"
        />
      </RouterLink>

      <!-- Divider -->
      <hr class="border-gray-200 dark:border-gray-700" />

      <!-- Theme Toggle -->
      <button
        type="button"
        class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 w-full text-left"
        @click="toggleTheme"
      >
        <SunIcon v-if="isDark" class="w-5 h-5" />
        <MoonIcon v-else class="w-5 h-5" />
        <span>{{ isDark ? $t('theme.light') : $t('theme.dark') }}</span>
      </button>

      <!-- Language Toggle -->
      <button
        type="button"
        class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 w-full text-left"
        @click="toggleLanguage"
      >
        <LanguagesIcon class="w-5 h-5" />
        <span>{{ locale === 'en' ? 'Français' : 'English' }}</span>
      </button>

      <!-- Divider -->
      <hr class="border-gray-200 dark:border-gray-700" />

      <!-- GitHub Link -->
      <a
        href="https://github.com/gcharest/gluko"
        target="_blank"
        rel="noopener"
        class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
        @click="showMenu = false"
      >
        <!-- GitHub icon from Simple Icons -->
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
        <span>{{ $t('navigation.sourceCode') }}</span>
      </a>
    </nav>

    <!-- Version Info -->
    <div
      class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      <p>Gluko © Guillaume Charest 2021-2023</p>
      <p class="text-xs">ver. {{ version }} ({{ buildDate }})</p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigationStore } from '@/stores/navigation'
import { useDarkMode } from '@/composables/useDarkMode'
import { useI18n } from 'vue-i18n'
import BaseModal from './BaseModal.vue'
import { MoreHorizontalIcon, SunIcon, MoonIcon, LanguagesIcon } from 'lucide-vue-next'

const route = useRoute()
const navigationStore = useNavigationStore()
const { isDark, setLight, setDark } = useDarkMode()
const { locale } = useI18n()
const showMenu = ref(false)

// Access build-time constants
const version = __APP_VERSION__
const buildDate = new Date(__BUILD_DATE__).toISOString().slice(0, 10)

const bottomNavItems = computed(() => navigationStore.bottomNavItems)

// Items that don't fit in bottom nav (overflow items: Home, About, Settings)
const overflowItems = computed(() =>
  navigationStore.navigationItems.filter((item) => !item.showInBottomNav)
)

// Check if any overflow item has a badge (for menu button badge inheritance)
const hasOverflowBadge = computed(() => overflowItems.value.some((item) => item.showBadge))

const navClasses = computed(() => [
  'bg-white dark:bg-gray-900',
  'border-t border-gray-200 dark:border-gray-800',
  'shadow-lg'
])

const menuButtonClasses = computed(() => [
  'flex flex-col items-center justify-center',
  'flex-1 min-h-[56px]', // Increased from 44px to 56px for better touch targets
  'transition-colors duration-150',
  'rounded-lg mx-1',
  'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
])

function navItemClasses(to: string) {
  const isActive = route.path === to
  return [
    'flex flex-col items-center justify-center',
    'flex-1 min-h-[56px]', // Increased from 44px to 56px for better touch targets
    'transition-colors duration-150',
    'rounded-lg mx-1',
    isActive
      ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
  ]
}

function toggleTheme() {
  if (isDark.value) {
    setLight()
  } else {
    setDark()
  }
  showMenu.value = false
}

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'fr' : 'en'
  showMenu.value = false
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

.nav-item {
  -webkit-tap-highlight-color: transparent;
}
</style>
