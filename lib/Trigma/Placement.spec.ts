import { Board } from '@/lib/Trigma/Board'
import { Piece } from '@/lib/Trigma/Piece'
import { PieceId } from '@/lib/Trigma/PieceId'
import { Placement } from '@/lib/Trigma/Placement'

const board = new Board()
const [
  i4,
  t4,
] = Piece.all()

it('Placement: exposes a piece ID and sorted board cell IDs for an in-bounds shape', () => {
  const placement = new Placement(i4, board, i4.orientations()[0], 0, 0)

  expect(placement.pieceId).toBe(PieceId.I4)
  expect(placement.cellIds).toHaveLength(4)
  expect(placement.cellIds).toEqual([...placement.cellIds].sort((a, b) => a - b))
  expect(new Set(placement.cellIds).size).toBe(4)
  expect(Object.isFrozen(placement.cellIds)).toBe(true)
})

it('Placement: rejects mismatched orientations, off-board cells, and inexact offsets', () => {
  expect(() => new Placement(i4, board, t4.orientations()[0], 0, 0)).toThrow(RangeError)
  expect(() => new Placement(i4, board, i4.orientations()[0], 6, 0)).toThrow(RangeError)
  expect(() => new Placement(i4, board, i4.orientations()[0], 0.5, 0)).toThrow(RangeError)
})
