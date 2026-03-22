import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n/index'

// Reload automatically when a dynamically-imported chunk is missing after a new
// deployment. The old service worker may still serve the outdated index.html
// pointing to chunks that no longer exist on the server.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  window.location.reload()
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
