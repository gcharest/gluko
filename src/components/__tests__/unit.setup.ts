import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en.json'
import fr from '@/i18n/locales/fr.json'

// Create i18n instance with actual locale data for tests
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages: {
    fr,
    en
  }
})

// Mock the useI18n composable
vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
      d: (value: number | Date) => value.toString(),
      n: (value: number) => value.toString(),
      te: () => true,
      locale: 'fr'
    })
  }
})

// Configure global plugins and mocks for Vue Test Utils
config.global.plugins = [i18n]
config.global.mocks = {
  // Router mocks
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  },
  $route: {
    path: '/',
    name: 'home',
    params: {},
    query: {},
    hash: '',
    meta: {}
  }
}

// Stub router-link component
config.global.stubs = {
  RouterLink: {
    template: '<a><slot/></a>',
    props: ['to']
  }
}
