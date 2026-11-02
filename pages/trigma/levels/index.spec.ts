import { expect, test } from '@playwright/test'
import { Language } from '@/lib/Shared/Preferences/Language'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'

test('shows five difficulty groups with all one hundred levels available', async ({ page }) => {
  await page.goto('/trigma/levels')

  await expect(page.locator('section[data-difficulty]')).toHaveCount(5)
  await expect(page.locator('a[href^="/trigma/levels/"]')).toHaveCount(100)

  for (const difficulty of [
    'initiate',
    'apprentice',
    'adept',
    'master',
    'virtuoso',
  ]) {
    await expect(page.locator(`section[data-difficulty="${difficulty}"] a`)).toHaveCount(20)
    await expect(page.locator(`section[data-difficulty="${difficulty}"] [role="progressbar"]`)).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  }
})

test('scrolls to the first difficulty with pending levels once and keeps links keyboard operable', async ({ page }) => {
  await page.setViewportSize({
    width: 360,
    height: 600,
  })
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify(Array.from({ length: 20 }, (_, index) => index + 1)))
  }, CampaignProgress.STORAGE_KEY)
  await page.goto('/trigma/levels')
  await page.locator('section[data-difficulty="apprentice"]').waitFor({ state: 'visible' })
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            resolve()
          }),
        ),
      ),
  )

  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  const firstLevel = page.getByRole('link', { name: 'Level 1, completed' })

  await page.getByRole('link', { name: 'Back to menu' }).focus()
  await page.keyboard.press('Tab')
  await expect(firstLevel).toBeFocused()
})

for (const width of [
  360,
  1280,
]) {
  const viewport = width === 360 ? 'mobile' : 'desktop'

  test(`level list ${viewport}`, async ({ page }) => {
    await page.setViewportSize({
      width,
      height: width === 360 ? 720 : 900,
    })
    await page.addInitScript(
      ({ language, theme, preferencesKey, progressKey }) => {
        localStorage.setItem(
          preferencesKey,
          JSON.stringify({
            theme,
            language,
          }),
        )
        localStorage.setItem(
          progressKey,
          JSON.stringify([
            1,
            2,
            21,
            41,
            61,
            81,
          ]),
        )
      },
      {
        language: Language.English,
        theme: ThemeMode.Light,
        preferencesKey: Preferences.STORAGE_KEY,
        progressKey: CampaignProgress.STORAGE_KEY,
      },
    )
    await page.goto('/trigma/levels')
    await page
      .locator(`html[lang="${Language.English}"][data-theme="${ThemeMode.Light}"]`)
      .waitFor({ state: 'attached' })
    await page.locator('main').waitFor({ state: 'visible' })
    await page.evaluate(async () => {
      await document.fonts.ready
    })

    await expect(page).toHaveScreenshot(`levels-${viewport}.png`, { fullPage: true })
  })
}
