import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import vue from '@vitejs/plugin-vue'

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './package.json'), 'utf-8')
)

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
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
      '**/scripts/**/test/**'
    ],
    root: fileURLToPath(new URL('./', import.meta.url)),
    setupFiles: ['./src/components/__tests__/unit.setup.ts', './test/mocks/useIndexedDB.mock.ts'],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/stores/**/*.ts',
        'src/composables/**/*.ts'
      ],
      exclude: [
        'src/composables/useIndexedDB.ts',
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
        'scripts/**'
      ],
      thresholds: {
        lines: 75,
        functions: 90,
        branches: 65,
        statements: 75
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test': fileURLToPath(new URL('./test', import.meta.url))
    }
  }
})
