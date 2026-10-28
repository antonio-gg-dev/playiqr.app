import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

const media = Object.assign(new EventTarget(), { matches: false })

beforeEach(() => {
  localStorage.clear()
  media.matches = false
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('starts with automatic appearance and English before browser initialization', () => {
  const preferences = new Preferences()

  expect(preferences.theme).toBe(ThemeMode.Auto)
  expect(preferences.language).toBe(Language.English)
})

it('applies automatic appearance and follows system changes until disposed', () => {
  const preferences = new Preferences()
  preferences.initialize(window)
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Light)

  media.matches = true
  media.dispatchEvent(new Event('change'))
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Dark)

  preferences.dispose()
  media.matches = false
  media.dispatchEvent(new Event('change'))
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Dark)
})

it('preserves a manual theme even when it initially matches the system', () => {
  const preferences = new Preferences()
  preferences.initialize(window)
  preferences.setTheme(ThemeMode.Light)
  media.matches = true
  media.dispatchEvent(new Event('change'))

  expect(preferences.theme).toBe(ThemeMode.Light)
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Light)
  expect(JSON.parse(localStorage.getItem(Preferences.STORAGE_KEY) ?? '{}')).toEqual({
    theme: ThemeMode.Light,
    language: preferences.language,
  })

  const reloaded = new Preferences()
  reloaded.initialize(window)
  expect(reloaded.theme).toBe(ThemeMode.Light)
  preferences.dispose()
  reloaded.dispose()
})

it('returns to live system appearance after selecting automatic', () => {
  const preferences = new Preferences()
  preferences.initialize(window)
  preferences.setTheme(ThemeMode.Dark)
  preferences.setTheme(ThemeMode.Auto)
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Light)
  expect(JSON.parse(localStorage.getItem(Preferences.STORAGE_KEY) ?? '{}')).toEqual({
    theme: ThemeMode.Auto,
    language: preferences.language,
  })
  preferences.dispose()
})

it('detects regional Spanish and falls back to English for unsupported browser languages', () => {
  for (const [
    browserLanguage,
    expected,
  ] of [
    [
      'es-ES',
      Language.Spanish,
    ],
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
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(browserLanguage)
    const preferences = new Preferences()
    preferences.initialize(window)
    expect(preferences.language).toBe(expected)
    expect(document.documentElement.lang).toBe(expected)
    preferences.dispose()
  }
})

it('persists manual language and gives it precedence over browser detection', () => {
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-ES')
  const preferences = new Preferences()
  preferences.initialize(window)
  preferences.setLanguage(Language.English)
  expect(document.documentElement.lang).toBe(Language.English)
  expect(JSON.parse(localStorage.getItem(Preferences.STORAGE_KEY) ?? '{}')).toEqual({
    theme: preferences.theme,
    language: Language.English,
  })

  const reloaded = new Preferences()
  reloaded.initialize(window)
  expect(reloaded.language).toBe(Language.English)
  preferences.dispose()
  reloaded.dispose()
})

it('uses defaults for invalid stored values and rejects invalid manual choices', () => {
  localStorage.setItem(Preferences.STORAGE_KEY, JSON.stringify({ theme: 'invalid', language: 'invalid' }))
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR')
  const preferences = new Preferences()
  preferences.initialize(window)
  expect(preferences.theme).toBe(ThemeMode.Auto)
  expect(preferences.language).toBe(Language.English)
  expect(() => {
    Reflect.apply(preferences.setTheme.bind(preferences), null, ['invalid'])
  }).toThrow()
  expect(() => {
    Reflect.apply(preferences.setLanguage.bind(preferences), null, ['invalid'])
  }).toThrow()
  preferences.dispose()
})

it('keeps preferences usable for the current session when browser storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage unavailable')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage unavailable')
  })
  const preferences = new Preferences()
  preferences.initialize(window)
  preferences.setTheme(ThemeMode.Dark)
  preferences.setLanguage(Language.Spanish)
  expect(preferences.theme).toBe(ThemeMode.Dark)
  expect(preferences.language).toBe(Language.Spanish)
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Dark)
  expect(document.documentElement.lang).toBe(Language.Spanish)
  preferences.dispose()
})

it('stores the complete current object after changing either preference', () => {
  const preferences = new Preferences()
  preferences.initialize(window)
  preferences.setLanguage(Language.Spanish)
  expect(localStorage.getItem(Preferences.STORAGE_KEY)).toBe(
    JSON.stringify({ theme: ThemeMode.Auto, language: Language.Spanish }),
  )
  preferences.setTheme(ThemeMode.Dark)
  expect(localStorage.getItem(Preferences.STORAGE_KEY)).toBe(
    JSON.stringify({ theme: ThemeMode.Dark, language: Language.Spanish }),
  )
  preferences.dispose()
})

it('validates each stored field independently while retaining browser language detection', () => {
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-ES')
  for (const [
    stored,
    theme,
    language,
  ] of [
    [
      { theme: ThemeMode.Dark, language: Language.English },
      ThemeMode.Dark,
      Language.English,
    ],
    [
      { theme: ThemeMode.Light, language: 42 },
      ThemeMode.Light,
      Language.Spanish,
    ],
    [
      { theme: false, language: Language.English },
      ThemeMode.Auto,
      Language.English,
    ],
    [
      { theme: ThemeMode.Dark },
      ThemeMode.Dark,
      Language.Spanish,
    ],
    [
      { language: Language.English },
      ThemeMode.Auto,
      Language.English,
    ],
    [
      {},
      ThemeMode.Auto,
      Language.Spanish,
    ],
  ] as const) {
    localStorage.setItem(Preferences.STORAGE_KEY, JSON.stringify(stored))
    const preferences = new Preferences()
    preferences.initialize(window)
    expect(preferences.theme).toBe(theme)
    expect(preferences.language).toBe(language)
    preferences.dispose()
  }
})

it('uses defaults for malformed JSON and non-object stored values', () => {
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR')
  for (const stored of [
    '{',
    'null',
    '[]',
    'true',
    '42',
    '"dark"',
  ]) {
    localStorage.setItem(Preferences.STORAGE_KEY, stored)
    const preferences = new Preferences()
    preferences.initialize(window)
    expect(preferences.theme).toBe(ThemeMode.Auto)
    expect(preferences.language).toBe(Language.English)
    preferences.dispose()
  }
})

it('ignores obsolete preference entries without rewriting storage', () => {
  localStorage.setItem('iqr.theme', ThemeMode.Dark)
  localStorage.setItem('iqr.language', Language.Spanish)
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB')
  const preferences = new Preferences()
  preferences.initialize(window)
  expect(preferences.theme).toBe(ThemeMode.Auto)
  expect(preferences.language).toBe(Language.English)
  expect(localStorage.getItem(Preferences.STORAGE_KEY)).toBeNull()
  expect(localStorage.getItem('iqr.theme')).toBe(ThemeMode.Dark)
  expect(localStorage.getItem('iqr.language')).toBe(Language.Spanish)
  preferences.dispose()
})

it('releases browser references on disposal while keeping reactive state usable', () => {
  const preferences = new Preferences()
  preferences.initialize(window)
  preferences.setTheme(ThemeMode.Dark)
  preferences.setLanguage(Language.Spanish)
  const stored = localStorage.getItem(Preferences.STORAGE_KEY)
  preferences.dispose()
  preferences.dispose()
  preferences.setTheme(ThemeMode.Light)
  preferences.setLanguage(Language.English)
  expect(preferences.theme).toBe(ThemeMode.Light)
  expect(preferences.language).toBe(Language.English)
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Dark)
  expect(document.documentElement.lang).toBe(Language.Spanish)
  expect(localStorage.getItem(Preferences.STORAGE_KEY)).toBe(stored)
})

it('removes prior media listeners and handles system changes once after repeated initialization', () => {
  const add = vi.spyOn(media, 'addEventListener')
  const remove = vi.spyOn(media, 'removeEventListener')
  const preferences = new Preferences()
  preferences.initialize(window)
  preferences.initialize(window)
  expect(add).toHaveBeenCalledTimes(2)
  expect(remove).toHaveBeenCalledTimes(1)
  media.matches = true
  media.dispatchEvent(new Event('change'))
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Dark)
  preferences.dispose()
  preferences.dispose()
  expect(remove).toHaveBeenCalledTimes(2)
})

it('detaches the old media source when initialized with a new one', () => {
  const preferences = new Preferences()
  preferences.initialize(window)
  const nextMedia = Object.assign(new EventTarget(), { matches: true })
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => nextMedia),
  )
  preferences.initialize(window)
  media.matches = false
  media.dispatchEvent(new Event('change'))
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Dark)
  nextMedia.matches = false
  nextMedia.dispatchEvent(new Event('change'))
  expect(document.documentElement.dataset.theme).toBe(ThemeMode.Light)
  preferences.dispose()
})
