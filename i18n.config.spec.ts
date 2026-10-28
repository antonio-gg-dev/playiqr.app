import { createLocalization } from '@/i18n.config'
import { Language } from '@/lib/Shared/Preferences/Language'

it('translates accessible labels and interpolates domain values in both languages', () => {
  const i18n = createLocalization()

  expect(i18n.global.t('returnToMenu')).toBe('Back to menu')
  expect(i18n.global.t('invalidBlockers', { lastCellId: 35 })).toContain('0 to 35')

  i18n.global.locale.value = Language.Spanish

  expect(i18n.global.t('returnToMenu')).toBe('Volver al menú')
  expect(i18n.global.t('invalidBlockers', { lastCellId: 35 })).toContain('0 al 35')

  i18n.dispose()
})

it('isolates application locales and falls back to English for missing translations', () => {
  const first = createLocalization()
  const second = createLocalization()

  first.global.locale.value = Language.Spanish

  expect(second.global.locale.value).toBe(Language.English)

  const spanish = { ...first.global.getLocaleMessage(Language.Spanish) }

  Reflect.deleteProperty(spanish, 'returnToMenu')

  first.global.setLocaleMessage(Language.Spanish, spanish)

  expect(first.global.t('returnToMenu')).toBe('Back to menu')

  first.dispose()
  second.dispose()
})
