import { CellDirection } from '@/lib/Trigma/CellDirection'
import { Cell } from '@/lib/Trigma/Cell'

it('Cell: identifies triangles by exact lattice coordinates and direction', () => {
  const up = new Cell(0, 0, CellDirection.Up)
  const down = new Cell(0, 0, CellDirection.Down)

  expect(up.equals(new Cell(0, 0, CellDirection.Up))).toBe(true)
  expect(up.equals(down)).toBe(false)
  expect(up.vertices()).toEqual([
    [
      0,
      0,
    ],
    [
      1,
      0,
    ],
    [
      0,
      1,
    ],
  ])
  expect(down.vertices()).toEqual([
    [
      1,
      0,
    ],
    [
      0,
      1,
    ],
    [
      1,
      1,
    ],
  ])
})

it('Cell: recognizes a shared side, but not a shared vertex', () => {
  const cell = new Cell(0, 0, CellDirection.Up)

  expect(cell.sharesSideWith(new Cell(0, 0, CellDirection.Down))).toBe(true)
  expect(cell.sharesSideWith(new Cell(1, 0, CellDirection.Up))).toBe(false)
  expect(cell.sharesSideWith(cell)).toBe(false)
})

it('Cell: returns new cells for translations, six rotations, and two reflections', () => {
  const cell = new Cell(2, 1, CellDirection.Up)
  let rotated = cell

  expect(Cell.ROTATION_COUNT).toBe(6)
  for (let turn = 0; turn < Cell.ROTATION_COUNT; turn += 1) {
    rotated = rotated.rotated()
  }

  expect(rotated.equals(cell)).toBe(true)
  expect(cell.reflected().reflected().equals(cell)).toBe(true)
  expect(cell.translated(-2, -1).equals(new Cell(0, 0, CellDirection.Up))).toBe(true)
  expect(cell.equals(new Cell(2, 1, CellDirection.Up))).toBe(true)
})

it('Cell: rejects coordinates or directions that cannot describe an exact triangle', () => {
  expect(() => new Cell(0.5, 0, CellDirection.Up)).toThrow(RangeError)
  expect(() => new Cell(Number.MAX_SAFE_INTEGER + 1, 0, CellDirection.Up)).toThrow(RangeError)
  expect(() => new Cell(Number.MAX_SAFE_INTEGER, 0, CellDirection.Up)).toThrow(RangeError)
  expect(() => {
    Reflect.construct(Cell, [
      0,
      0,
      'sideways',
    ])
  }).toThrow(RangeError)
  expect(() => new Cell(0, 0, CellDirection.Up).translated(0.25, 0)).toThrow(RangeError)
})
