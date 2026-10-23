import { CellDirection } from '@/lib/Trigma/CellDirection'
import { Board } from '@/lib/Trigma/Board'
import { Cell } from '@/lib/Trigma/Cell'

const board = new Board()

it('Board: contains 36 deterministic triangular cells in rows of odd lengths', () => {
  expect(Board.SIDE_LENGTH).toBe(6)
  expect(board.cells).toHaveLength(36)
  expect(
    new Set(
      board.cells.map((cell) =>
        [
          cell.a,
          cell.b,
          cell.direction,
        ].join(','),
      ),
    ).size,
  ).toBe(36)

  for (let row = 0; row < Board.SIDE_LENGTH; row += 1) {
    expect(board.cells.slice(row * row, (row + 1) * (row + 1))).toHaveLength(2 * row + 1)
  }

  expect(board.cellAt(0).equals(new Cell(0, 0, CellDirection.Up))).toBe(true)
  expect(board.cellAt(2).equals(new Cell(0, 0, CellDirection.Down))).toBe(true)
  expect(board.cellAt(35).equals(new Cell(0, 5, CellDirection.Up))).toBe(true)
  expect(board.cellId(new Cell(0, 0, CellDirection.Down))).toBe(2)
})

it('Board: distinguishes cells inside the triangle from cells outside it', () => {
  expect(board.contains(new Cell(5, 0, CellDirection.Up))).toBe(true)
  expect(board.contains(new Cell(4, 0, CellDirection.Down))).toBe(true)
  expect(board.contains(new Cell(6, 0, CellDirection.Up))).toBe(false)
  expect(board.contains(new Cell(5, 0, CellDirection.Down))).toBe(false)
  expect(board.cellId(new Cell(-1, 0, CellDirection.Up))).toBeUndefined()
})

it('Board: finds only full-side neighbors, including at the apex and interior', () => {
  expect(board.neighbors(new Cell(0, 0, CellDirection.Up))).toEqual([new Cell(0, 0, CellDirection.Down)])
  expect(board.neighbors(new Cell(1, 1, CellDirection.Up))).toEqual([
    new Cell(1, 0, CellDirection.Down),
    new Cell(0, 1, CellDirection.Down),
    new Cell(1, 1, CellDirection.Down),
  ])
})

it('Board: rejects IDs and neighbor queries outside the board', () => {
  expect(() => board.cellAt(-1)).toThrow(RangeError)
  expect(() => board.cellAt(36)).toThrow(RangeError)
  expect(() => board.cellAt(0.5)).toThrow(RangeError)
  expect(() => board.neighbors(new Cell(6, 0, CellDirection.Up))).toThrow(RangeError)
})
