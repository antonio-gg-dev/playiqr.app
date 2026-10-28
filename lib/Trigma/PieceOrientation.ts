import { Cell } from '@/lib/Trigma/Cell'

export class PieceOrientation {
  private static readonly TETRIAMOND_SIZE = 4
  private static readonly PENTIAMOND_SIZE = 5

  public readonly cells: readonly Cell[]

  private constructor(cells: readonly Cell[]) {
    this.cells = Object.freeze([...cells])
    Object.freeze(this)
  }

  public static fromCells(cells: readonly Cell[]): PieceOrientation {
    if (cells.length !== PieceOrientation.TETRIAMOND_SIZE && cells.length !== PieceOrientation.PENTIAMOND_SIZE) {
      throw new RangeError('A piece orientation must contain four or five cells')
    }

    const keys = new Set(
      cells.map((cell) =>
        [
          cell.a,
          cell.b,
          cell.direction,
        ].join(','),
      ),
    )
    if (keys.size !== cells.length) {
      throw new RangeError('A piece orientation cannot repeat a cell')
    }

    const connected = new Set<number>([0])
    let previousSize = 0

    while (connected.size !== previousSize) {
      previousSize = connected.size

      for (let index = 0; index < cells.length; index += 1) {
        if (!connected.has(index) && [...connected].some((known) => cells[index].sharesSideWith(cells[known]))) {
          connected.add(index)
        }
      }
    }

    if (connected.size !== cells.length) {
      throw new RangeError('A piece orientation must be connected by full sides')
    }

    const minA = Math.min(...cells.map((cell) => cell.a))
    const minB = Math.min(...cells.map((cell) => cell.b))
    const normalized = cells
      .map((cell) => cell.translated(-minA, -minB))
      .sort((left, right) => left.a - right.a || left.b - right.b || left.direction.localeCompare(right.direction))

    return new PieceOrientation(normalized)
  }

  public rotated(): PieceOrientation {
    return PieceOrientation.fromCells(this.cells.map((cell) => cell.rotated()))
  }

  public reflected(): PieceOrientation {
    return PieceOrientation.fromCells(this.cells.map((cell) => cell.reflected()))
  }

  public translatedCells(da: number, db: number): readonly Cell[] {
    return Object.freeze(this.cells.map((cell) => cell.translated(da, db)))
  }

  public equals(other: PieceOrientation): boolean {
    return (
      this.cells.length === other.cells.length && this.cells.every((cell, index) => cell.equals(other.cells[index]))
    )
  }
}
