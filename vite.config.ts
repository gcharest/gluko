/** @type {import('vite').UserConfig} */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/gluko/',
  plugins: [
    vue(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
      runtimeOnly: false,
      compositionOnly: true,
      fullInstall: true
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo.svg'],
      manifest: {
        name: 'Gluko - Diabetes Carb Calculator',
        short_name: 'Gluko',
        description: 'Diabetes meal planning and carbohydrate counting application',
        theme_color: '#0d6efd',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/gluko/',
        start_url: '/gluko/',
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000, // 10MB to handle the JSON files
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Externalize webpack and any node-specific modules that shouldn't be bundled
        return id === 'webpack' || id.startsWith('node:')
      },
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          bootstrap: ['bootstrap'],
          utilities: ['@vueuse/core', 'fuse.js']
        }
      }
    },
    // Optimize assets
    assetsInlineLimit: 4096,
    // Enable compression
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
