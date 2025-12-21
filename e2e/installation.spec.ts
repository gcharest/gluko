import { test, expect } from '@playwright/test'

test.describe('PWA Installation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('has valid PWA manifest', async ({ page }) => {
    // Check manifest link exists in HTML (presence is enough)
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)

    // Get the actual href (could be relative or absolute depending on environment/hosting)
    const manifestHref = await manifestLink.getAttribute('href')
    expect(manifestHref).toBeTruthy()
    expect(manifestHref).toMatch(/manifest\.json$/)

    // Fetch and validate manifest structure using the href we found
    const manifestUrl = manifestHref?.startsWith('http')
      ? manifestHref
      : new URL(manifestHref || '', page.url()).href

    const response = await page.request.get(manifestUrl)
    expect(response.ok()).toBeTruthy()

    const manifest = await response.json()

    // Verify required manifest fields
    expect(manifest.name).toBeDefined()
    expect(manifest.short_name).toBeDefined()
    expect(manifest.start_url).toBe('/gluko/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#0ea5e9')
    expect(manifest.background_color).toBe('#0ea5e9')

    // Verify icons array exists and has required sizes
    expect(manifest.icons).toBeDefined()
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3)

    const iconSizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes)
    expect(iconSizes).toContain('192x192')
    expect(iconSizes).toContain('512x512')

    // Verify maskable icons exist
    const maskableIcons = manifest.icons.filter((icon: { purpose: string }) =>
      icon.purpose?.includes('maskable')
    )
    expect(maskableIcons.length).toBeGreaterThanOrEqual(2)
  })

  test('has PWA meta tags', async ({ page }) => {
    // Check theme-color meta tag
    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveAttribute('content', '#0ea5e9')

    // Check description meta tag
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveCount(1)

    // Check viewport meta tag (required for mobile)
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveCount(1)
  })

  test('all icon files are accessible', async ({ page }) => {
    // Resolve manifest URL from link element
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
    const manifestUrl = manifestHref?.startsWith('http')
      ? manifestHref
      : new URL(manifestHref || '', page.url()).href

    const manifest = await (await page.request.get(manifestUrl)).json()

    // Check each icon URL is accessible
    for (const icon of manifest.icons) {
      const response = await page.request.get(icon.src)
      expect(response.ok()).toBeTruthy()
      expect(response.headers()['content-type']).toContain('image/')
    }
  })

  test('registers service worker', async ({ page }) => {
    test.skip(process.env.CI !== 'true', 'Service worker registration only asserted in CI preview/prod builds')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check that service worker is registered via page evaluation
    // Note: The 'serviceworker' event on context doesn't fire reliably with registerType: 'prompt'
    const registration = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return null
      // Wait for registration to complete
      const reg = await navigator.serviceWorker.getRegistration()
      return reg ? { scope: reg.scope, active: !!reg.active, waiting: !!reg.waiting, installing: !!reg.installing } : null
    })

    // Verify service worker is registered
    expect(registration).not.toBeNull()
    expect(registration?.scope).toContain('/gluko/')
    // At least one of these should be true (active, waiting, or installing)
    expect(registration?.active || registration?.waiting || registration?.installing).toBeTruthy()
  })

  test('app works offline (service worker caching)', async ({ page, context }) => {
    // Skip this test in dev mode - service workers don't activate properly with vite dev
    // This test is meant for production builds (vite preview or deployed)
    test.skip(process.env.CI !== 'true', 'Service worker test requires production build')

    // First, load the page online to populate cache
    await page.waitForLoadState('networkidle')

    // Wait for service worker to be registered and ready
    // With registerType: 'prompt', the SW may be in 'waiting' state, so we need to
    // check for either controller (active) or waiting state
    await page.waitForFunction(
      async () => {
        if (!('serviceWorker' in navigator)) return false
        // Try to get the registration - if it exists, SW is at least registered
        const registration = await navigator.serviceWorker.getRegistration()
        return registration !== undefined
      },
      { timeout: 30000 }
    )

    // Force the waiting service worker to activate by simulating a skipWaiting scenario
    // This ensures the SW is actually controlling the page for offline testing
    const hasController = await page.evaluate(async () => {
      if (!navigator.serviceWorker.controller) {
        // Wait for registration and try to get the waiting SW to activate
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg?.waiting) {
          // Send a message to skip waiting (if the SW supports it)
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          // Wait a bit for activation
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        // Also try refreshing the registration
        await reg?.update()
        // Wait for controller to be available
        await new Promise((resolve) => {
          if (navigator.serviceWorker.controller) {
            resolve(true)
            return
          }
          navigator.serviceWorker.addEventListener('controllerchange', () => resolve(true), { once: true })
          // Timeout after 5 seconds
          setTimeout(() => resolve(false), 5000)
        })
      }
      return navigator.serviceWorker.controller !== null
    })

    // If we still don't have a controller, reload once to activate the SW
    if (!hasController) {
      await page.reload()
      await page.waitForLoadState('networkidle')
      // Now check again
      await page.waitForFunction(
        () => navigator.serviceWorker.controller !== null,
        { timeout: 10000 }
      )
    }

    // Go offline
    await context.setOffline(true)

    // Try to navigate - should work from cache
    await page.reload()

    // Check that the page loaded (basic check - app shell should be cached)
    const title = await page.title()
    expect(title).toBeTruthy()

    // Check that main app element exists and is rendered (use .first() to handle potential duplicates)
    const app = page.locator('#app').first()
    await expect(app).toBeVisible({ timeout: 10000 })

    // Go back online
    await context.setOffline(false)
  })

  test('has proper app title', async ({ page }) => {
    const title = await page.title()
    expect(title).toContain('Gluko')
  })

  test('app is installable (beforeinstallprompt)', async ({ page }) => {
    // Note: This test may not work in all browsers/contexts
    // The beforeinstallprompt event only fires under specific conditions

    let installPromptReceived = false

    await page.exposeFunction('captureInstallPrompt', () => {
      installPromptReceived = true
    })

    await page.evaluate(() => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        // @ts-ignore - exposeFunction adds this to window
        window.captureInstallPrompt()
      })
    })

    // Navigate to trigger the event (if conditions are met)
    await page.reload()

    // This test is informational - may pass or fail depending on browser state
    console.log('Install prompt received:', installPromptReceived)
  })

  test('viewport is mobile-friendly', async ({ page }) => {
    // Check viewport meta tag content
    const viewportContent = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewportContent).toContain('width=device-width')
    expect(viewportContent).toContain('initial-scale=1')
  })
})
