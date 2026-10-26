import { expect, test } from '@playwright/test'

test('displays the site title', async ({ page }) => {
  await page.goto('/')

  const heading = page.getByRole('heading', { name: 'IQR' })
  await expect(heading).toBeVisible()

  const typography = await page.evaluate(async () => {
    const [
      atkinson,
      lexend,
    ] = await Promise.all([
      document.fonts.load('400 16px "Atkinson Hyperlegible Next Variable"', 'IQR'),
      document.fonts.load('400 16px "Lexend Variable"', 'IQR'),
    ])

    const title = document.querySelector('h1')

    return {
      bodyFontFamily: getComputedStyle(document.body).fontFamily,
      headingFontFamily: title ? getComputedStyle(title).fontFamily : '',
      atkinsonLoaded: atkinson.length > 0,
      lexendLoaded: lexend.length > 0,
    }
  })

  expect(typography.bodyFontFamily).toContain('Atkinson Hyperlegible Next Variable')
  expect(typography.headingFontFamily).toContain('Lexend Variable')
  expect(typography.atkinsonLoaded).toBe(true)
  expect(typography.lexendLoaded).toBe(true)
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect(page).toHaveScreenshot('home-page.png')
})
