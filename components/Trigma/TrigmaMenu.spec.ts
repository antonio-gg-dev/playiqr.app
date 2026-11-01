import { createLocalization } from '@/i18n.config'
import { mount } from '@vue/test-utils'
import TrigmaMenu from '@/components/Trigma/TrigmaMenu.vue'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'

it('links to the campaign with live progress while keeping the daily challenge unavailable', () => {
  const progress = new CampaignProgress()
  progress.initialize(window)
  progress.setCompleted(1, true)
  const wrapper = mount(TrigmaMenu, {
    props: { campaignProgress: progress },
    global: { plugins: [createLocalization()] },
  })

  expect(wrapper.get('a[href="/trigma/levels"]').text()).toContain('1/100')
  expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('1')
  expect(wrapper.get('button').element.disabled).toBe(true)
  expect(wrapper.find('a[href="/trigma/options"]').exists()).toBe(true)
})
