import { Board } from '@/lib/Trigma/Board'
import { Piece } from '@/lib/Trigma/Piece'
import type { PieceId } from '@/lib/Trigma/PieceId'
import type { Placement } from '@/lib/Trigma/Placement'

export class Solver {
  private static readonly BLOCKED_CELL_COUNT = 4

  readonly #blockedCellIds: readonly number[]
  readonly #board: Board
  readonly #pieceIds: readonly PieceId[]
  readonly #columns: readonly number[]
  readonly #rowsByColumn: readonly (readonly Placement[])[]

  constructor(blockedCellIds: readonly number[]) {
    const board = new Board()

    if (
      blockedCellIds.length !== Solver.BLOCKED_CELL_COUNT ||
      new Set(blockedCellIds).size !== Solver.BLOCKED_CELL_COUNT ||
      blockedCellIds.some((id) => !Number.isInteger(id) || id < 0 || id >= board.cells.length)
    ) {
      throw new RangeError('Blocked cells must be four distinct board cell IDs')
    }

    this.#blockedCellIds = Object.freeze([...blockedCellIds].sort((left, right) => left - right))
    this.#board = board

    const pieces = Piece.all()
    this.#pieceIds = pieces.map((piece) => piece.id)
    const rowsByColumn: Placement[][] = Array.from({ length: board.cells.length + pieces.length }, () => [])

    pieces.forEach((piece, index) => {
      for (const placement of piece.placementsOn(board)) {
        if (placement.cellIds.some((id) => this.#blockedCellIds.includes(id))) {
          continue
        }

        rowsByColumn[board.cells.length + index].push(placement)
        for (const cellId of placement.cellIds) {
          rowsByColumn[cellId].push(placement)
        }
      }
    })

    this.#rowsByColumn = rowsByColumn
    this.#columns = [
      ...pieces.map((_, index) => board.cells.length + index),
      ...board.cells.map((_, index) => index).filter((id) => !this.#blockedCellIds.includes(id)),
    ]
    Object.freeze(this)
  }

  hasSolution(): boolean {
    return this.search(1) === 1
  }

  findSolutions(limit?: number): readonly (readonly Placement[])[] {
    const solutions: (readonly Placement[])[] = []

    this.search(limit, (placements) => {
      solutions.push(
        Object.freeze(
          [...placements].sort(
            (left, right) => this.#pieceIds.indexOf(left.pieceId) - this.#pieceIds.indexOf(right.pieceId),
          ),
        ),
      )
    })

    return Object.freeze(solutions)
  }

  countSolutions(limit?: number): number {
    return this.search(limit)
  }

  private search(limit?: number, onSolution?: (placements: readonly Placement[]) => void): number {
    if (limit !== undefined && (!Number.isSafeInteger(limit) || limit <= 0)) {
      throw new RangeError('Solution limit must be a positive safe integer')
    }

    const maximum = limit ?? Infinity
    const occupied = Array<boolean>(this.#board.cells.length).fill(false)
    const usedPieces = new Set<PieceId>()
    const chosen: Placement[] = []
    let count = 0

    const visit = (): void => {
      if (count >= maximum) {
        return
      }

      let bestRows: Placement[] | undefined

      for (const column of this.#columns) {
        const covered =
          column < this.#board.cells.length
            ? occupied[column]
            : usedPieces.has(this.#pieceIds[column - this.#board.cells.length])
        if (covered) {
          continue
        }

        const available = this.#rowsByColumn[column].filter(
          (placement) => !usedPieces.has(placement.pieceId) && placement.cellIds.every((id) => !occupied[id]),
        )
        if (available.length === 0) {
          return
        }
        if (bestRows === undefined || available.length < bestRows.length) {
          bestRows = available
        }
      }

      if (bestRows === undefined) {
        count += 1
        onSolution?.(chosen)
        return
      }

      for (const placement of bestRows) {
        chosen.push(placement)
        usedPieces.add(placement.pieceId)
        for (const id of placement.cellIds) {
          occupied[id] = true
        }

        visit()

        for (const id of placement.cellIds) {
          occupied[id] = false
        }
        usedPieces.delete(placement.pieceId)
        chosen.pop()

        if (count >= maximum) {
          return
        }
      }
    }

    visit()
    return count
  }
}
