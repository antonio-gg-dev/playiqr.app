import { Board } from '@/lib/Trigma/Board'
import type { Cell } from '@/lib/Trigma/Cell'

export class BoardSymmetry {
  private static readonly OBSTACLE_COUNT = 4
  private static readonly ROTATION_COUNT = 3

  readonly #maps: readonly (readonly number[])[]

  public constructor() {
    const board = new Board()
    const maps: (readonly number[])[] = []

    for (const reflected of [
      false,
      true,
    ]) {
      for (let turn = 0; turn < BoardSymmetry.ROTATION_COUNT; turn += 1) {
        const ids = board.cells.map((cell) => {
          let transformed = reflected ? cell.reflected().rotated() : cell

          for (let rotation = 0; rotation < turn; rotation += 1) {
            transformed = BoardSymmetry.rotated(transformed)
          }

          const id = board.cellId(transformed)

          if (id === undefined) {
            throw new RangeError('A board symmetry mapped a cell outside the board')
          }

          return id
        })

        maps.push(Object.freeze(ids))
      }
    }

    this.#maps = Object.freeze(maps)

    Object.freeze(this)
  }

  public equivalents(blockedCellIds: readonly number[]): readonly (readonly number[])[] {
    if (
      blockedCellIds.length !== BoardSymmetry.OBSTACLE_COUNT ||
      new Set(blockedCellIds).size !== BoardSymmetry.OBSTACLE_COUNT ||
      blockedCellIds.some((id) => !Number.isInteger(id) || id < 0 || id >= this.#maps[0].length)
    ) {
      throw new RangeError('Blocked cells must be four distinct board cell IDs')
    }

    const configurations = new Map<string, readonly number[]>()

    for (const map of this.#maps) {
      const ids = Object.freeze(blockedCellIds.map((id) => map[id]).sort((left, right) => left - right))

      configurations.set(ids.join(','), ids)
    }

    return Object.freeze([...configurations.values()].sort((left, right) => BoardSymmetry.compare(left, right)))
  }

  private static rotated(cell: Cell): Cell {
    return cell.rotated().rotated().translated(Board.SIDE_LENGTH, 0)
  }

  private static compare(left: readonly number[], right: readonly number[]): number {
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) {
        return left[index] - right[index]
      }
    }

    return 0
  }
}
