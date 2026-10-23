import { expect, test } from '@playwright/test'

test('displays the site title', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'IQR' })).toBeVisible()
  await expect(page).toHaveScreenshot('home-page.png')
})
