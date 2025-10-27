// Vitest config for ESM scripts folder — keep config local so tests run only
// when invoked from inside `scripts`.
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default {
  test: {
    globals: true,
    environment: 'node',
    root,
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.mjs', 'test/**/*.spec.mjs'],
    exclude: ['**/node_modules/**', '**/dist/**']
  }
}
