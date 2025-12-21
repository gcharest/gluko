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

  test('registers service worker', async ({ context }) => {
    test.skip(process.env.CI !== 'true', 'Service worker registration only asserted in CI preview/prod builds')

    // Grant notification permission (optional for PWA but good practice)
    await context.grantPermissions(['notifications'])

    // Wait for service worker registration via browser context (more stable than page.evaluate)
    const sw = await context.waitForEvent('serviceworker', { timeout: 20000 })
    expect(sw.url()).toContain('sw.js')
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
      { timeout: 30000 }
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
