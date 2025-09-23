import { config } from '@vue/test-utils'
import { vi } from 'vitest'

config.global.mocks = {
  $t: (key: any) => key,
  $i18n: {
    locale: 'fr'
  },
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

// Mock router-link component
config.global.stubs = {
  RouterLink: {
    template: '<a><slot/></a>',
    props: ['to']
  }
}
