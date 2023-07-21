import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import BaseNavigationBar from '@/components/BaseNavigationBar.vue'

describe('BaseHeader.vue', () => {
  const wrapper = shallowMount(BaseNavigationBar)
  it('has a link to skip to the content', () => {
    expect(wrapper.find('#skip-to-content').exists()).toBe(true)
    expect(wrapper.find('#skip-to-content').attributes('href')).toBe('#content')
  })
  it('renders a header', () => {
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('has no props', () => {
    expect(wrapper.props()).toEqual({})
  })
})
