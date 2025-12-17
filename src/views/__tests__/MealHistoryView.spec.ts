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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    const buttons = wrapper.findAll('button.btn-secondary')
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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    const exportButton = wrapper.findAll('button.btn-secondary')[0]
    expect(exportButton.text()).toContain('views.mealHistory.actions.export')
    expect(exportButton.find('i.bi-download').exists()).toBe(true)
  })

  it('has import button with icon', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    const importButton = wrapper.findAll('button.btn-secondary')[1]
    expect(importButton.text()).toContain('views.mealHistory.actions.import')
    expect(importButton.find('i.bi-upload').exists()).toBe(true)
  })

  it('renders search input', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const options = wrapper.findAll('#page-size-select option')
    expect(options.length).toBe(4) // 10, 25, 50, 100
    expect(options[0].element.value).toBe('10')
    expect(options[1].element.value).toBe('25')
    expect(options[2].element.value).toBe('50')
    expect(options[3].element.value).toBe('100')
  })

  it('renders results title', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    const container = wrapper.find('.container-fluid')
    expect(container.exists()).toBe(true)
  })

  it('has filters sidebar with col-md-3 class', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    const sidebar = wrapper.find('.col-md-3')
    expect(sidebar.exists()).toBe(true)
  })

  it('has main content area with col-md-9 class', () => {
    const wrapper = mount(MealHistoryView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          DateRangeFilter: true,
          SubjectSelector: true,
          MealHistoryCard: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    const content = wrapper.find('.col-md-9')
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
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
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
          MealHistoryCard: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
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
          MealHistoryCard: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    expect(wrapper.find('.subject-selector-stub').exists()).toBe(true)
  })
})
