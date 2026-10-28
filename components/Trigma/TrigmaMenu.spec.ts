import { createLocalization } from '@/i18n.config'
import { mount } from '@vue/test-utils'
import TrigmaMenu from '@/components/Trigma/TrigmaMenu.vue'

it('disables unavailable modes and offers the real options destination without a return link', () => {
  const wrapper = mount(TrigmaMenu, { global: { plugins: [createLocalization()] } })

  expect(wrapper.findAll('button').map((button) => button.element.disabled)).toEqual([
    true,
    true,
  ])
  expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual(['/trigma/options'])
})
