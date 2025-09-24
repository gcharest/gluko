import { test } from '@playwright/test'

test('verify playwright installation', async ({ page }) => {
  // Try to navigate to a simple page
  await page.goto('https://example.com')
  console.log('Successfully loaded a page')
})
