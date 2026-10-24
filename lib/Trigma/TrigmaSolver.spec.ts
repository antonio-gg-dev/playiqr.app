import { TrigmaSolver } from '@/lib/Trigma/TrigmaSolver'
import { Board } from '@/lib/Trigma/Board'
import { Piece } from '@/lib/Trigma/Piece'

it('TrigmaSolver: accepts exactly four distinct board cell IDs', () => {
  expect(
    () =>
      new TrigmaSolver([
        4,
        7,
        11,
        18,
      ]),
  ).not.toThrow()
  expect(
    () =>
      new TrigmaSolver([
        4,
        7,
        11,
      ]),
  ).toThrow(RangeError)
  expect(
    () =>
      new TrigmaSolver([
        4,
        7,
        11,
        18,
        20,
      ]),
  ).toThrow(RangeError)
  expect(
    () =>
      new TrigmaSolver([
        4,
        7,
        11,
        11,
      ]),
  ).toThrow(RangeError)
  expect(
    () =>
      new TrigmaSolver([
        4,
        7,
        11,
        -1,
      ]),
  ).toThrow(RangeError)
  expect(
    () =>
      new TrigmaSolver([
        4,
        7,
        11,
        36,
      ]),
  ).toThrow(RangeError)
  expect(
    () =>
      new TrigmaSolver([
        4,
        7,
        11,
        1.5,
      ]),
  ).toThrow(RangeError)
})

it('TrigmaSolver: detects solvable and impossible obstacle configurations', () => {
  expect(
    new TrigmaSolver([
      4,
      7,
      11,
      18,
    ]).hasSolution(),
  ).toBe(true)
  expect(
    new TrigmaSolver([
      1,
      7,
      14,
      29,
    ]).hasSolution(),
  ).toBe(false)
})

it('TrigmaSolver: returns complete placements with distinct pieces and no geometric duplicates', () => {
  const blocked = [
    0,
    1,
    2,
    3,
  ]
  const solutions = new TrigmaSolver(blocked).findSolutions(3)
  const expectedPieces = Piece.all().map((piece) => piece.id)
  const freeCellIds = new Board().cells.map((_, id) => id).filter((id) => !blocked.includes(id))

  expect(solutions).toHaveLength(3)

  const signatures = new Set<string>()
  for (const solution of solutions) {
    expect(solution.map((placement) => placement.pieceId)).toEqual(expectedPieces)

    const covered = solution.flatMap((placement) => placement.cellIds)
    expect(covered).toHaveLength(freeCellIds.length)
    expect([...covered].sort((left, right) => left - right)).toEqual(freeCellIds)
    expect(new Set(covered).size).toBe(freeCellIds.length)
    expect(covered.every((id) => !blocked.includes(id))).toBe(true)

    signatures.add(solution.map((placement) => `${placement.pieceId}:${placement.cellIds.join(',')}`).join('|'))
  }
  expect(signatures.size).toBe(solutions.length)
})

it('TrigmaSolver: counts zero, one, and multiple solutions with an optional search limit', () => {
  expect(
    new TrigmaSolver([
      1,
      7,
      14,
      29,
    ]).countSolutions(),
  ).toBe(0)
  expect(
    new TrigmaSolver([
      4,
      7,
      11,
      18,
    ]).countSolutions(),
  ).toBe(1)

  const multiple = new TrigmaSolver([
    0,
    1,
    2,
    3,
  ])
  expect(multiple.countSolutions(2)).toBe(2)
  expect(multiple.findSolutions(2)).toHaveLength(2)
  expect(multiple.findSolutions(3)).toHaveLength(3)

  const allSolutions = multiple.findSolutions()
  expect(allSolutions.length).toBeGreaterThan(2)
  expect(multiple.findSolutions(2)).toEqual(allSolutions.slice(0, 2))
  expect(multiple.countSolutions()).toBe(allSolutions.length)
  expect(
    new Set(
      allSolutions.map((solution) =>
        solution.map((placement) => `${placement.pieceId}:${placement.cellIds.join(',')}`).join('|'),
      ),
    ).size,
  ).toBe(allSolutions.length)
})

it('TrigmaSolver: rejects invalid solution limits', () => {
  const solver = new TrigmaSolver([
    4,
    7,
    11,
    18,
  ])

  for (const limit of [
    0,
    -1,
    1.5,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    expect(() => solver.findSolutions(limit)).toThrow(RangeError)
    expect(() => solver.countSolutions(limit)).toThrow(RangeError)
  }
})

it('TrigmaSolver: ignores later input changes and returns deterministic immutable solutions', () => {
  const blocked = [
    4,
    7,
    11,
    18,
  ]
  const solver = new TrigmaSolver(blocked)
  const originalPieces = Piece.all().map((piece) =>
    piece.orientations().map((orientation) =>
      orientation.cells.map((cell) => [
        cell.a,
        cell.b,
        cell.direction,
      ]),
    ),
  )

  blocked[0] = 0

  const first = solver.findSolutions()
  expect(first).toHaveLength(1)
  expect(first).toEqual(solver.findSolutions())
  expect(first).toEqual(
    new TrigmaSolver([
      18,
      11,
      7,
      4,
    ]).findSolutions(),
  )
  expect(Object.isFrozen(first)).toBe(true)
  expect(Object.isFrozen(first[0])).toBe(true)
  expect(first[0].every((placement) => Object.isFrozen(placement) && Object.isFrozen(placement.cellIds))).toBe(true)
  expect(
    Piece.all().map((piece) =>
      piece.orientations().map((orientation) =>
        orientation.cells.map((cell) => [
          cell.a,
          cell.b,
          cell.direction,
        ]),
      ),
    ),
  ).toEqual(originalPieces)
})
