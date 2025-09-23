import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import BaseFooter from '@/components/base/BaseFooter.vue'

describe('BaseFooter.vue', () => {
  const wrapper = shallowMount(BaseFooter)
  it('renders a footer element', () => {
    expect(wrapper.find('footer').exists()).toBe(true)
  })
})
