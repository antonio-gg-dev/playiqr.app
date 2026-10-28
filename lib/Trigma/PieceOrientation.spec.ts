import { CellDirection } from '@/lib/Trigma/CellDirection'
import { Cell } from '@/lib/Trigma/Cell'
import { PieceOrientation } from '@/lib/Trigma/PieceOrientation'

const t1 = [
  new Cell(0, 0, CellDirection.Down),
  new Cell(1, 0, CellDirection.Up),
  new Cell(1, 0, CellDirection.Down),
  new Cell(2, 0, CellDirection.Up),
]

it('PieceOrientation: normalizes translation and input order without changing the shape', () => {
  const original = PieceOrientation.fromCells(t1)

  const moved = PieceOrientation.fromCells(t1.map((cell) => cell.translated(-4, 3)).reverse())

  expect(original.equals(moved)).toBe(true)
  expect(original.cells).toHaveLength(4)
  expect(Object.isFrozen(original.cells)).toBe(true)
})

it('PieceOrientation: preserves size and connectivity through rotations and reflections', () => {
  const original = PieceOrientation.fromCells(t1)
  let rotated = original

  for (let turn = 0; turn < Cell.ROTATION_COUNT; turn += 1) {
    rotated = rotated.rotated()

    expect(rotated.cells).toHaveLength(4)
  }

  expect(rotated.equals(original)).toBe(true)
  expect(original.reflected().reflected().equals(original)).toBe(true)
})

it('PieceOrientation: rejects repeated, disconnected, or wrongly sized shapes', () => {
  expect(() =>
    PieceOrientation.fromCells([
      ...t1.slice(0, 3),
      t1[0],
    ]),
  ).toThrow(RangeError)
  expect(() =>
    PieceOrientation.fromCells([
      ...t1.slice(0, 3),
      new Cell(20, 20, CellDirection.Up),
    ]),
  ).toThrow(RangeError)
  expect(() => PieceOrientation.fromCells(t1.slice(0, 3))).toThrow(RangeError)
})

it('PieceOrientation: compares different-sized shapes without treating either as equal', () => {
  const four = PieceOrientation.fromCells([
    new Cell(0, 0, CellDirection.Up),
    new Cell(0, 0, CellDirection.Down),
    new Cell(1, 0, CellDirection.Up),
    new Cell(1, 0, CellDirection.Down),
  ])
  const five = PieceOrientation.fromCells([
    ...four.cells,
    new Cell(2, 0, CellDirection.Up),
  ])

  expect(four.equals(five)).toBe(false)
  expect(five.equals(four)).toBe(false)
})
