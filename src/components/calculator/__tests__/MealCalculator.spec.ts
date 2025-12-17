import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MealCalculator from '../MealCalculator.vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('MealCalculator.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the component', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders flex container', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    const flexContainer = wrapper.find('.d-flex.flex-column')
    expect(flexContainer.exists()).toBe(true)
  })

  it('shows save to history button', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const button = wrapper.find('button.btn-primary')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('components.mealCalculator.actions.saveToHistory')
  })

  it('button has correct type', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const button = wrapper.find('button.btn-primary')
    expect(button.attributes('type')).toBe('button')
  })

  it('save button has journal icon', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const icon = wrapper.find('button.btn-primary i.bi-journal-plus')
    expect(icon.exists()).toBe(true)
  })

  it('renders NutrientList component', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: { template: '<div class="nutrient-list-stub"></div>' },
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const nutrientList = wrapper.find('.nutrient-list-stub')
    expect(nutrientList.exists()).toBe(true)
  })

  it('renders ConfirmationModal component', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: { template: '<div class="confirmation-modal-stub"></div>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const modal = wrapper.find('.confirmation-modal-stub')
    expect(modal.exists()).toBe(true)
  })

  it('button has correct Bootstrap classes', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const button = wrapper.find('button.btn-primary')
    expect(button.classes()).toContain('btn')
    expect(button.classes()).toContain('btn-primary')
  })

  it('has proper gap spacing in flex container', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const flexContainer = wrapper.find('.d-flex.flex-column')
    expect(flexContainer.classes()).toContain('gap-3')
  })

  it('renders with proper accessibility structure', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const button = wrapper.find('button.btn-primary')
    expect((button.element as HTMLButtonElement).type).toBe('button')
  })

  it('modal title uses translation key', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: {
            template: '<div :title="title"></div>',
            props: ['title'],
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    expect(wrapper.html()).toContain('modals.confirmation.reset.title')
  })
})
