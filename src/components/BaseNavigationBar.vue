<script setup lang="ts">
import { Collapse } from 'bootstrap'

const collapseNavbar = () => {
  const navbarMain = document.getElementById('navbarMain')
  if (navbarMain) {
    const collapse = new Collapse(navbarMain)
    return collapse
  }
}
</script>
<template>
  <a id="skip-to-content" class="visually-hidden-focusable" href="#content">
    {{ $t('navigation.skipToContent') }}
  </a>
  <header class="border-bottom border-secondary">
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Gluko</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarMain">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/" @click="collapseNavbar">{{
                $t('Calculateur')
              }}</RouterLink>
            </li>
            <li>
              <RouterLink class="nav-link" to="/carb-factor" @click="collapseNavbar">{{
                $t('carbFactor')
              }}</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/about" @click="collapseNavbar">{{
                $t('about')
              }}</RouterLink>
            </li>
          </ul>
          <div class="d-flex">
            <button
              class="btn btn-secondary"
              @click="$i18n.locale === 'fr' ? ($i18n.locale = 'en') : ($i18n.locale = 'fr')"
            >
              {{ $t('navigation.toggleLanguage') }}
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
