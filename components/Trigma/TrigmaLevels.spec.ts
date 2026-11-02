import { createLocalization } from '@/i18n.config'
import { mount } from '@vue/test-utils'
import TrigmaLevels from '@/components/Trigma/TrigmaLevels.vue'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'
import campaignData from '@/lib/Trigma/campaign-catalog-v1.json'

it('TrigmaLevels: lists every available level in five groups and reflects completion progress', () => {
  const progress = new CampaignProgress()
  progress.initialize(window)
  progress.setCompleted(1, true)
  const wrapper = mount(TrigmaLevels, {
    props: {
      campaignCatalog: CampaignCatalog.fromJSON(campaignData),
      campaignProgress: progress,
    },
    global: { plugins: [createLocalization()] },
  })

  expect(wrapper.findAll('a[href^="/trigma/levels/"]')).toHaveLength(100)
  expect(wrapper.findAll('section[data-difficulty]')).toHaveLength(5)
  expect(wrapper.get('a[href="/trigma/levels/1"]').attributes('aria-label')).toBe('Level 1, completed')
  expect(wrapper.get('section[data-difficulty="initiate"] [role="progressbar"]').attributes('aria-valuenow')).toBe('1')
  expect(wrapper.get('section[data-difficulty="apprentice"] [role="progressbar"]').attributes('aria-valuenow')).toBe(
    '0',
  )
})

it('TrigmaLevels: scrolls once to the first difficulty with pending levels', async () => {
  const progress = new CampaignProgress()
  progress.initialize(window)

  for (let level = 1; level <= 20; level += 1) {
    progress.setCompleted(level, true)
  }

  let scrolledDifficulty: string | null = null
  const scrollIntoView = vi.fn(function (this: HTMLElement): void {
    scrolledDifficulty = this.getAttribute('data-difficulty')
  })
  const previousScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  })

  try {
    const wrapper = mount(TrigmaLevels, {
      props: {
        campaignCatalog: CampaignCatalog.fromJSON(campaignData),
        campaignProgress: progress,
      },
      global: { plugins: [createLocalization()] },
    })

    await wrapper.vm.$nextTick()

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrolledDifficulty).toBe('apprentice')

    progress.setCompleted(21, true)
    await wrapper.vm.$nextTick()

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  } finally {
    if (previousScrollIntoView) {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', previousScrollIntoView)
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
    }
  }
})

it('TrigmaLevels: opens at the top when all campaign levels are completed', async () => {
  const progress = new CampaignProgress()
  progress.initialize(window)

  for (let level = 1; level <= 100; level += 1) {
    progress.setCompleted(level, true)
  }

  const scrollTo = vi.fn()
  const previousScrollTo = Object.getOwnPropertyDescriptor(window, 'scrollTo')
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: scrollTo,
  })

  try {
    const wrapper = mount(TrigmaLevels, {
      props: {
        campaignCatalog: CampaignCatalog.fromJSON(campaignData),
        campaignProgress: progress,
      },
      global: { plugins: [createLocalization()] },
    })

    await wrapper.vm.$nextTick()

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  } finally {
    if (previousScrollTo) {
      Object.defineProperty(window, 'scrollTo', previousScrollTo)
    } else {
      Reflect.deleteProperty(window, 'scrollTo')
    }
  }
})
