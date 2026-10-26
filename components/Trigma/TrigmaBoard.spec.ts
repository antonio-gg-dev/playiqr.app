import { mount } from '@vue/test-utils'
import TrigmaBoard from '@/components/Trigma/TrigmaBoard.vue'

it('renders all 36 domain cells and highlights the requested blocker IDs', () => {
  const wrapper = mount(TrigmaBoard, {
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

it('updates highlighted cells when supplied with another challenge', async () => {
  const wrapper = mount(TrigmaBoard, {
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
