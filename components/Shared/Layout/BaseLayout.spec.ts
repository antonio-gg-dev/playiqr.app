import { mount } from '@vue/test-utils'
import BaseLayout from '@/components/Shared/Layout/BaseLayout.vue'

vi.mock('vitepress', () => ({
  useData: () => ({
    site: {
      title: 'IQR',
      description: 'Logic puzzles',
    },
    frontmatter: {
      home: true,
    },
  }),
}))

it('displays the site title on the home page', () => {
  const wrapper = mount(BaseLayout, {
    global: {
      stubs: ['Content'],
    },
  })

  expect(wrapper.find('h1').text()).toBe('IQR')
})
