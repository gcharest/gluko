import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MealCalculator from '../MealCalculator.vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
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
          ConfirmationModal: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
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
          BaseButton: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    const flexContainer = wrapper.find('.flex.flex-col')
    expect(flexContainer.exists()).toBe(true)
  })

  it('shows save to history button', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
          BaseButton: { template: '<button class="base-button-stub"><slot /></button>' }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const button = wrapper.find('button.base-button-stub')
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
          BaseButton: {
            template: '<button type="button" class="base-button-stub"><slot /></button>',
            props: ['variant', 'disabled']
          }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const button = wrapper.find('button.base-button-stub')
    expect(button.attributes('type')).toBe('button')
  })

  it('save button renders with content', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
          BaseButton: { template: '<button class="base-button-stub"><slot /></button>' }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const button = wrapper.find('button.base-button-stub')
    expect(button.exists()).toBe(true)
    // Verify the button contains the save to history text
    expect(wrapper.html()).toContain('components.mealCalculator.actions.saveToHistory')
  })

  it('renders NutrientList component', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: { template: '<div class="nutrient-list-stub"></div>' },
          ConfirmationModal: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
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
          ConfirmationModal: { template: '<div class="confirmation-modal-stub"></div>' }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const modal = wrapper.find('.confirmation-modal-stub')
    expect(modal.exists()).toBe(true)
  })

  it('button uses BaseButton component', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
          BaseButton: {
            template: '<button class="base-button" :variant="variant"><slot /></button>',
            props: ['variant', 'disabled']
          }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const button = wrapper.find('button.base-button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('variant')).toBe('primary')
  })

  it('has proper gap spacing in flex container', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
          BaseButton: true
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const flexContainer = wrapper.find('.flex.flex-col')
    expect(flexContainer.classes()).toContain('gap-4')
  })

  it('renders with proper accessibility structure', () => {
    const wrapper = mount(MealCalculator, {
      global: {
        plugins: [createPinia()],
        stubs: {
          NutrientList: true,
          ConfirmationModal: true,
          BaseButton: {
            template: '<button type="button" class="base-button-stub"><slot /></button>',
            props: ['variant', 'disabled']
          }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const button = wrapper.find('button.base-button-stub')
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
            props: ['title']
          }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    expect(wrapper.html()).toContain('modals.confirmation.reset.title')
  })
})
