import { createLocalization } from '@/i18n.config'
import { mount } from '@vue/test-utils'
import TrigmaLevel from '@/components/Trigma/TrigmaLevel.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import campaignData from '@/lib/Trigma/campaign-catalog-v1.json'

function mountLevel(level: number, campaignProgress = new CampaignProgress()) {
  campaignProgress.initialize(window)

  return {
    campaignProgress,
    wrapper: mount(TrigmaLevel, {
      props: {
        level,
        campaignCatalog: CampaignCatalog.fromJSON(campaignData),
        campaignProgress,
      },
      global: { plugins: [createLocalization()] },
    }),
  }
}

it('TrigmaLevel: shows the selected level with its four blockers on the triangular board', () => {
  const catalog = CampaignCatalog.fromJSON(campaignData)
  const { wrapper } = mountLevel(1)
  const board = wrapper.get('svg.trigma-board')

  expect(wrapper.text()).toContain('Level 1')
  expect(board.findAll('polygon')).toHaveLength(36)
  expect(board.findAll('.trigma-board__cell--blocked')).toHaveLength(4)
  expect(board.attributes('aria-label')).toContain(catalog.level(1)?.blockedCellIds.join(', '))
  expect(wrapper.get('button').text()).toBe('Complete')
})

it('TrigmaLevel: completes, reverses, and recompletes a level', async () => {
  const { campaignProgress, wrapper } = mountLevel(12)

  await wrapper.get('button').trigger('click')

  expect(campaignProgress.isCompleted(12)).toBe(true)
  expect(wrapper.get('button').text()).toBe('Completed')
  expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')

  await wrapper.get('button').trigger('click')

  expect(campaignProgress.isCompleted(12)).toBe(false)
  expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')

  await wrapper.get('button').trigger('click')

  expect(campaignProgress.isCompleted(12)).toBe(true)
  expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
})

it('TrigmaLevel: offers only the next numbered level after completion and has no next link at level 100', async () => {
  const { wrapper: level20 } = mountLevel(20)

  expect(level20.find('a[href="/trigma/levels/21"]').exists()).toBe(false)

  await level20.get('button').trigger('click')

  expect(level20.get('a[href="/trigma/levels/21"]').text()).toBe('Next challenge')
  expect(level20.find('a[href="/trigma/levels/19"]').exists()).toBe(false)

  const { wrapper: level100 } = mountLevel(100)

  await level100.get('button').trigger('click')

  expect(level100.find('a[href="/trigma/levels/101"]').exists()).toBe(false)
})
