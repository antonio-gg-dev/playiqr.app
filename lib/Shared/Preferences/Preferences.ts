import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'
import { reactive, type InjectionKey } from 'vue'

export class Preferences {
  public static readonly KEY: InjectionKey<Preferences> = Symbol('IQR preferences')
  public static readonly STORAGE_KEY = 'preferences'

  private readonly state = reactive({ theme: ThemeMode.Auto, language: Language.English })
  private browser?: Window
  private media?: MediaQueryList
  private readonly onSystemChange = () => {
    this.applyTheme()
  }

  public get theme(): ThemeMode {
    return this.state.theme
  }

  public get language(): Language {
    return this.state.language
  }

  public initialize(browser: Window): void {
    this.dispose()
    this.browser = browser
    const values = this.read()
    this.state.theme = Object.values(ThemeMode).find((value) => value === values.theme) ?? ThemeMode.Auto
    this.state.language =
      Object.values(Language).find((value) => value === values.language) ??
      Object.values(Language).find(
        (value: string) => value === browser.navigator.language.toLowerCase().split('-')[0],
      ) ??
      Language.English
    this.media = browser.matchMedia('(prefers-color-scheme: dark)')
    this.media.addEventListener('change', this.onSystemChange)
    this.applyTheme()
    this.applyLanguage()
  }

  public setTheme(theme: ThemeMode): void {
    if (!Object.values(ThemeMode).includes(theme)) {
      throw new Error('Unsupported theme')
    }
    this.state.theme = theme
    this.persist()
    this.applyTheme()
  }

  public setLanguage(language: Language): void {
    if (!Object.values(Language).includes(language)) {
      throw new Error('Unsupported language')
    }
    this.state.language = language
    this.persist()
    this.applyLanguage()
  }

  public dispose(): void {
    this.media?.removeEventListener('change', this.onSystemChange)
    this.media = undefined
    this.browser = undefined
  }

  private applyTheme(): void {
    if (!this.browser) {
      return
    }
    const dark = this.theme === ThemeMode.Dark || (this.theme === ThemeMode.Auto && this.media?.matches)
    this.browser.document.documentElement.dataset.theme = dark ? ThemeMode.Dark : ThemeMode.Light
  }

  private applyLanguage(): void {
    if (this.browser) {
      this.browser.document.documentElement.lang = this.language
    }
  }

  private read(): { theme?: unknown; language?: unknown } {
    try {
      const stored = this.browser?.localStorage.getItem(Preferences.STORAGE_KEY)
      if (stored === null || stored === undefined) {
        return {}
      }
      const value: unknown = JSON.parse(stored)
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {}
      }
      return {
        theme: 'theme' in value ? value.theme : undefined,
        language: 'language' in value ? value.language : undefined,
      }
    } catch {
      return {}
    }
  }

  private serialize(): string {
    return JSON.stringify({ theme: this.theme, language: this.language })
  }

  private persist(): void {
    try {
      if (!this.browser) {
        return
      }
      this.browser.localStorage.setItem(Preferences.STORAGE_KEY, this.serialize())
    } catch {
      return
    }
  }
}
