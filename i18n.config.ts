import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import { Language } from '@/lib/Shared/Preferences/Language'

type MessageSchema = typeof en

export function createLocalization() {
  const options = {
    legacy: false as const,
    globalInjection: true,
    locale: Language.English,
    fallbackLocale: Language.English,
    messages: { en, es },
  }
  return createI18n<[MessageSchema], Language, false>(options)
}
