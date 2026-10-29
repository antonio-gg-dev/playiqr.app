import { createLocalization } from '@/i18n.config'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import TrigmaOptions from '@/components/Trigma/TrigmaOptions.vue'
import { Preferences } from '@/lib/Shared/Preferences/Preferences'
import { Language } from '@/lib/Shared/Preferences/Language'
import { ThemeMode } from '@/lib/Shared/Preferences/ThemeMode'

it('updates real global preferences through custom controls and keeps return destinations distinct', async () => {
  const preferences = new Preferences()
  const i18n = createLocalization()

  const wrapper = mount(TrigmaOptions, {
    props: { preferences },
    global: { plugins: [i18n] },
  })

  expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual([
    '/trigma',
    '/',
  ])
  expect(wrapper.get('a').attributes('aria-label')).toBe('Back to menu')

  await wrapper.get('#language-trigger').trigger('click')
  await wrapper.get(`[role="option"][data-value="${Language.Spanish}"]`).trigger('click')

  expect(preferences.language).toBe(Language.Spanish)

  i18n.global.locale.value = preferences.language

  await nextTick()

  expect(wrapper.get('a').attributes('aria-label')).toBe('Volver al menú')

  await wrapper.get('#theme-trigger').trigger('click')
  await wrapper.get(`[role="option"][data-value="${ThemeMode.Dark}"]`).trigger('click')

  expect(preferences.theme).toBe(ThemeMode.Dark)
})

it('shows each locale name from its own catalog', async () => {
  const i18n = createLocalization()
  const preferences = new Preferences()

  i18n.global.mergeLocaleMessage(Language.English, {
    english: 'English translation',
    spanish: 'Spanish translation',
  })

  const wrapper = mount(TrigmaOptions, {
    global: { plugins: [i18n] },
    props: { preferences },
  })

  await wrapper.get('#language-trigger').trigger('click')

  expect(wrapper.get(`[role="option"][data-value="${Language.English}"]`).text()).toBe('English')
  expect(wrapper.get(`[role="option"][data-value="${Language.Spanish}"]`).text()).toBe('Español')
})
