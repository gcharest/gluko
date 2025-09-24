import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('Home page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto('/gluko/', { waitUntil: 'networkidle' })
    await page.waitForSelector('main', { state: 'visible' })
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Calculator page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    // Use the configured base URL and wait for navigation
    await page.goto('/gluko/calculator', { waitUntil: 'networkidle' })
    // Add a small wait to ensure dynamic content is loaded
    await page.waitForSelector('main', { state: 'visible' })
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Carb Factor page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto('/gluko/carb-factor', { waitUntil: 'networkidle' })
    await page.waitForSelector('main', { state: 'visible' })
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('History page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto('/gluko/history', { waitUntil: 'networkidle' })
    await page.waitForSelector('main', { state: 'visible' })
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('About page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto('/gluko/about', { waitUntil: 'networkidle' })
    await page.waitForSelector('main', { state: 'visible' })
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})

// Extended tests for common interactive components
test.describe('Component-specific Accessibility Tests', () => {
  test('Navigation menu should be keyboard accessible', async ({ page }) => {
    // Set mobile viewport to ensure navigation button is visible
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12 dimensions
    await page.goto('/gluko/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Check if the skip link is the first focusable element
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.id)
    expect(focusedElement).toBe('skip-to-content')

    // Check if the main navigation is accessible
    const nav = await page.getByRole('navigation', { name: /Main navigation|Navigation principale/ })
    expect(await nav.isVisible()).toBeTruthy()

    // Check for ARIA labels in navigation
    await page.waitForSelector('button.navbar-toggler', { state: 'visible' })
    const menuButton = await page.getByRole('button', { name: /Toggle navigation|Basculer la navigation/ })
    await expect(menuButton).toBeVisible()

    // Test initial state
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    // Test toggling the menu
    await menuButton.click()

    // Wait for Bootstrap's show event to complete
    await page.waitForFunction(() => {
      const button = document.querySelector('[data-bs-toggle="offcanvas"]')
      return button?.getAttribute('aria-expanded') === 'true'
    }, { timeout: 2000 })

    await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('Language toggler should be properly labeled', async ({ page }) => {
    await page.goto('/gluko/', { waitUntil: 'networkidle' })
    const languageToggler = await page.getByRole('button', {
      name: /Change Language|Changer la langue/
    })
    expect(await languageToggler.isVisible()).toBeTruthy()
  })

  test('Theme toggler should be properly labeled', async ({ page }) => {
    await page.goto('/gluko/', { waitUntil: 'networkidle' })
    const themeToggler = await page.getByRole('button', { name: /Toggle theme|Changer le thème/ })
    expect(await themeToggler.isVisible()).toBeTruthy()
  })

  test('Calculator form controls should be properly labeled', async ({ page }) => {
    await page.goto('/gluko/calculator', { waitUntil: 'networkidle' })

    // Check if nutrient inputs are properly labeled
    const nutrientInputs = await page.getByRole('textbox')
    for (const input of await nutrientInputs.all()) {
      const label = await input.evaluate((el) => {
        const id = el.id
        return id ? document.querySelector(`label[for="${id}"]`)?.textContent : null
      })
      expect(label).toBeTruthy()
    }
  })
})
