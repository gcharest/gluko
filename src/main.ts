import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "@/router";
import { store } from "@/store/index";
// import "bootstrap";
// import "marked";
// import "bootstrap/dist/css/bootstrap.css";
import en from "@/locale/en-ca.json";
import fr from "@/locale/fr-ca.json";

const i18n = createI18n({
  locale: "fr-CA",
  fallbackLocale: "fr-CA",
  messages: {
    "en-CA": en,
    "fr-CA": fr
  }
});

createApp(App)
  .use(store)
  .use(router)
  .use(i18n)
  .mount("#app");
