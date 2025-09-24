import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('Home page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Calculator page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/calculator')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Carb Factor page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/carb-factor')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('History page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/history')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('About page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/about')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})

// Extended tests for common interactive components
test.describe('Component-specific Accessibility Tests', () => {
  test('Navigation menu should be keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Check if the skip link is the first focusable element
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.id)
    expect(focusedElement).toBe('skip-to-content')

    // Check if the main navigation is accessible
    const nav = await page.getByRole('navigation', { name: 'Main navigation' })
    expect(await nav.isVisible()).toBeTruthy()

    // Check for ARIA labels in navigation
    const menuButton = await page.getByRole('button', { name: 'Toggle navigation' })
    expect(await menuButton.getAttribute('aria-expanded')).toBe('false')
  })

  test('Language toggler should be properly labeled', async ({ page }) => {
    await page.goto('/')
    const languageToggler = await page.getByRole('button', { name: /Change Language|Changer la langue/ })
    expect(await languageToggler.isVisible()).toBeTruthy()
  })

  test('Theme toggler should be properly labeled', async ({ page }) => {
    await page.goto('/')
    const themeToggler = await page.getByRole('button', { name: /Toggle theme|Changer le thème/ })
    expect(await themeToggler.isVisible()).toBeTruthy()
  })

  test('Calculator form controls should be properly labeled', async ({ page }) => {
    await page.goto('/calculator')

    // Check if nutrient inputs are properly labeled
    const nutrientInputs = await page.getByRole('textbox')
    for (const input of await nutrientInputs.all()) {
      const label = await input.evaluate(el => {
        const id = el.id
        return id ? document.querySelector(`label[for="${id}"]`)?.textContent : null
      })
      expect(label).toBeTruthy()
    }
  })
})