import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify('test-version'),
    __BUILD_DATE__: JSON.stringify('2025-01-01'),
  },
  test: {
    // enable jest-like global test APIs
    globals: true,
    // simulate DOM with happy-dom
    environment: 'happy-dom',
    // Exclude helper script packages and their test folders so running
    // vitest from the repository root does not pick up ETL/test helpers.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      'src/**/__tests__/unit.setup.ts',
      '**/scripts/**',
      '**/scripts-esm/**',
      '**/scripts-esm/**/test/**',
      '**/scripts/**/test/**'
    ],
    root: fileURLToPath(new URL('./', import.meta.url)),
    setupFiles: ['./src/components/__tests__/unit.setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        'src/assets/**',
        // don't try to collect coverage from standalone script packages
        'scripts/**',
        'scripts-esm/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
