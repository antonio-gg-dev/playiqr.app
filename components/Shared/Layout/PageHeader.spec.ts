import { mount } from '@vue/test-utils'
import PageHeader from '@/components/Shared/Layout/PageHeader.vue'

it('only renders a return link when the screen supplies a destination', async () => {
  const wrapper = mount(PageHeader, { props: { title: 'IQR' } })

  expect(wrapper.findAll('a')).toHaveLength(0)

  await wrapper.setProps({ backHref: '/trigma', backLabel: 'Back to menu' })

  expect(wrapper.get('a').attributes('href')).toBe('/trigma')
  expect(wrapper.get('a').attributes('aria-label')).toBe('Back to menu')
  expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
})
