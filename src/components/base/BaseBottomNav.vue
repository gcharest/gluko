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
        <span class="sr-only">{{ $t('navigation.menu') }}</span>
      </button>
    </div>
  </nav>

  <!-- Menu Modal -->
  <BaseModal v-model:open="showMenu" :title="$t('navigation.menu')" size="sm">
    <nav class="space-y-2">
      <!-- Navigation Items (Home, About) -->
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
        <GithubIcon class="w-5 h-5" />
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
import {
  MoreHorizontalIcon,
  SunIcon,
  MoonIcon,
  LanguagesIcon,
  GithubIcon
} from 'lucide-vue-next'

const route = useRoute()
const navigationStore = useNavigationStore()
const { isDark, setLight, setDark } = useDarkMode()
const { locale } = useI18n()
const showMenu = ref(false)

// Access build-time constants
const version = __APP_VERSION__
const buildDate = new Date(__BUILD_DATE__).toISOString().slice(0, 10)

const bottomNavItems = computed(() => navigationStore.bottomNavItems)

// Items that don't fit in bottom nav (overflow items: Home, About)
const overflowItems = computed(() =>
  navigationStore.navigationItems.filter((item) => !item.showInBottomNav)
)

const navClasses = computed(() => [
  'bg-white dark:bg-gray-900',
  'border-t border-gray-200 dark:border-gray-800',
  'shadow-lg'
])

const menuButtonClasses = computed(() => [
  'flex flex-col items-center justify-center',
  'flex-1 min-h-[44px]',
  'transition-colors duration-150',
  'rounded-lg mx-1',
  'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
])

function navItemClasses(to: string) {
  const isActive = route.path === to
  return [
    'flex flex-col items-center justify-center',
    'flex-1 min-h-[44px]',
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
