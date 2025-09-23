import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseNavigationBar from '@/components/BaseNavigationBar.vue'

describe('BaseNavigationBar.vue', () => {
  it('has a link to skip to the content', () => {
    const wrapper = mount(BaseNavigationBar)
    const skipLink = wrapper.find('#skip-to-content')

    expect(skipLink.exists()).toBe(true)
    expect(skipLink.attributes('href')).toBe('#content')
  })

  it('renders a header', () => {
    const wrapper = mount(BaseNavigationBar)
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('has no props', () => {
    const wrapper = mount(BaseNavigationBar)
    expect(wrapper.props()).toEqual({})
  })
})
