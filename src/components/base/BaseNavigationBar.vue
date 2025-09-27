<script setup lang="ts">
import { Offcanvas } from 'bootstrap'
import BaseLanguageToggler from './BaseLanguageToggler.vue'
import BaseThemeToggler from './BaseThemeToggler.vue'
import BaseNotice from './BaseNotice.vue'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
const { t } = useI18n()
const mainNavigationBarAriaLabel = ref(t('navigation.mainNavigation'))
const navbarRef = ref<HTMLElement | null>(null)
const offcanvasInstance = ref<Offcanvas | null>(null)

onMounted(() => {
  // Initialize offcanvas and ensure aria attributes are properly managed
  if (navbarRef.value) {
    // Initialize immediately when the element is available
    offcanvasInstance.value = new Offcanvas(navbarRef.value!, {
      scroll: true,
      backdrop: true
    })

    // Handle both show and shown events to ensure aria states are properly managed
    navbarRef.value!.addEventListener('show.bs.offcanvas', () => {
      const toggler = document.querySelector('[data-bs-toggle="offcanvas"]')
      if (toggler) {
        toggler.setAttribute('aria-expanded', 'true')
      }
    })

    navbarRef.value!.addEventListener('shown.bs.offcanvas', () => {
      const toggler = document.querySelector('[data-bs-toggle="offcanvas"]')
      if (toggler) {
        toggler.setAttribute('aria-expanded', 'true')
      }
    })

    navbarRef.value!.addEventListener('hide.bs.offcanvas', () => {
      const toggler = document.querySelector('[data-bs-toggle="offcanvas"]')
      if (toggler) {
        toggler.setAttribute('aria-expanded', 'false')
      }
    })
  }
})
</script>
<template>
  <div class="skippy visually-hidden-focusable overflow-hidden">
    <div class="container-xl">
      <a id="skip-to-content" class="d-inline-flex p-2 m-1" href="#content">
        {{ $t('navigation.skipToContent') }}
      </a>
    </div>
  </div>
  <header class="navbar navbar-expand-lg sticky-top bg-primary bg-gradient">
    <nav class="container-xxl flex-wrap flex-lg-nowrap" :aria-label="mainNavigationBarAriaLabel">
      <button
class="navbar-toggler p-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#navbarMain"
        aria-controls="navbarMain" aria-expanded="false" :aria-label="$t('navigation.toggleNavigation')">
        <span class="navbar-toggler-icon"></span>
      </button>
      <RouterLink class="navbar-brand d-none d-lg-inline-block" to="/">Gluko</RouterLink>
      <div
id="navbarMain" ref="navbarRef" class="offcanvas-lg offcanvas-start flex-grow-1" tabindex="-1"
        aria-labelledby="mainNavbarOffCanvas" data-bs-scroll="true">
        <div class="offcanvas-header px-4 pb-0">
          <h1 class="display-5 offcanvas-title">Gluko</h1>
          <button
type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#navbarMain"
            aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-4 pt-0 p-lg-0">
          <ul class="navbar-nav flex-row flex-wrap fw-bold">
            <li class="nav-item col-12 col-lg-auto mb-lg-1" data-bs-dismiss="offcanvas" data-bs-target="#navbarMain">
              <RouterLink class="nav-link" to="/calculator">
                {{ $t('components.mealCalculator.title') }}
              </RouterLink>
            </li>
            <li class="nav-item col-12 col-lg-auto mb-lg-1" data-bs-dismiss="offcanvas" data-bs-target="#navbarMain">
              <RouterLink class="nav-link" to="/history">{{ $t('navigation.history') }}</RouterLink>
            </li>
            <li class="nav-item col-12 col-lg-auto mb-lg-1" data-bs-dismiss="offcanvas" data-bs-target="#navbarMain">
              <RouterLink class="nav-link" to="/carb-factor">{{
                $t('navigation.carbFactor')
                }}</RouterLink>
            </li>
            <li class="nav-item col-12 col-lg-auto mb-lg-1" data-bs-dismiss="offcanvas" data-bs-target="#navbarMain">
              <RouterLink class="nav-link" to="/about">{{ $t('navigation.about') }}</RouterLink>
            </li>
          </ul>
          <ul class="navbar-nav flex-row flex-wrap ms-md-auto">
            <li class="nav-item col-6 col-lg-auto">
              <a
class="nav-link py-2 px-0 px-lg-2" href="https://github.com/gcharest/gluko" target="_blank"
                rel="noopener" :aria-label="$t('navigation.sourceCode')">
                <svg
xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="navbar-nav-svg"
                  viewBox="0 0 512 499.36" role="img">
                  <title>GitHub</title>
                  <path
fill="currentColor" fill-rule="evenodd"
                    d="M256 0C114.64 0 0 114.61 0 256c0 113.09 73.34 209 175.08 242.9 12.8 2.35 17.47-5.56 17.47-12.34 0-6.08-.22-22.18-.35-43.54-71.2 15.49-86.2-34.34-86.2-34.34-11.64-29.57-28.42-37.45-28.42-37.45-23.27-15.84 1.73-15.55 1.73-15.55 25.69 1.81 39.21 26.38 39.21 26.38 22.84 39.12 59.92 27.82 74.5 21.27 2.33-16.54 8.94-27.82 16.25-34.22-56.84-6.43-116.6-28.43-116.6-126.49 0-27.95 10-50.8 26.35-68.69-2.63-6.48-11.42-32.5 2.51-67.75 0 0 21.49-6.88 70.4 26.24a242.65 242.65 0 0 1 128.18 0c48.87-33.13 70.33-26.24 70.33-26.24 14 35.25 5.18 61.27 2.55 67.75 16.41 17.9 26.31 40.75 26.31 68.69 0 98.35-59.85 120-116.88 126.32 9.19 7.9 17.38 23.53 17.38 47.41 0 34.22-.31 61.83-.31 70.23 0 6.85 4.61 14.81 17.6 12.31C438.72 464.97 512 369.08 512 256.02 512 114.62 397.37 0 256 0z">
                  </path>
                </svg>
                <small class="d-lg-none ms-2">GitHub</small>
              </a>
            </li>
            <li class="nav-item py-2 py-lg-1 col-12 col-lg-auto">
              <div class="vr d-none d-lg-flex h-100 mx-lg-2 text-white"></div>
              <hr class="d-lg-none my-2 text-white-50" />
            </li>
            <li class="nav-item dropdown">
              <BaseLanguageToggler />
            </li>
            <li class="nav-item py-2 py-lg-1 col-12 col-lg-auto">
              <div class="vr d-none d-lg-flex h-100 mx-lg-2 text-white"></div>
              <hr class="d-lg-none my-2 text-white-50" />
            </li>
            <li class="nav-item dropdown">
              <BaseThemeToggler />
            </li>
            <li class="nav-item py-2 py-lg-1 col-12 col-lg-auto">
              <hr class="d-lg-none my-2 text-white-50" />
            </li>
            <li class="nav-item">
              <BaseNotice />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>
<style scoped>
.bg-gradient-navbar {
  background-image: linear-gradient(to bottom, #005cbf, #004da6);
  color: white;
  font-weight: bold;
}

.bg-gradient-offcanvas {
  background-image: linear-gradient(to bottom, #004da6, #004085);
  color: white;
  font-weight: bold;
}
</style>
