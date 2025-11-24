# Technical Architecture

## Overview

Gluko is a **Progressive Web App (PWA)** with a **client-only architecture**. There is no backend—all data processing, state management, and persistence happen in the browser.

## Tech Stack

| Layer                  | Technology                      |
| ---------------------- | ------------------------------- |
| **UI Framework**       | Vue 3 (Composition API)         |
| **Build & Dev Server** | Vite                            |
| **Language**           | TypeScript (strict mode)        |
| **State Management**   | Pinia (stores)                  |
| **Routing**            | Vue Router                      |
| **Persistent Storage** | IndexedDB                       |
| **Testing**            | Vitest (unit), Playwright (E2E) |
| **Linting**            | ESLint                          |

## PWA Architecture

### App Shell

- Static HTML, CSS, and JS cached by Service Worker
- Renders immediately on repeat visits, even offline
- Includes app chrome (header, nav, layout)

### Data Layer

- **IndexedDB** stores the nutrient dataset and user history
- **Service Worker** caches NDJSON shards and serves them offline
- Dataset downloaded once, updated rarely (5-10 year cadence)
- Structured as **versioned records** to allow atomic dataset swaps without re-imports

### Runtime

- App starts from cached app shell
- Loads dataset from IndexedDB if available
- Full offline functionality after initial install
- No network required for daily usage

## Key Components

```text
src/
├── main.ts                 # App entry point
├── App.vue                 # Root component
├── router/                 # Vue Router configuration
├── views/                  # Page-level components
├── components/             # Reusable UI components
├── stores/                 # Pinia state (nutrient data, user history)
├── composables/            # useIndexedDB, useCalculator, etc.
├── types/                  # TypeScript interfaces
├── i18n/                   # Bilingual strings (EN/FR)
├── assets/                 # Static images, fonts
└── workers/                # Web Workers for background tasks
public/
├── manifest.json           # PWA manifest
├── service-worker.js       # Service Worker for caching
└── icons/                  # App icons for home screen
```

## Data Flow

1. **On App Start**
   - Service Worker serves cached app shell
   - Main app loads dataset version from IndexedDB
   - If dataset exists → render immediately
   - If missing → fetch and import in background (non-blocking)

2. **User Search/Calculate**
   - Query IndexedDB for foods and nutrients
   - Calculate carbs and nutrient totals in-memory
   - Store calculation in user history (IndexedDB)

3. **Data Updates**
   - Manifest file lists available dataset versions and checksums
   - App compares local vs. hosted version
   - If changed → download new shards only (not re-download unchanged shards)
   - Atomic swap: new dataset replaces old one only after all imports complete

## State Management (Pinia Stores)

| Store             | Responsibility                                |
| ----------------- | --------------------------------------------- |
| `nutrientsFile`   | Nutrient dataset (foods, measures, nutrients) |
| `mealsCalculator` | Meal ingredients and totals                   |
| `subjects`        | Multiple people being tracked (self + others) |
| `history`         | Saved meal calculations                       |

## Offline Strategy

- **App Shell**: Served from Cache API (always available)
- **Dataset**: Stored in IndexedDB (available after first sync)
- **User History**: Stored in IndexedDB (survives app updates)
- **Export/Import**: Users can manually backup history as JSON files

## Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FCP** (First Contentful Paint): < 1.8s
- **TBT** (Total Blocking Time): < 200ms
- **Full offline capability** after initial dataset load

## Security & Privacy

- No server-side data storage (user data never leaves device)
- No user accounts or authentication required
- Canadian Nutrient File data © Health Canada (licensed use)
- WCAG AA accessibility compliance required

## Related Documentation

- [Product Vision & Goals](./PRODUCT.md)
- [Release Planning](./releases/)
- [Implementation Details](./implementation/)
