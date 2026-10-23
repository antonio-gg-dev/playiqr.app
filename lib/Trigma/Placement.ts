import type { Board } from '@/lib/Trigma/Board'
import type { Piece } from '@/lib/Trigma/Piece'
import type { PieceId } from '@/lib/Trigma/PieceId'
import type { PieceOrientation } from '@/lib/Trigma/PieceOrientation'

export class Placement {
  readonly pieceId: PieceId
  readonly cellIds: readonly number[]

  constructor(piece: Piece, board: Board, orientation: PieceOrientation, da: number, db: number) {
    if (!Number.isSafeInteger(da) || !Number.isSafeInteger(db)) {
      throw new RangeError('Placement offsets must be safe integers')
    }
    if (!piece.orientations().some((candidate) => candidate.equals(orientation))) {
      throw new RangeError('Orientation does not belong to the piece')
    }

    const ids = orientation.translatedCells(da, db).map((cell) => board.cellId(cell))
    if (ids.some((id) => id === undefined)) {
      throw new RangeError('Placement extends outside the board')
    }

    this.pieceId = piece.id
    this.cellIds = Object.freeze((ids as number[]).sort((left, right) => left - right))
    Object.freeze(this)
  }
}
