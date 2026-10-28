import { mount } from '@vue/test-utils'
import IqrHome from '@/components/Shared/IqrHome.vue'

it('offers only the available Trigma destination without a return link', () => {
  const wrapper = mount(IqrHome)

  expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual(['/trigma'])
})
