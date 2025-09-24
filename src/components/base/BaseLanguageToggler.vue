<script setup lang="ts">
// Adapted from https://lokalise.com/blog/vue-i18n/
import i18n from '@/i18n'
import { useI18n } from 'vue-i18n'
import Trans from '@/i18n/translation'
import { computed } from 'vue'
const { t } = useI18n()
const updateActiveLocale = (newLocale: string) => {
  i18n.global.locale.value = newLocale
}
const getSupportedLocales = computed(() => {
  return Trans.supportedLocales
})
</script>
<template>
  <button id="language" class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
    type="button" aria-expanded="false" data-bs-toggle="dropdown" data-bs-display="static"
    :aria-label="$t('locale.toggleLanguage')">
    <i class="bi bi-translate"></i>
    <span id="language-text" class="d-lg-none ms-2">{{ $t('locale.toggleLanguage') }}</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="language-text">
    <li v-for="locale in getSupportedLocales" :key="locale.id">
      <button type="button" class="dropdown-item d-flex align-items-center"
        :class="{ active: i18n.global.locale.value === locale }" aria-pressed="false"
        @click="updateActiveLocale(locale)">
        <span class="ms-2">
          {{ t(`locale.${locale}`) }}
        </span>
        <i v-if="i18n.global.locale.value === locale" class="bi bi-check2 ms-2"></i>
      </button>
    </li>
  </ul>
</template>
