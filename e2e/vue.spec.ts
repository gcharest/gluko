import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the calculator in French by default', async ({ page }) => {
    await page.goto('/')
    // Use a more specific selector that only targets the main content heading
    await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(
      'Calculateur de glucides'
    )
  })

  test('should switch language when toggling to English', async ({ page }) => {
    await page.goto('/')

    // Click the language toggler component first
    const languageToggler = page.locator('#language-toggler')
    await languageToggler.waitFor({ state: 'visible' })
    await languageToggler.click()

    // Now click the English option in the dropdown
    const englishOption = page.getByRole('button', { name: 'English' })
    await englishOption.waitFor({ state: 'visible' })
    await englishOption.click()

    // Verify the title has changed to English
    await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText('Carbs Counter')
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
