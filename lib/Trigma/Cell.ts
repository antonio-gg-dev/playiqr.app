import { CellDirection } from '@/lib/Trigma/CellDirection'

type Point = readonly [
  number,
  number,
]

export class Cell {
  static readonly ROTATION_COUNT = 6
  private static readonly SIDE_VERTEX_COUNT = 2

  readonly a: number
  readonly b: number
  readonly direction: CellDirection

  constructor(a: number, b: number, direction: CellDirection) {
    if (
      !Number.isSafeInteger(a) ||
      !Number.isSafeInteger(b) ||
      !Number.isSafeInteger(a + 1) ||
      !Number.isSafeInteger(b + 1)
    ) {
      throw new RangeError('Cell coordinates must be safe integers')
    }
    if (!Object.values(CellDirection).includes(direction)) {
      throw new RangeError('Cell direction must be up or down')
    }

    this.a = a
    this.b = b
    this.direction = direction
    Object.freeze(this)
  }

  vertices(): readonly [
    Point,
    Point,
    Point,
  ] {
    const { a, b } = this

    return this.direction === CellDirection.Up
      ? [
          [
            a,
            b,
          ],
          [
            a + 1,
            b,
          ],
          [
            a,
            b + 1,
          ],
        ]
      : [
          [
            a + 1,
            b,
          ],
          [
            a,
            b + 1,
          ],
          [
            a + 1,
            b + 1,
          ],
        ]
  }

  equals(other: Cell): boolean {
    return this.a === other.a && this.b === other.b && this.direction === other.direction
  }

  sharesSideWith(other: Cell): boolean {
    if (this.equals(other)) {
      return false
    }

    const otherVertices = other.vertices()

    return (
      this.vertices().filter(
        ([
          a,
          b,
        ]) =>
          otherVertices.some(
            ([
              c,
              d,
            ]) => a === c && b === d,
          ),
      ).length === Cell.SIDE_VERTEX_COUNT
    )
  }

  translated(da: number, db: number): Cell {
    if (!Number.isSafeInteger(da) || !Number.isSafeInteger(db)) {
      throw new RangeError('Cell translation must use safe integers')
    }

    return new Cell(this.a + da, this.b + db, this.direction)
  }

  rotated(): Cell {
    return Cell.fromVertices(
      this.vertices().map(
        ([
          a,
          b,
        ]) =>
          [
            -b,
            a + b,
          ] as Point,
      ),
    )
  }

  reflected(): Cell {
    return Cell.fromVertices(
      this.vertices().map(
        ([
          a,
          b,
        ]) =>
          [
            a + b,
            -b,
          ] as Point,
      ),
    )
  }

  private static fromVertices(vertices: readonly Point[]): Cell {
    const a = Math.min(...vertices.map(([x]) => x))
    const b = Math.min(
      ...vertices.map(
        ([
          ,
          y,
        ]) => y,
      ),
    )
    const matches = (points: readonly Point[]): boolean =>
      points.every(
        ([
          x,
          y,
        ]) =>
          vertices.some(
            ([
              vx,
              vy,
            ]) => x === vx && y === vy,
          ),
      )

    if (
      matches([
        [
          a,
          b,
        ],
        [
          a + 1,
          b,
        ],
        [
          a,
          b + 1,
        ],
      ])
    ) {
      return new Cell(a, b, CellDirection.Up)
    }
    if (
      matches([
        [
          a + 1,
          b,
        ],
        [
          a,
          b + 1,
        ],
        [
          a + 1,
          b + 1,
        ],
      ])
    ) {
      return new Cell(a, b, CellDirection.Down)
    }

    throw new RangeError('Vertices do not form a triangular cell')
  }
}
