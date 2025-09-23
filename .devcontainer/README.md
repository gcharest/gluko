# Gluko Development Container - Ultra Minimal Setup

This directory contains an ultra-minimal development container configuration for the Gluko Vue.js PWA project.

## What's Included

### Node.js Environment

- **Node.js 22 LTS** (meets Vue.js requirement: `^20.19.0 || >=22.12.0`)
- **Official Node.js Docker image** (no custom Dockerfile needed)
- **Automatic dependency installation** including Playwright browsers

### Essential VS Code Extensions (6 extensions)

- **Vue.js Core**: Volar + TypeScript Vue Plugin
- **Code Quality**: ESLint + Prettier (matches your project config)  
- **i18n Support**: i18n Ally (your project uses French/English)
- **Testing**: Playwright (for your E2E tests)

### What's NOT included (by design)

- ❌ Custom Dockerfile
- ❌ Docker Compose
- ❌ Extra development tools
- ❌ Shell customizations
- ❌ Global npm packages

## Setup Instructions

### Requirements

- [Docker](https://www.docker.com/get-started)
- [VS Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Usage Steps

1. **Open in VS Code**: `code .`
2. **Reopen in Container**: Click "Reopen in Container" when prompted
3. **Wait for setup**: Container will install dependencies and Playwright browsers
4. **Start developing**: `npm run dev`

The container will automatically:

- Pull the official Node.js 22 image
- Install all 6 essential extensions  
- Run `npm install` to set up dependencies
- Install Playwright browsers with `npx playwright install --with-deps`
- Forward port 5173 for the Vite dev server

### Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production  
npm run test:unit    # Run Vitest unit tests
npm run test:e2e     # Run Playwright e2e tests
npm run lint         # ESLint checking
npm run format       # Prettier formatting
```

## Why This Ultra-Minimal Setup?

**Single file configuration:**

- ✅ Just `devcontainer.json` - no Dockerfile or docker-compose
- ✅ Official Node.js 22 image (secure, maintained)
- ✅ Playwright installed on-demand during setup
- ✅ Zero configuration bloat

**Perfect for:**

- Vue.js PWA development
- Small teams that want simple, reproducible environments
- Projects that don't need databases or additional services
- Fast container startup and minimal maintenance

The ultra-minimal approach eliminates all unnecessary complexity while providing exactly what you need for productive Vue.js PWA development.

## Files in this directory

- **`devcontainer.json`** - Complete container configuration
- **`.vscode/settings.json`** - Essential VS Code settings
- **`README.md`** - This documentation
