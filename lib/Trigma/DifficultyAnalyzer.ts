import { Board } from '@/lib/Trigma/Board'
import { Piece } from '@/lib/Trigma/Piece'
import { Solver } from '@/lib/Trigma/Solver'
import type { Placement } from '@/lib/Trigma/Placement'

type Row = Readonly<{
  key: string
  pieceIndex: number
  cellIds: readonly number[]
  mask: bigint
}>

type StateOptions = Readonly<{
  byCell: readonly (readonly Row[])[]
  byPiece: readonly (readonly Row[])[]
  impossible: boolean
}>

type Trace = {
  backtracks: number
  discretionaryChoices: number
  forcedPlacements: number
  forcedBeforeFirstChoice: number
  deceptiveAlternatives: number
  inspectedAlternatives: number
}

export class DifficultyAnalyzer {
  private static readonly DEFAULT_RUNS = 32
  private static readonly RANDOM_MULTIPLIER = 1664525
  private static readonly RANDOM_INCREMENT = 1013904223
  private static readonly RANDOM_RANGE = 2 ** 32
  private static readonly BOARD = new Board()
  private static readonly PIECES = Piece.all()
  private static readonly ALL_PIECES_MASK = (1 << DifficultyAnalyzer.PIECES.length) - 1
  private static readonly NEIGHBORS = DifficultyAnalyzer.BOARD.cells.map((cell) =>
    DifficultyAnalyzer.BOARD.neighbors(cell).map((neighbor) => {
      const id = DifficultyAnalyzer.BOARD.cellId(neighbor)

      if (id === undefined) {
        throw new RangeError('A board neighbor must have a cell ID')
      }

      return id
    }),
  )

  private static readonly ROWS: readonly Row[] = Object.freeze(
    DifficultyAnalyzer.PIECES.flatMap((piece, pieceIndex) =>
      piece.placementsOn(DifficultyAnalyzer.BOARD).map((placement) =>
        Object.freeze({
          key: DifficultyAnalyzer.placementKey(placement),
          pieceIndex,
          cellIds: placement.cellIds,
          mask: DifficultyAnalyzer.cellMask(placement.cellIds),
        }),
      ),
    ),
  )

  readonly #blockedCellIds: readonly number[]
  readonly #blockedMask: bigint
  readonly #rows: readonly Row[]
  readonly #solver: Solver
  readonly #optionsCache = new Map<string, StateOptions>()

  public constructor(blockedCellIds: readonly number[]) {
    this.#solver = new Solver(blockedCellIds)
    this.#blockedCellIds = Object.freeze([...blockedCellIds].sort((left, right) => left - right))
    this.#blockedMask = DifficultyAnalyzer.cellMask(this.#blockedCellIds)
    this.#rows = Object.freeze(DifficultyAnalyzer.ROWS.filter((row) => (row.mask & this.#blockedMask) === 0n))

    Object.freeze(this)
  }

  public analyze(runs = DifficultyAnalyzer.DEFAULT_RUNS) {
    if (!Number.isSafeInteger(runs) || runs <= 0) {
      throw new RangeError('Simulation runs must be a positive safe integer')
    }

    const solutions = this.#solver.findSolutions()

    if (solutions.length === 0) {
      throw new RangeError('Challenge must have at least one solution')
    }

    const solutionKeys = solutions.map(
      (solution) => new Set(solution.map((placement) => DifficultyAnalyzer.placementKey(placement))),
    )
    const initial = this.options(this.#blockedMask, 0)
    const freeCellOptions = initial.byCell.filter((_, id) => !this.#blockedCellIds.includes(id))
    const traces = Array.from({ length: runs }, (_, index) => this.simulate(index, solutionKeys))
    const backtracks = traces.map((trace) => trace.backtracks)
    const choices = traces.map((trace) => trace.discretionaryChoices)
    const forced = traces.map((trace) => trace.forcedPlacements)
    const deceptive = traces.reduce((total, trace) => total + trace.deceptiveAlternatives, 0)
    const inspected = traces.reduce((total, trace) => total + trace.inspectedAlternatives, 0)

    return Object.freeze({
      blockedCellIds: this.#blockedCellIds,
      solutionCount: solutions.length,
      initial: Object.freeze({
        minimumCellPlacements: Math.min(...freeCellOptions.map((options) => options.length)),
        minimumCellPieceChoices: Math.min(
          ...freeCellOptions.map((options) => new Set(options.map((option) => option.pieceIndex)).size),
        ),
        forcedCells: freeCellOptions.filter((options) => options.length === 1).length,
        forcedPieces: initial.byPiece.filter((options) => options.length === 1).length,
        regionSizes: Object.freeze(this.regionSizes(this.#blockedMask)),
      }),
      simulation: Object.freeze({
        runs,
        completedRuns: traces.length,
        medianBacktracks: DifficultyAnalyzer.median(backtracks),
        percentile90Backtracks: DifficultyAnalyzer.percentile90(backtracks),
        medianDiscretionaryChoices: DifficultyAnalyzer.median(choices),
        medianForcedPlacements: DifficultyAnalyzer.median(forced),
        medianForcedBeforeFirstChoice: DifficultyAnalyzer.median(traces.map((trace) => trace.forcedBeforeFirstChoice)),
        trapRate: inspected === 0 ? 0 : deceptive / inspected,
      }),
    })
  }

  private simulate(run: number, solutions: readonly ReadonlySet<string>[]): Trace {
    let randomState = this.#blockedCellIds.reduce(
      (seed, id) => Math.imul(seed ^ (id + 1), DifficultyAnalyzer.RANDOM_MULTIPLIER) >>> 0,
      run + 1,
    )
    const random = (): number => {
      randomState =
        (Math.imul(randomState, DifficultyAnalyzer.RANDOM_MULTIPLIER) + DifficultyAnalyzer.RANDOM_INCREMENT) >>> 0

      return randomState / DifficultyAnalyzer.RANDOM_RANGE
    }
    const trace: Trace = {
      backtracks: 0,
      discretionaryChoices: 0,
      forcedPlacements: 0,
      forcedBeforeFirstChoice: 0,
      deceptiveAlternatives: 0,
      inspectedAlternatives: 0,
    }

    const visit = (occupied: bigint, usedPieces: number, chosen: readonly string[]): boolean => {
      if (usedPieces === DifficultyAnalyzer.ALL_PIECES_MASK) {
        return true
      }

      const state = this.options(occupied, usedPieces)

      if (state.impossible) {
        return false
      }

      const forced =
        state.byCell.find((options, id) => (occupied & (1n << BigInt(id))) === 0n && options.length === 1)?.[0] ??
        state.byPiece.find((options, index) => (usedPieces & (1 << index)) === 0 && options.length === 1)?.[0]

      if (forced !== undefined) {
        trace.forcedPlacements += 1

        if (trace.discretionaryChoices === 0) {
          trace.forcedBeforeFirstChoice += 1
        }

        return visit(occupied | forced.mask, usedPieces | (1 << forced.pieceIndex), [
          ...chosen,
          forced.key,
        ])
      }

      const minimum = Math.min(
        ...state.byCell
          .filter((options, id) => (occupied & (1n << BigInt(id))) === 0n)
          .map((options) => options.length),
      )
      const cells = state.byCell.flatMap((options, id) =>
        (occupied & (1n << BigInt(id))) === 0n && options.length === minimum ? [id] : [],
      )
      const selectedCell = cells[Math.floor(random() * cells.length)]
      const alternatives = state.byCell[selectedCell]
      const compatible = solutions.filter((solution) => chosen.every((key) => solution.has(key)))

      if (compatible.length > 0) {
        trace.inspectedAlternatives += alternatives.length
        trace.deceptiveAlternatives += alternatives.filter(
          (row) => !compatible.some((solution) => solution.has(row.key)),
        ).length
      }

      const ordered = alternatives
        .map((row) => {
          const next = this.options(occupied | row.mask, usedPieces | (1 << row.pieceIndex))

          return {
            row,
            viable: !next.impossible,
            flexibility: next.byPiece.reduce((total, options) => total + options.length, 0),
            tie: random(),
          }
        })
        .sort(
          (left, right) =>
            Number(right.viable) - Number(left.viable) || right.flexibility - left.flexibility || left.tie - right.tie,
        )

      for (const { row } of ordered) {
        trace.discretionaryChoices += 1

        if (
          visit(occupied | row.mask, usedPieces | (1 << row.pieceIndex), [
            ...chosen,
            row.key,
          ])
        ) {
          return true
        }

        trace.backtracks += 1
      }

      return false
    }

    if (!visit(this.#blockedMask, 0, [])) {
      throw new Error('Simulation failed to find a known solution')
    }

    return trace
  }

  private options(occupied: bigint, usedPieces: number): StateOptions {
    const key = [
      occupied,
      usedPieces,
    ].join(':')
    const cached = this.#optionsCache.get(key)

    if (cached !== undefined) {
      return cached
    }

    const byCell: Row[][] = Array.from({ length: DifficultyAnalyzer.BOARD.cells.length }, () => [])
    const byPiece: Row[][] = Array.from({ length: DifficultyAnalyzer.PIECES.length }, () => [])

    for (const row of this.#rows) {
      if ((usedPieces & (1 << row.pieceIndex)) !== 0 || (occupied & row.mask) !== 0n) {
        continue
      }

      byPiece[row.pieceIndex].push(row)

      for (const id of row.cellIds) {
        byCell[id].push(row)
      }
    }

    const impossible =
      byCell.some((options, id) => (occupied & (1n << BigInt(id))) === 0n && options.length === 0) ||
      byPiece.some((options, index) => (usedPieces & (1 << index)) === 0 && options.length === 0) ||
      !this.regionsFit(this.regionSizes(occupied), usedPieces)
    const result = {
      byCell,
      byPiece,
      impossible,
    }

    this.#optionsCache.set(key, result)

    return result
  }

  private regionSizes(occupied: bigint): number[] {
    const seen = new Set<number>()
    const sizes: number[] = []

    for (let id = 0; id < DifficultyAnalyzer.BOARD.cells.length; id += 1) {
      if ((occupied & (1n << BigInt(id))) !== 0n || seen.has(id)) {
        continue
      }

      const pending = [id]

      seen.add(id)

      let size = 0

      for (let next = 0; next < pending.length; next += 1) {
        const current = pending[next]

        size += 1

        for (const neighbor of DifficultyAnalyzer.NEIGHBORS[current]) {
          if ((occupied & (1n << BigInt(neighbor))) === 0n && !seen.has(neighbor)) {
            seen.add(neighbor)
            pending.push(neighbor)
          }
        }
      }

      sizes.push(size)
    }

    return sizes.sort((left, right) => left - right)
  }

  private regionsFit(sizes: readonly number[], usedPieces: number): boolean {
    const remaining = DifficultyAnalyzer.PIECES.flatMap((piece, index) =>
      (usedPieces & (1 << index)) === 0 ? [piece.shape.cells.length] : [],
    )
    const filled = sizes.map(() => 0)

    const assign = (pieceIndex: number): boolean => {
      if (pieceIndex === remaining.length) {
        return filled.every((count, index) => count === sizes[index])
      }

      for (let region = 0; region < sizes.length; region += 1) {
        if (filled[region] + remaining[pieceIndex] > sizes[region]) {
          continue
        }

        filled[region] += remaining[pieceIndex]

        if (assign(pieceIndex + 1)) {
          return true
        }

        filled[region] -= remaining[pieceIndex]
      }

      return false
    }

    return assign(0)
  }

  private static cellMask(ids: readonly number[]): bigint {
    return ids.reduce((mask, id) => mask | (1n << BigInt(id)), 0n)
  }

  private static placementKey(placement: Placement): string {
    return [
      placement.pieceId,
      ...placement.cellIds,
    ].join(':')
  }

  private static median(values: readonly number[]): number {
    const sorted = [...values].sort((left, right) => left - right)
    const middle = Math.floor(sorted.length / 2)

    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
  }

  private static percentile90(values: readonly number[]): number {
    const sorted = [...values].sort((left, right) => left - right)

    return sorted[Math.ceil(0.9 * sorted.length) - 1]
  }
}
