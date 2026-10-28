import { BoardSymmetry } from '@/lib/Trigma/BoardSymmetry'

it('BoardSymmetry: deduplicates configurations fixed by a board reflection', () => {
  const equivalents = new BoardSymmetry().equivalents([
    0,
    1,
    2,
    3,
  ])

  expect(equivalents).toHaveLength(3)
  expect(equivalents[0]).toEqual([
    0,
    1,
    2,
    3,
  ])
  expect(new Set(equivalents.map((ids) => ids.join(','))).size).toBe(equivalents.length)
  expect(
    equivalents.every((ids) => ids.length === 4 && ids.every((id, index) => index === 0 || id > ids[index - 1])),
  ).toBe(true)
})

it('BoardSymmetry: rejects invalid obstacles and returns immutable configurations', () => {
  const symmetry = new BoardSymmetry()

  expect(() =>
    symmetry.equivalents([
      0,
      0,
      1,
      2,
    ]),
  ).toThrow(RangeError)
  expect(() =>
    symmetry.equivalents([
      0,
      1,
      2,
      36,
    ]),
  ).toThrow(RangeError)

  const equivalents = symmetry.equivalents([
    4,
    7,
    11,
    18,
  ])

  expect(equivalents).toHaveLength(6)
  expect(Object.isFrozen(equivalents)).toBe(true)
  expect(equivalents.every((ids) => Object.isFrozen(ids))).toBe(true)
})
