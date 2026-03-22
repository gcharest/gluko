/** @type {import('vite').UserConfig} */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './package.json'), 'utf-8')
)
const rawVersion = process.env.VERSION ?? packageJson.version
const appVersion = /^[0-9a-f]{40}$/i.test(rawVersion) ? rawVersion.slice(0, 7) : rawVersion
const buildDate = process.env.BUILD_DATE ?? new Date().toISOString()
const deployDate = process.env.DEPLOY_DATE ?? buildDate

// Allow overriding the base path via env var `VITE_BASE`.
// Default to '/' for root-hosted deployments. Normalize to ensure
// it always starts and ends with a slash for consistent path joins.
const rawBase = process.env.VITE_BASE ?? '/'
function normalizeBase(b: string) {
  if (!b.startsWith('/')) b = '/' + b
  if (!b.endsWith('/')) b = b + '/'
  return b
}
const base = normalizeBase(rawBase)

export default defineConfig({
  base: base,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_DATE__: JSON.stringify(buildDate),
    __DEPLOY_DATE__: JSON.stringify(deployDate),
  },
  plugins: [
    vue(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**')
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/*.png', 'manifest.json'],
      manifest: false, // Use public/manifest.json instead of generating
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000, // 3MB limit instead of default 2MB
        // Disable precaching in dev mode to avoid warnings
        globPatterns: process.env.NODE_ENV === 'production'
          ? ['**/*.{js,css,html,woff2}']
          : [],
        globIgnores: ['**/node_modules/**/*'],
        runtimeCaching: [
          {
            // Cache app data JSON files with network-first strategy
            // Only cache requests to <base>/data/ endpoints for app-specific data
            urlPattern: new RegExp(`^${base}data/.*\\.json$`),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            // Cache images with cache-first strategy
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Cache fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true, // Enable SW in dev mode for testing
        type: 'module',
        navigateFallback: `${base}index.html`
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test': fileURLToPath(new URL('./test', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core Vue runtime — must be in the initial bundle for the app shell
          if (
            id.includes('node_modules/vue/') ||
            id.includes('node_modules/@vue/') ||
            id.includes('node_modules/vue-router/') ||
            id.includes('node_modules/pinia/')
          ) {
            return 'vendor'
          }
          // i18n — large but needed at startup; own chunk so it can be prefetched
          if (
            id.includes('node_modules/vue-i18n/') ||
            id.includes('node_modules/@intlify/')
          ) {
            return 'i18n'
          }
          // Icon library — tree-shakeable but large; separate chunk
          if (id.includes('node_modules/lucide-vue-next/')) {
            return 'icons'
          }
          // UI primitives
          if (id.includes('node_modules/reka-ui/')) {
            return 'ui'
          }
          // Search and utility helpers — only needed after dataset loads
          if (
            id.includes('node_modules/fuse.js/') ||
            id.includes('node_modules/@vueuse/')
          ) {
            return 'utilities'
          }
        }
      }
    }
  }
})
