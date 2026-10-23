import { CellDirection } from '@/lib/Trigma/CellDirection'
import { PieceId } from '@/lib/Trigma/PieceId'
import { Cell } from '@/lib/Trigma/Cell'
import type { Board } from '@/lib/Trigma/Board'
import { PieceOrientation } from '@/lib/Trigma/PieceOrientation'
import { Placement } from '@/lib/Trigma/Placement'

export class Piece {
  readonly id: PieceId
  readonly shape: PieceOrientation
  readonly #orientations: readonly PieceOrientation[]

  private static readonly pieces: readonly Piece[] = Object.freeze([
    new Piece(PieceId.I4, [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
    ]),
    new Piece(PieceId.T4, [
      new Cell(0, 0, CellDirection.Up),
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(0, 1, CellDirection.Up),
    ]),
    new Piece(PieceId.C4, [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(1, 1, CellDirection.Up),
    ]),
    new Piece(PieceId.I5, [
      new Cell(0, 0, CellDirection.Up),
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
    ]),
    new Piece(PieceId.P5, [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
      new Cell(1, 1, CellDirection.Up),
    ]),
    new Piece(PieceId.L5, [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(0, 1, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
    ]),
    new Piece(PieceId.C5, [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(0, 1, CellDirection.Down),
      new Cell(1, 1, CellDirection.Up),
    ]),
  ])

  private constructor(id: PieceId, cells: readonly Cell[]) {
    this.id = id
    this.shape = PieceOrientation.fromCells(cells)

    const orientations: PieceOrientation[] = []
    for (const reflected of [
      false,
      true,
    ]) {
      let orientation = reflected ? this.shape.reflected() : this.shape

      for (let turn = 0; turn < Cell.ROTATION_COUNT; turn += 1) {
        if (!orientations.some((existing) => existing.equals(orientation))) {
          orientations.push(orientation)
        }
        orientation = orientation.rotated()
      }
    }

    this.#orientations = Object.freeze(orientations)
    Object.freeze(this)
  }

  static all(): readonly Piece[] {
    return Piece.pieces
  }

  orientations(): readonly PieceOrientation[] {
    return this.#orientations
  }

  placementsOn(board: Board): readonly Placement[] {
    const placements = new Map<string, Placement>()
    const maxA = Math.max(...board.cells.map((cell) => cell.a))
    const maxB = Math.max(...board.cells.map((cell) => cell.b))

    for (const orientation of this.#orientations) {
      for (let da = 0; da <= maxA; da += 1) {
        for (let db = 0; db <= maxB; db += 1) {
          if (!orientation.translatedCells(da, db).every((cell) => board.contains(cell))) {
            continue
          }

          const placement = new Placement(this, board, orientation, da, db)
          placements.set(placement.cellIds.join(','), placement)
        }
      }
    }

    return Object.freeze([...placements.values()])
  }
}
