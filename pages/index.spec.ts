import { expect, test } from '@playwright/test'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'

for (const language of Object.values(Language)) {
  for (const theme of [
    ThemeMode.Light,
    ThemeMode.Dark,
  ]) {
    for (const width of [
      360,
      1280,
    ]) {
      test(`home ${language} ${theme} at ${width.toString()}px`, async ({ page }) => {
        await page.setViewportSize({
          width,
          height: width === 360 ? 720 : 900,
        })
        await page.addInitScript(
          ({ language, theme, key }) => {
            localStorage.setItem(
              key,
              JSON.stringify({
                theme,
                language,
              }),
            )
          },
          {
            language,
            theme,
            key: Preferences.STORAGE_KEY,
          },
        )

        await page.goto('/')
        await page.locator(`html[lang="${language}"][data-theme="${theme}"]`).waitFor({ state: 'attached' })
        await page.locator('main').waitFor({ state: 'visible' })
        await page.evaluate(async () => {
          await document.fonts.ready
        })

        await expect(page).toHaveScreenshot(`home-${language}-${theme}-${width.toString()}.png`)
      })
    }
  }
}
