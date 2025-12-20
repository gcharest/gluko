import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

export function useDarkMode() {
  const mode = useColorMode({
    modes: {
      light: 'light',
      dark: 'dark',
      auto: 'auto'
    },
    storageKey: 'gluko-theme',
  })

  return {
    mode,
    isDark: computed(() => mode.value === 'dark'),
    isLight: computed(() => mode.value === 'light'),
    isAuto: computed(() => mode.value === 'auto'),
    setLight: () => { mode.value = 'light' },
    setDark: () => { mode.value = 'dark' },
    setAuto: () => { mode.value = 'auto' },
  }
}
