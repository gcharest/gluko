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
const appVersion = packageJson.version
const buildDate = new Date().toISOString()

// https://vitejs.dev/config/
export default defineConfig({
  base: '/gluko/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_DATE__: JSON.stringify(buildDate),
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
            // Only cache requests to /data/ endpoints for app-specific data
            urlPattern: ({ url }) => url.pathname.startsWith('/gluko/data/') && url.pathname.endsWith('.json'),
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
            urlPattern: ({ url }) => /\.(png|jpg|jpeg|svg|gif|webp)$/.test(url.pathname),
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
        navigateFallback: 'index.html'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test': fileURLToPath(new URL('./test', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress Bootstrap deprecation warnings for Sass built-in functions
        // These are Bootstrap's responsibility to fix, not ours
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions']
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          bootstrap: ['bootstrap'],
          utilities: ['@vueuse/core', 'fuse.js']
        }
      }
    }
  }
})
