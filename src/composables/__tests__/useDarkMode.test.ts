import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDarkMode } from '../useDarkMode'

// Mock @vueuse/core
vi.mock('@vueuse/core', () => {
  return {
    useColorMode: () => {
      // Import ref at runtime within the mock
      const { ref } = require('vue')
      const mode = ref('light')
      return mode
    }
  }
})

describe('useDarkMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with mode ref', () => {
    const { mode } = useDarkMode()
    expect(mode).toBeDefined()
  })

  it('provides isDark computed property', () => {
    const { isDark, mode } = useDarkMode()
    expect(isDark.value).toBe(false)

    mode.value = 'dark'
    expect(isDark.value).toBe(true)
  })

  it('provides isLight computed property', () => {
    const { isLight, mode } = useDarkMode()
    expect(isLight.value).toBe(true)

    mode.value = 'dark'
    expect(isLight.value).toBe(false)
  })

  it('provides isAuto computed property', () => {
    const { isAuto, mode } = useDarkMode()
    expect(isAuto.value).toBe(false)

    mode.value = 'auto'
    expect(isAuto.value).toBe(true)
  })

  it('provides setLight method', () => {
    const { mode, setLight } = useDarkMode()
    mode.value = 'dark'

    setLight()
    expect(mode.value).toBe('light')
  })

  it('provides setDark method', () => {
    const { mode, setDark } = useDarkMode()
    mode.value = 'light'

    setDark()
    expect(mode.value).toBe('dark')
  })

  it('provides setAuto method', () => {
    const { mode, setAuto } = useDarkMode()
    mode.value = 'light'

    setAuto()
    expect(mode.value).toBe('auto')
  })

  it('computed properties are reactive', () => {
    const { mode, isDark, isLight, isAuto } = useDarkMode()

    mode.value = 'light'
    expect(isLight.value).toBe(true)
    expect(isDark.value).toBe(false)
    expect(isAuto.value).toBe(false)

    mode.value = 'dark'
    expect(isLight.value).toBe(false)
    expect(isDark.value).toBe(true)
    expect(isAuto.value).toBe(false)

    mode.value = 'auto'
    expect(isLight.value).toBe(false)
    expect(isDark.value).toBe(false)
    expect(isAuto.value).toBe(true)
  })
})
