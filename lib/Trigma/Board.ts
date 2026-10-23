import { CellDirection } from '@/lib/Trigma/CellDirection'
import { Cell } from '@/lib/Trigma/Cell'

export class Board {
  static readonly SIDE_LENGTH = 6

  readonly cells: readonly Cell[]
  readonly #cellIds = new Map<string, number>()

  constructor() {
    const cells: Cell[] = []

    for (let row = 0; row < Board.SIDE_LENGTH; row += 1) {
      for (let column = 0; column < 2 * row + 1; column += 1) {
        const b = Math.floor(column / 2)
        const a = row - b - (column % 2)
        const direction = column % 2 === 0 ? CellDirection.Up : CellDirection.Down
        const cell = new Cell(a, b, direction)

        this.#cellIds.set(Board.key(cell), cells.length)
        cells.push(cell)
      }
    }

    this.cells = Object.freeze(cells)
    Object.freeze(this)
  }

  cellAt(id: number): Cell {
    if (!Number.isInteger(id) || id < 0 || id >= this.cells.length) {
      throw new RangeError('Cell ID is outside the board')
    }

    return this.cells[id]
  }

  cellId(cell: Cell): number | undefined {
    return this.#cellIds.get(Board.key(cell))
  }

  contains(cell: Cell): boolean {
    return this.cellId(cell) !== undefined
  }

  neighbors(cell: Cell): readonly Cell[] {
    if (!this.contains(cell)) {
      throw new RangeError('Cell is outside the board')
    }

    return this.cells.filter((candidate) => cell.sharesSideWith(candidate))
  }

  private static key(cell: Cell): string {
    return [
      cell.a,
      cell.b,
      cell.direction,
    ].join(',')
  }
}
