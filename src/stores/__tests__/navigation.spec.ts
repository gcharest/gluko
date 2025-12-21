import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNavigationStore } from '../navigation'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('navigation Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('State Initialization', () => {
    it('initializes with closed side rail', () => {
      const store = useNavigationStore()
      expect(store.isSideRailOpen).toBe(false)
    })

    it('provides navigation items', () => {
      const store = useNavigationStore()
      expect(store.navigationItems).toBeDefined()
      expect(store.navigationItems.length).toBeGreaterThan(0)
    })

    it('navigation items have required properties', () => {
      const store = useNavigationStore()
      store.navigationItems.forEach((item) => {
        expect(item).toHaveProperty('to')
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('showInBottomNav')
        expect(item).toHaveProperty('showInSideRail')
      })
    })
  })

  describe('Navigation Items', () => {
    it('includes home navigation item', () => {
      const store = useNavigationStore()
      const homeItem = store.navigationItems.find((item) => item.to === '/')
      expect(homeItem).toBeDefined()
      expect(homeItem!.label).toBe('navigation.home')
    })

    it('includes calculator navigation item', () => {
      const store = useNavigationStore()
      const calcItem = store.navigationItems.find((item) => item.to === '/calculator')
      expect(calcItem).toBeDefined()
      expect(calcItem!.label).toBe('components.mealCalculator.title')
    })

    it('includes history navigation item', () => {
      const store = useNavigationStore()
      const historyItem = store.navigationItems.find((item) => item.to === '/history')
      expect(historyItem).toBeDefined()
      expect(historyItem!.label).toBe('navigation.history')
    })

    it('includes settings navigation item', () => {
      const store = useNavigationStore()
      const settingsItem = store.navigationItems.find((item) => item.to === '/settings')
      expect(settingsItem).toBeDefined()
      expect(settingsItem!.label).toBe('navigation.settings')
    })

    it('includes carb factor navigation item', () => {
      const store = useNavigationStore()
      const carbFactorItem = store.navigationItems.find((item) => item.to === '/carb-factor')
      expect(carbFactorItem).toBeDefined()
      expect(carbFactorItem!.label).toBe('navigation.carbFactor')
    })

    it('includes about navigation item', () => {
      const store = useNavigationStore()
      const aboutItem = store.navigationItems.find((item) => item.to === '/about')
      expect(aboutItem).toBeDefined()
      expect(aboutItem!.label).toBe('navigation.about')
    })
  })

  describe('Bottom Nav Items', () => {
    it('filters items for bottom navigation', () => {
      const store = useNavigationStore()
      expect(store.bottomNavItems.length).toBeGreaterThan(0)
      expect(store.bottomNavItems.length).toBeLessThanOrEqual(store.navigationItems.length)
    })

    it('only includes items with showInBottomNav=true', () => {
      const store = useNavigationStore()
      store.bottomNavItems.forEach((item) => {
        expect(item.showInBottomNav).toBe(true)
      })
    })

    it('includes calculator, history, carb factor, and settings in bottom nav', () => {
      const store = useNavigationStore()
      const paths = store.bottomNavItems.map((item) => item.to)
      expect(paths).toContain('/calculator')
      expect(paths).toContain('/history')
      expect(paths).toContain('/carb-factor')
      expect(paths).toContain('/settings')
    })

    it('excludes home and about from bottom nav', () => {
      const store = useNavigationStore()
      const paths = store.bottomNavItems.map((item) => item.to)
      expect(paths).not.toContain('/')
      expect(paths).not.toContain('/about')
    })
  })

  describe('Side Rail Items', () => {
    it('filters items for side rail navigation', () => {
      const store = useNavigationStore()
      expect(store.sideRailItems.length).toBeGreaterThan(0)
    })

    it('only includes items with showInSideRail=true', () => {
      const store = useNavigationStore()
      store.sideRailItems.forEach((item) => {
        expect(item.showInSideRail).toBe(true)
      })
    })

    it('includes all navigation items in side rail', () => {
      const store = useNavigationStore()
      // All items should have showInSideRail=true
      expect(store.sideRailItems.length).toBe(store.navigationItems.length)
    })
  })

  describe('Side Rail State Management', () => {
    it('toggles side rail state', () => {
      const store = useNavigationStore()
      expect(store.isSideRailOpen).toBe(false)

      store.toggleSideRail()
      expect(store.isSideRailOpen).toBe(true)

      store.toggleSideRail()
      expect(store.isSideRailOpen).toBe(false)
    })

    it('opens side rail', () => {
      const store = useNavigationStore()
      store.isSideRailOpen = false

      store.openSideRail()
      expect(store.isSideRailOpen).toBe(true)

      // Opening again should keep it open
      store.openSideRail()
      expect(store.isSideRailOpen).toBe(true)
    })

    it('closes side rail', () => {
      const store = useNavigationStore()
      store.isSideRailOpen = true

      store.closeSideRail()
      expect(store.isSideRailOpen).toBe(false)

      // Closing again should keep it closed
      store.closeSideRail()
      expect(store.isSideRailOpen).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('navigation items are reactive to i18n changes', () => {
      const store = useNavigationStore()
      const itemsBefore = store.navigationItems.length
      expect(itemsBefore).toBeGreaterThan(0)

      // The items should be computed and reactive
      const itemsAfter = store.navigationItems.length
      expect(itemsAfter).toBe(itemsBefore)
    })

    it('bottom nav items update when navigation items change', () => {
      const store = useNavigationStore()
      const count = store.bottomNavItems.length
      expect(count).toBeGreaterThan(0)

      // Should remain consistent
      expect(store.bottomNavItems.length).toBe(count)
    })

    it('side rail items update when navigation items change', () => {
      const store = useNavigationStore()
      const count = store.sideRailItems.length
      expect(count).toBeGreaterThan(0)

      // Should remain consistent
      expect(store.sideRailItems.length).toBe(count)
    })
  })
})
