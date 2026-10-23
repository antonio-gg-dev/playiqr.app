import { CellDirection } from '@/lib/Trigma/CellDirection'
import { PieceId } from '@/lib/Trigma/PieceId'
import { Cell } from '@/lib/Trigma/Cell'
import { Board } from '@/lib/Trigma/Board'
import { Piece } from '@/lib/Trigma/Piece'
import { PieceOrientation } from '@/lib/Trigma/PieceOrientation'

const expectedShapes = [
  [
    PieceId.I4,
    [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
    ],
    6,
  ],
  [
    PieceId.T4,
    [
      new Cell(0, 0, CellDirection.Up),
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(0, 1, CellDirection.Up),
    ],
    2,
  ],
  [
    PieceId.C4,
    [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(1, 1, CellDirection.Up),
    ],
    6,
  ],
  [
    PieceId.I5,
    [
      new Cell(0, 0, CellDirection.Up),
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
    ],
    6,
  ],
  [
    PieceId.P5,
    [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
      new Cell(1, 1, CellDirection.Up),
    ],
    12,
  ],
  [
    PieceId.L5,
    [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(0, 1, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(2, 0, CellDirection.Up),
    ],
    12,
  ],
  [
    PieceId.C5,
    [
      new Cell(0, 0, CellDirection.Down),
      new Cell(1, 0, CellDirection.Up),
      new Cell(1, 0, CellDirection.Down),
      new Cell(0, 1, CellDirection.Down),
      new Cell(1, 1, CellDirection.Up),
    ],
    6,
  ],
] as const

it('Piece: defines the seven reference shapes with their stable IDs and sizes', () => {
  const pieces = Piece.all()

  expect(pieces.map((piece) => piece.id)).toEqual(expectedShapes.map(([id]) => id))
  expect(pieces.map((piece) => piece.shape.cells.length)).toEqual([
    4,
    4,
    4,
    5,
    5,
    5,
    5,
  ])

  for (const [
    id,
    cells,
  ] of expectedShapes) {
    const expected = PieceOrientation.fromCells(cells)

    expect(pieces.find((piece) => piece.id === id)?.shape.equals(expected)).toBe(true)
  }
})

it('Piece: generates only unique rotations and reflections for each free shape', () => {
  const pieces = Piece.all()

  expect(pieces.map((piece) => piece.orientations().length)).toEqual(
    expectedShapes.map(
      ([
        ,
        ,
        orientationCount,
      ]) => orientationCount,
    ),
  )

  for (const piece of pieces) {
    const orientations = piece.orientations()
    expect(orientations.every((orientation) => orientation.cells.length === piece.shape.cells.length)).toBe(true)

    for (const other of pieces) {
      if (piece.id === other.id) continue
      expect(
        orientations.some((orientation) => other.orientations().some((candidate) => orientation.equals(candidate))),
      ).toBe(false)
    }
  }
})

it('Piece: enumerates deterministic, unique, in-bounds positions for every piece', () => {
  const board = new Board()
  const expectedCounts = [
    60,
    21,
    60,
    48,
    96,
    96,
    60,
  ]

  Piece.all().forEach((piece, index) => {
    const placements = piece.placementsOn(board)
    const signatures = placements.map((placement) => placement.cellIds.join(','))

    expect(placements).toHaveLength(expectedCounts[index])
    expect(new Set(signatures).size).toBe(placements.length)
    expect(signatures).toEqual(piece.placementsOn(board).map((placement) => placement.cellIds.join(',')))
    expect(
      placements.every(
        (placement) =>
          placement.pieceId === piece.id &&
          placement.cellIds.length === piece.shape.cells.length &&
          placement.cellIds.every((id) => id >= 0 && id < board.cells.length),
      ),
    ).toBe(true)
  })
})
