#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'

// Compute git short sha safely
async function getGitSha() {
  return new Promise((resolve) => {
    const git = spawn('git', ['rev-parse', '--short', 'HEAD'], {
      stdio: ['ignore', 'pipe', 'inherit']
    })
    let out = ''
    git.stdout.on('data', (chunk) => (out += chunk.toString()))
    git.on('close', () => resolve(out.trim() || 'dev'))
    git.on('error', () => resolve('dev'))
  })
}

function isoNow() {
  return new Date().toISOString()
}

async function main() {
  const sha = await getGitSha()
  const date = isoNow()

  // Sanitize SHA: accept only 6-12 hex chars, fallback to 'dev'
  const shaSanitized = (sha && (sha.match(/[0-9a-fA-F]{6,12}/) || [])[0]) || 'dev'

  // Build minimal env for the child process to avoid leaking secrets
  const childEnv = {
    // PATH is commonly required so keep it; limit other variables
    PATH: process.env.PATH || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    VERSION: shaSanitized,
    BUILD_DATE: date
  }

  // Determine command — prefer local node_modules vite binary if present
  const projectRoot = dirname(fileURLToPath(import.meta.url))
  const viteLocal = resolve(projectRoot, '..', 'node_modules', '.bin', 'vite')

  // If local vite binary doesn't exist, fail fast and ask to install deps
  if (!existsSync(viteLocal)) {
    console.error('\nLocal vite binary not found at', viteLocal)
    console.error('Please run `npm ci` or `npm install` to install devDependencies and try again.')
    process.exit(1)
  }

  // Use local vite binary without shell when possible
  const child = spawn(viteLocal, [], { env: childEnv, stdio: 'inherit', shell: false })
  child.on('close', (code) => process.exit(code ?? 0))
  child.on('error', (err) => {
    console.error('Failed to start vite:', err)
    process.exit(1)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
