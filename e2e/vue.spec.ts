import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the calculator in French by default', async ({ page }) => {
    await page.goto('/')
    // Check for French card title (h2) - Calculateur de glucides
    await expect(page.getByRole('heading', { level: 2, name: 'Calculateur de glucides' })).toBeVisible()
  })

  test('should switch language when toggling to English', async ({ page }) => {
    await page.goto('/')

    // Wait for app to fully load
    await page.waitForLoadState('networkidle')

    // Click the language toggler component first
    const languageToggler = page.locator('#language-toggler')
    await languageToggler.waitFor({ state: 'visible', timeout: 10000 })
    await languageToggler.click()

    // Now click the English option in the dropdown
    const englishOption = page.getByRole('button', { name: 'English' })
    await englishOption.waitFor({ state: 'visible' })
    await englishOption.click()

    // Verify the card title changed to English (h2 level heading)
    await expect(page.getByRole('heading', { level: 2, name: 'Carb Calculator' })).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Check that all main navigation links are present
    const nav = page.locator('nav[aria-label="Navigation principale"]')
    await expect(nav).toBeVisible()
    await expect(nav).toContainText('Gluko')
    await expect(nav).toContainText('Facteur glucidique')
    await expect(nav).toContainText('À propos')

    // Test navigation to Carb Factor page
    await page.getByRole('link', { name: 'Facteur glucidique' }).click()
    await expect(page).toHaveURL(/.*\/carb-factor/)

    // Test navigation to About page
    await page.getByRole('link', { name: 'À propos' }).click()
    await expect(page).toHaveURL(/.*\/about/)

    // Test navigation back to home
    await page.getByRole('link', { name: 'Gluko' }).click()
    await expect(page).toHaveURL(/.*\/$/)
  })
})
