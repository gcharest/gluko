import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import en from "../locales/en/translations.json";
import fr from "../locales/fr/translations.json";

import App from "./App.vue";
import router from "./router";

const i18n = createI18n({
  messages: {
    en: en,
    fr: fr,
  },
  locale: "fr",
  fallbackLocale: "fr",
  resolveWithKeyValue: true,
  fallbackWarn: false,
  globalInjection: true,
});
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(i18n);

app.mount("#app");
