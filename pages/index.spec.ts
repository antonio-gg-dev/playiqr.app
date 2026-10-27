import { expect, test } from '@playwright/test'

test('matches the home page snapshot', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect(page).toHaveScreenshot('home-page.png')
})

test('matches the vertical layout snapshots on mobile and desktop', async ({ page }) => {
  const viewports = [
    {
      name: 'mobile',
      width: 320,
      height: 600,
    },
    {
      name: 'desktop',
      width: 1280,
      height: 720,
    },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })
    await page.goto('/')
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await expect(page).toHaveScreenshot(`home-layout-${viewport.name}.png`)
  }

  await expect(page.locator('meta[name="viewport"][content*="viewport-fit=cover"]')).toHaveCount(1)
})

test('grows and scrolls when page content exceeds the viewport height', async ({ page }) => {
  await page.setViewportSize({
    width: 320,
    height: 600,
  })
  await page.goto('/')

  await page.locator('main.base-layout__content').evaluate((content) => {
    const tallContent = document.createElement('div')
    tallContent.style.height = '120vh'
    content.append(tallContent)
  })

  const layoutHeight = await page
    .locator('.base-layout__container')
    .evaluate((container) => container.getBoundingClientRect().height)
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight)

  expect(layoutHeight).toBeGreaterThan(600)
  expect(documentHeight).toBeGreaterThan(600)
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight)
  })
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})
