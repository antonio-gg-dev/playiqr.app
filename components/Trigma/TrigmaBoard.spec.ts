import { createLocalization } from '@/i18n.config'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import TrigmaBoard from '@/components/Trigma/TrigmaBoard.vue'
import { Language } from '@/lib/Shared/Preferences/Language'

it('renders all 36 domain cells and highlights the requested blocker IDs', () => {
  const i18n = createLocalization()

  const wrapper = mount(TrigmaBoard, {
    global: { plugins: [i18n] },

    props: {
      blockedCellIds: [
        0,
        11,
        21,
        27,
      ],
    },
  })

  expect(wrapper.findAll('polygon')).toHaveLength(36)
  expect(
    wrapper.findAll('.trigma-board__cell--blocked').map((cell) => Number(cell.attributes('data-cell-id'))),
  ).toEqual([
    0,
    11,
    21,
    27,
  ])
})

it('updates its accessible description when the language changes', async () => {
  const i18n = createLocalization()

  const wrapper = mount(TrigmaBoard, {
    global: { plugins: [i18n] },

    props: {
      blockedCellIds: [
        0,
        11,
        21,
        27,
      ],
    },
  })

  expect(wrapper.get('svg').attributes('aria-label')).toBe('Trigma board. Blockers: 0, 11, 21, 27')

  i18n.global.locale.value = Language.Spanish

  await nextTick()

  expect(wrapper.get('svg').attributes('aria-label')).toBe('Tablero de Trigma. Bloqueadores: 0, 11, 21, 27')
})

it('updates highlighted cells when supplied with another challenge', async () => {
  const i18n = createLocalization()

  const wrapper = mount(TrigmaBoard, {
    global: { plugins: [i18n] },

    props: {
      blockedCellIds: [
        0,
        11,
        21,
        27,
      ],
    },
  })

  await wrapper.setProps({
    blockedCellIds: [
      35,
      8,
      4,
      16,
    ],
  })

  expect(
    wrapper.findAll('.trigma-board__cell--blocked').map((cell) => Number(cell.attributes('data-cell-id'))),
  ).toEqual([
    4,
    8,
    16,
    35,
  ])
})
