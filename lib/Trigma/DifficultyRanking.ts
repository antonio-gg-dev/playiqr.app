import type { DifficultyAnalyzer } from '@/lib/Trigma/DifficultyAnalyzer'

type Profile = ReturnType<DifficultyAnalyzer['analyze']>

export class DifficultyRanking {
  private static readonly EXTREME_COUNT = 4
  private static readonly MATCHED_PAIR_COUNT = 2

  readonly #ranked: readonly Profile[]

  public constructor(profiles: readonly Profile[]) {
    const keys = profiles.map((profile) => profile.blockedCellIds.join(','))

    if (new Set(keys).size !== keys.length) {
      throw new RangeError('Difficulty profiles must represent distinct challenges')
    }

    this.#ranked = Object.freeze(
      profiles
        .map((profile) =>
          Object.freeze({
            ...profile,
            blockedCellIds: Object.freeze([...profile.blockedCellIds]),
            initial: Object.freeze({
              ...profile.initial,
              regionSizes: Object.freeze([...profile.initial.regionSizes]),
            }),
            simulation: Object.freeze({ ...profile.simulation }),
          }),
        )
        .sort((left, right) => DifficultyRanking.compare(left, right)),
    )

    Object.freeze(this)
  }

  public ranked(): readonly Profile[] {
    return this.#ranked
  }

  public baselineRanked(): readonly Profile[] {
    return Object.freeze(
      [...this.#ranked].sort(
        (left, right) =>
          left.initial.minimumCellPlacements - right.initial.minimumCellPlacements ||
          right.solutionCount - left.solutionCount ||
          DifficultyRanking.compareCells(left.blockedCellIds, right.blockedCellIds),
      ),
    )
  }

  public candidates(): readonly Profile[] {
    const required = DifficultyRanking.EXTREME_COUNT * 2 + DifficultyRanking.MATCHED_PAIR_COUNT * 2

    if (this.#ranked.length < required) {
      throw new RangeError('At least twelve difficulty profiles are required')
    }

    const easiest = this.#ranked.slice(0, DifficultyRanking.EXTREME_COUNT)
    const hardest = this.#ranked.slice(-DifficultyRanking.EXTREME_COUNT).reverse()
    const selected = new Set([
      ...easiest,
      ...hardest,
    ])
    const matched: Profile[] = []

    for (let pair = 0; pair < DifficultyRanking.MATCHED_PAIR_COUNT; pair += 1) {
      const bySolutionCount = new Map<number, { first: number; last: number }>()

      this.#ranked.forEach((profile, index) => {
        if (selected.has(profile)) {
          return
        }

        const existing = bySolutionCount.get(profile.solutionCount)

        bySolutionCount.set(profile.solutionCount, {
          first: existing?.first ?? index,
          last: index,
        })
      })

      const widest = [...bySolutionCount.values()]
        .filter(({ first, last }) => first !== last)
        .sort((left, right) => right.last - right.first - (left.last - left.first) || left.first - right.first)
        .at(0)

      if (widest === undefined) {
        throw new RangeError('Two matched solution-count pairs are unavailable')
      }

      const low = this.#ranked[widest.first]
      const high = this.#ranked[widest.last]

      matched.push(low, high)
      selected.add(low)
      selected.add(high)
    }

    return Object.freeze([
      ...easiest,
      ...hardest,
      ...matched,
    ])
  }

  private static compare(left: Profile, right: Profile): number {
    return (
      left.simulation.medianBacktracks - right.simulation.medianBacktracks ||
      left.simulation.percentile90Backtracks - right.simulation.percentile90Backtracks ||
      left.simulation.trapRate - right.simulation.trapRate ||
      left.simulation.medianDiscretionaryChoices - right.simulation.medianDiscretionaryChoices ||
      DifficultyRanking.compareCells(left.blockedCellIds, right.blockedCellIds)
    )
  }

  private static compareCells(left: readonly number[], right: readonly number[]): number {
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) {
        return left[index] - right[index]
      }
    }

    return 0
  }
}
