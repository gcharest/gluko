<script setup lang="ts">
//Adapted from Bootstrap 5.3 documentation: https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
import { onBeforeMount, ref } from 'vue'
const retrieveStoredTheme = () => localStorage.getItem('theme')
const setStoredTheme = (theme: string) => localStorage.setItem('theme', theme)
const getPreferredTheme = () => {
  const storedTheme = retrieveStoredTheme()
  if (storedTheme) {
    return storedTheme
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
const activeTheme = ref()
const updateTheme = (theme: string) => {
  setStoredTheme(theme)
  activeTheme.value = theme
  if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-bs-theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }
}
onBeforeMount(() => {
  updateTheme(getPreferredTheme())
})
</script>
<template>
  <button
id="theme" class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
    type="button" aria-expanded="false" data-bs-toggle="dropdown" data-bs-display="static"
    aria-label="Toggle theme (auto)">
    <i class="bi bi-circle-half"></i>
    <span id="theme-text" class="d-lg-none ms-2">{{ $t('theme.toggle') }}</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="theme-text">
    <li>
      <button
type="button" class="dropdown-item d-flex align-items-center" :class="{ active: activeTheme === 'light' }"
        aria-pressed="false" @click="updateTheme('light')">
        <i class="bi bi-sun-fill"></i>
        <span class="ms-2">
          {{ $t('theme.light') }}
        </span>
        <i v-if="activeTheme === 'light'" class="bi bi-check2 ms-2"></i>
      </button>
    </li>
    <li>
      <button
type="button" class="dropdown-item d-flex align-items-center" :class="{ active: activeTheme === 'dark' }"
        aria-pressed="false" @click="updateTheme('dark')">
        <i class="bi bi-moon-stars-fill"></i>
        <span class="ms-2">
          {{ $t('theme.dark') }}
        </span>
        <i v-if="activeTheme === 'dark'" class="bi bi-check2 ms-2"></i>
      </button>
    </li>
    <li>
      <button
type="button" class="dropdown-item d-flex align-items-center" :class="{ active: activeTheme === 'auto' }"
        aria-pressed="true" @click="updateTheme('auto')">
        <i class="bi bi-circle-half"> </i>
        <span class="ms-2">
          {{ $t('theme.auto') }}
        </span>
        <i v-if="activeTheme === 'auto'" class="bi bi-check2 ms-2"></i>
      </button>
    </li>
  </ul>
</template>
