import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "@/router";
import { store } from "@/store/index";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const i18n = createI18n({});

createApp(App)
  .use(store)
  .use(router)
  .use(i18n)
  .mount("#app");
