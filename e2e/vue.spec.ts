import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the calculator in French by default', async ({ page }) => {
    await page.goto('/')
    // Check for French card title (h2) - Calculateur de glucides
    await expect(page.getByRole('heading', { level: 2, name: 'Calculateur de glucides' })).toBeVisible()
  })

  test.skip('should switch language when toggling to English', async ({ page }) => {
    await page.goto('/')

    // Wait for app to fully load
    await page.waitForLoadState('networkidle')

    // Click the language toggler button to open dropdown
    await page.locator('#language').click()

    // Click English in the dropdown (use text content, not role)
    await page.locator('.dropdown-menu button', { hasText: 'English' }).click()

    // Verify the card title changed to English
    await expect(page.getByRole('heading', { level: 2, name: 'Carb Calculator' })).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Use mobile viewport so the bottom nav is visible (desktop nav is hidden by lg:hidden)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    // Dismiss update dialogs by hiding them and disabling pointer events
    await page.waitForTimeout(300) // Allow dialogs to render
    await page.evaluate(() => {
      const datasetNotif = document.querySelector('[aria-label="Dataset update notification"]')
      if (datasetNotif) {
        const el = datasetNotif as HTMLElement
        el.style.display = 'none'
        el.style.pointerEvents = 'none'
      }
      const appUpdate = document.querySelector('[role="alertdialog"]')
      if (appUpdate) {
        const el = appUpdate as HTMLElement
        el.style.display = 'none'
        el.style.pointerEvents = 'none'
      }
    }).catch(() => { })

    // Navigate to Carb Factor via CTA button
    await page.getByRole('button', { name: /facteur glucidique/i }).click({ timeout: 8000 })
    await page.waitForURL(/.*\/carb-factor/, { timeout: 8000 })

    // Navigate back home via header link
    await page.getByRole('banner').getByRole('link', { name: 'Gluko' }).click()
    await page.waitForURL(/.*\/$/, { timeout: 8000 })

    // Navigate to Calculator via CTA button
    await page.getByRole('button', { name: /calculateur de glucides/i }).click()
    await page.waitForURL(/.*\/calculator/, { timeout: 8000 })

    // Navigate back home via header link
    await page.getByRole('banner').getByRole('link', { name: 'Gluko' }).click()
    await page.waitForURL(/.*\/$/, { timeout: 8000 })
  })
})
