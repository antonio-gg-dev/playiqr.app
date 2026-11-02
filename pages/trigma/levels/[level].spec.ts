import { expect, test } from '@playwright/test'
import { Language } from '@/lib/Shared/Preferences/Language'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'

test('shows the catalog board on direct load and after reloading the level URL', async ({ page }) => {
  await page.goto('/trigma/levels/1')

  const board = page.getByRole('img', { name: /Trigma board\. Blockers:/ })

  await expect(board.locator('polygon')).toHaveCount(36)
  await expect(board.locator('.trigma-board__cell--blocked')).toHaveCount(4)

  const blockedCellIds = await board
    .locator('.trigma-board__cell--blocked')
    .evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-cell-id')))

  await page.reload()

  await expect(
    page.getByRole('img', { name: /Trigma board\. Blockers:/ }).locator('.trigma-board__cell--blocked'),
  ).toHaveCount(4)
  expect(
    await page
      .getByRole('img', { name: /Trigma board\. Blockers:/ })
      .locator('.trigma-board__cell--blocked')
      .evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-cell-id'))),
  ).toEqual(blockedCellIds)
})

test('persists reversible completion and exposes the 20-to-21 next-level destination', async ({ page }) => {
  await page.goto('/trigma/levels/20')

  const completion = page.getByRole('button', { name: 'Complete' })

  await completion.click()

  const completed = page.getByRole('button', { name: 'Completed' })

  await expect(completed).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('link', { name: 'Next challenge' })).toHaveAttribute('href', '/trigma/levels/21')
  expect(await page.evaluate((key) => localStorage.getItem(key), CampaignProgress.STORAGE_KEY)).toBe('[20]')

  await page.reload()

  await expect(page.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Completed' }).click()

  await expect(page.getByRole('button', { name: 'Complete' })).toHaveAttribute('aria-pressed', 'false')
  expect(await page.evaluate((key) => localStorage.getItem(key), CampaignProgress.STORAGE_KEY)).toBe('[]')
})

test('does not offer a next level after completing level 100', async ({ page }) => {
  await page.goto('/trigma/levels/100')
  await page.getByRole('button', { name: 'Complete' }).click()

  await expect(page.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('link', { name: 'Next challenge' })).toHaveCount(0)
})

test('uses the VitePress not-found page for invalid campaign routes', async ({ page }) => {
  for (const level of [
    '0',
    '101',
    'invalid',
  ]) {
    await page.goto(`/trigma/levels/${level}`)

    await expect(page.getByText('404 Page Not Found')).toHaveCount(1)
    await expect(page.locator('svg.trigma-board')).toHaveCount(0)
  }
})

for (const width of [
  360,
  1280,
]) {
  const viewport = width === 360 ? 'mobile' : 'desktop'

  test(`level detail ${viewport}`, async ({ page }) => {
    await page.setViewportSize({
      width,
      height: width === 360 ? 720 : 900,
    })
    await page.addInitScript(
      ({ key, language, theme }) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            theme,
            language,
          }),
        )
      },
      {
        key: Preferences.STORAGE_KEY,
        language: Language.English,
        theme: ThemeMode.Light,
      },
    )
    await page.goto('/trigma/levels/1')
    await page
      .locator(`html[lang="${Language.English}"][data-theme="${ThemeMode.Light}"]`)
      .waitFor({ state: 'attached' })
    await page.locator('main').waitFor({ state: 'visible' })
    await page.evaluate(async () => {
      await document.fonts.ready
    })

    await expect(page).toHaveScreenshot(`level-${viewport}.png`)
  })
}

test('completed level respects reduced motion', async ({ page }) => {
  await page.setViewportSize({
    width: 1280,
    height: 900,
  })
  await page.addInitScript(
    ({ key, language, theme }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          theme,
          language,
        }),
      )
    },
    {
      key: Preferences.STORAGE_KEY,
      language: Language.English,
      theme: ThemeMode.Light,
    },
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/trigma/levels/20')
  await page.getByRole('button', { name: 'Complete' }).click()
  await page.locator('main').waitFor({ state: 'visible' })
  await page.evaluate(async () => {
    await document.fonts.ready
  })

  await expect(page).toHaveScreenshot('level-completed-reduced-motion.png')
})
