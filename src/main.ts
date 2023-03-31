import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import App from "./App.vue";
import router from "./router";

import en from "./locales/en/translations.json";
import fr from "./locales/fr/translations.json";
import { useNutrientFileStore } from "./stores/nutrientsFile";
import dataset from "@/components/data/canadian_nutrient_file.json";

const i18n = createI18n({
  messages: {
    en: en,
    fr: fr,
  },
  locale: "fr",
  fallbackLocale: "fr",
  fallbackWarn: false,
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount("#app");

const store = useNutrientFileStore();
store.$state.nutrientsFile = dataset;
