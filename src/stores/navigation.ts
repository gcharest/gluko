import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import {
  HomeIcon,
  CalculatorIcon,
  HistoryIcon,
  SettingsIcon,
  InfoIcon,
  SearchIcon
} from 'lucide-vue-next'

export interface NavigationItem {
  to: string
  label: string
  /** Short label for compact displays (desktop side rail) */
  shortLabel?: string
  icon: Component
  showInBottomNav?: boolean
  showInSideRail?: boolean
  showBadge?: boolean
}

export const useNavigationStore = defineStore('navigation', () => {
  const { t } = useI18n()
  const isSideRailOpen = ref(false)
  const settingsBadge = ref(false)

  // Define navigation items
  const navigationItems = computed<NavigationItem[]>(() => [
    {
      to: '/',
      label: t('navigation.home'),
      shortLabel: 'Home',
      icon: HomeIcon,
      showInBottomNav: false,
      showInSideRail: true
    },
    {
      to: '/calculator',
      label: t('components.mealCalculator.title'),
      shortLabel: 'Calc',
      icon: CalculatorIcon,
      showInBottomNav: true,
      showInSideRail: true
    },
    {
      to: '/history',
      label: t('navigation.history'),
      shortLabel: 'History',
      icon: HistoryIcon,
      showInBottomNav: true,
      showInSideRail: true
    },
    {
      to: '/carb-factor',
      label: t('navigation.carbFactor'),
      shortLabel: 'Search',
      icon: SearchIcon,
      showInBottomNav: true,
      showInSideRail: true
    },
    {
      to: '/about',
      label: t('navigation.about'),
      shortLabel: 'About',
      icon: InfoIcon,
      showInBottomNav: false,
      showInSideRail: true
    },
    {
      to: '/settings',
      label: t('navigation.settings'),
      shortLabel: 'Settings',
      icon: SettingsIcon,
      showInBottomNav: false, // Now in menu dropdown instead
      showInSideRail: true,
      showBadge: settingsBadge.value
    }
  ])

  // Filter items for bottom nav (mobile)
  const bottomNavItems = computed(() =>
    navigationItems.value.filter((item) => item.showInBottomNav)
  )

  // Filter items for side rail (desktop)
  const sideRailItems = computed(() => navigationItems.value.filter((item) => item.showInSideRail))

  function toggleSideRail() {
    isSideRailOpen.value = !isSideRailOpen.value
  }

  function closeSideRail() {
    isSideRailOpen.value = false
  }

  function openSideRail() {
    isSideRailOpen.value = true
  }

  function setSettingsBadge(show: boolean) {
    settingsBadge.value = show
  }

  return {
    navigationItems,
    bottomNavItems,
    sideRailItems,
    isSideRailOpen,
    settingsBadge,
    toggleSideRail,
    closeSideRail,
    openSideRail,
    setSettingsBadge
  }
})
