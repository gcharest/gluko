import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MealHistoryView from '../MealHistoryView.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('MealHistoryView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the view', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders filters section', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseButton: true,
          BaseInput: true
          // Don't stub BaseCard so we can see its slot content
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    expect(wrapper.text()).toContain('views.mealHistory.filters.title')
  })

  it('renders export and import buttons', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    // The new design uses BaseButton component instead of .btn-secondary class
    const buttons = wrapper.findAll('base-button-stub')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('has export button with icon', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseInput: true
          // Don't stub BaseButton so we can see its content
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    // Find all buttons and look for the export button
    const buttons = wrapper.findAllComponents({ name: 'BaseButton' })
    const exportButton = buttons.find((b) => b.text().includes('views.mealHistory.actions.export'))
    expect(exportButton).toBeDefined()
    expect(exportButton!.text()).toContain('views.mealHistory.actions.export')
    // The new design uses lucide-vue-next DownloadIcon instead of Bootstrap icons
    expect(exportButton!.html()).toContain('svg')
  })

  it('has import button with icon', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseInput: true
          // Don't stub BaseButton so we can see its content
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    // Find all buttons and look for the import button
    const buttons = wrapper.findAllComponents({ name: 'BaseButton' })
    const importButton = buttons.find((b) => b.text().includes('views.mealHistory.actions.import'))
    expect(importButton).toBeDefined()
    expect(importButton!.text()).toContain('views.mealHistory.actions.import')
    // The new design uses lucide-vue-next UploadIcon instead of Bootstrap icons
    expect(importButton!.html()).toContain('svg')
  })

  it('renders search input', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true
          // Don't stub BaseInput so we can see the input element
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const searchInput = wrapper.find('#searchInput')
    expect(searchInput.exists()).toBe(true)
    expect(searchInput.attributes('type')).toBe('search')
  })

  it('renders page size selector', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const pageSelector = wrapper.find('#page-size-select')
    expect(pageSelector.exists()).toBe(true)
  })

  it('page size selector has correct options', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const options = wrapper.findAll('#page-size-select option')
    expect(options.length).toBe(4) // 10, 25, 50, 100
    expect((options[0].element as HTMLOptionElement).value).toBe('10')
    expect((options[1].element as HTMLOptionElement).value).toBe('25')
    expect((options[2].element as HTMLOptionElement).value).toBe('50')
    expect((options[3].element as HTMLOptionElement).value).toBe('100')
  })

  it('renders results title', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    expect(wrapper.text()).toContain('views.mealHistory.results.title')
  })

  it('has main container with correct layout', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    // The new design uses Tailwind max-w-7xl mx-auto instead of Bootstrap container-fluid
    const container = wrapper.find('.max-w-7xl')
    expect(container.exists()).toBe(true)
  })

  it('has filters sidebar with correct layout', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    // The new design uses Tailwind md:col-span-1 instead of Bootstrap col-md-3
    const sidebar = wrapper.find('.md\\:col-span-1')
    expect(sidebar.exists()).toBe(true)
  })

  it('has main content area with correct layout', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    // The new design uses Tailwind md:col-span-3 instead of Bootstrap col-md-9
    const content = wrapper.find('.md\\:col-span-3')
    expect(content.exists()).toBe(true)
  })

  it('renders h1 with history title', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
          BaseCard: true,
          BaseButton: true,
          BaseInput: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('navigation.history')
  })

  it('renders DateRangeFilter component', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: { template: '<div class="date-range-filter-stub"></div>' },
          SubjectSelector: true,
          MealHistoryCard: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    expect(wrapper.find('.date-range-filter-stub').exists()).toBe(true)
  })

  it('renders SubjectSelector component', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: { template: '<div class="subject-selector-stub"></div>' },
          MealHistoryCard: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    expect(wrapper.find('.subject-selector-stub').exists()).toBe(true)
  })
})
