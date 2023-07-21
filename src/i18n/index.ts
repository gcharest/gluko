import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'

const i18n = createI18n({
  locale: (import.meta.env.VITE_DEFAULT_LOCALE as string) || 'fr',
  fallbackLocale: (import.meta.env.VITE_FALLBACK_LOCALE as string) || 'en',
  legacy: false,
  messages: { en, fr }
})

export default i18n
