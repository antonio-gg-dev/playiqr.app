import { expect, test } from '@playwright/test'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'

test('changes and persists global preferences without changing the options URL', async ({ page }) => {
  await page.goto('/trigma/options')

  await page.getByRole('combobox', { name: 'Theme' }).click()
  await page.getByRole('option', { name: 'Dark' }).click()
  await page.getByRole('combobox', { name: 'Language' }).click()
  await page.getByRole('option', { name: 'Español' }).click()

  await expect(page).toHaveURL(/\/trigma\/options$/)
  await expect(page.locator('html')).toHaveAttribute('lang', Language.Spanish)
  expect(await page.evaluate((key) => localStorage.getItem(key), Preferences.STORAGE_KEY)).toBe(
    JSON.stringify({
      theme: ThemeMode.Dark,
      language: Language.Spanish,
    }),
  )

  await page.reload()

  await expect(page.locator('select#theme')).toHaveValue(ThemeMode.Dark)
  await expect(page.locator('select#language')).toHaveValue(Language.Spanish)
})

test('follows live system appearance only while automatic is selected', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })

  await page.goto('/trigma/options')

  await expect(page.locator('select#theme')).toHaveValue(ThemeMode.Auto)

  await page.evaluate(async () => {
    await document.fonts.ready
  })

  await expect(page).toHaveScreenshot('automatic-light.png')

  await page.emulateMedia({ colorScheme: 'dark' })

  await expect(page).toHaveScreenshot('automatic-dark.png')

  await page.getByRole('combobox', { name: 'Theme' }).click()
  await page.getByRole('option', { name: 'Light' }).click()

  await expect(page).toHaveScreenshot('manual-light.png')

  await page.emulateMedia({ colorScheme: 'light' })
  await page.emulateMedia({ colorScheme: 'dark' })

  await expect(page).toHaveScreenshot('manual-light.png')

  await page.getByRole('combobox', { name: 'Theme' }).click()

  await expect(page).toHaveScreenshot('theme-dropdown-open.png')
})

test('shows mouse hover feedback on the theme trigger and options', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })

  await page.goto('/trigma/options')

  const trigger = page.getByRole('combobox', { name: 'Theme' })

  await trigger.waitFor({ state: 'visible' })
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await trigger.hover()

  await expect(page).toHaveScreenshot('theme-trigger-hover-dark.png')

  await trigger.click()
  await page.getByRole('option', { name: 'Light' }).hover()

  await expect(page).toHaveScreenshot('theme-option-hover-dark.png')
})

test('detects the browser language and falls back to English', async ({ browser }) => {
  for (const [
    locale,
    language,
  ] of [
    [
      'es-MX',
      Language.Spanish,
    ],
    [
      'en-GB',
      Language.English,
    ],
    [
      'fr-FR',
      Language.English,
    ],
  ] as const) {
    const context = await browser.newContext({ locale })
    const page = await context.newPage()

    await page.goto('/trigma/options')

    await expect(page.locator('html')).toHaveAttribute('lang', language)
    await expect(page.locator('select#language')).toHaveValue(language)

    await context.close()
  }
})

for (const language of Object.values(Language)) {
  for (const theme of [
    ThemeMode.Light,
    ThemeMode.Dark,
  ]) {
    for (const width of [
      360,
      1280,
    ]) {
      test(`options ${language} ${theme} at ${width.toString()}px`, async ({ page }) => {
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

        await page.goto('/trigma/options')
        await page.locator(`html[lang="${language}"][data-theme="${theme}"]`).waitFor({ state: 'attached' })
        await page.locator('main').waitFor({ state: 'visible' })
        await page.evaluate(async () => {
          await document.fonts.ready
        })

        await expect(page).toHaveScreenshot(`options-${language}-${theme}-${width.toString()}.png`)
      })
    }
  }
}
