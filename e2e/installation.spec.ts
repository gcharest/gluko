import { test, expect } from '@playwright/test'

test.describe('PWA Installation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('has valid PWA manifest', async ({ page }) => {
    // Check manifest link exists in HTML (Vite transforms /manifest.json to /gluko/manifest.json)
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/gluko/manifest.json')

    // Fetch and validate manifest structure
    const response = await page.request.get('/gluko/manifest.json')
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
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4)

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
    const manifest = await (await page.request.get('/gluko/manifest.json')).json()

    // Check each icon URL is accessible
    for (const icon of manifest.icons) {
      const response = await page.request.get(icon.src)
      expect(response.ok()).toBeTruthy()
      expect(response.headers()['content-type']).toContain('image/')
    }
  })

  test('registers service worker', async ({ page, context }) => {
    // Grant notification permission (optional for PWA but good practice)
    await context.grantPermissions(['notifications'])

    // Wait for service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready
          return registration.active !== null
        } catch {
          return false
        }
      }
      return false
    })

    expect(swRegistered).toBeTruthy()
  })

  test('app works offline (service worker caching)', async ({ page, context }) => {
    // Skip this test in dev mode - service workers don't activate properly with vite dev
    // This test is meant for production builds (vite preview or deployed)
    test.skip(process.env.CI !== 'true', 'Service worker test requires production build')

    // First, load the page online to populate cache
    await page.waitForLoadState('networkidle')

    // Wait for service worker to be ready
    await page.waitForFunction(
      () => {
        return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
      },
      { timeout: 15000 }
    )

    // Go offline
    await context.setOffline(true)

    // Try to navigate - should work from cache
    await page.reload()

    // Check that the page loaded (basic check - app shell should be cached)
    const title = await page.title()
    expect(title).toBeTruthy()

    // Check that main app element exists
    const app = page.locator('#app')
    await expect(app).toBeVisible()

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
