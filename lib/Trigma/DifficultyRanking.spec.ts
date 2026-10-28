import { DifficultyAnalyzer } from '@/lib/Trigma/DifficultyAnalyzer'
import { DifficultyRanking } from '@/lib/Trigma/DifficultyRanking'

it('DifficultyRanking: orders profiles and picks twelve distinct candidates with solution-count controls', () => {
  const sample = new DifficultyAnalyzer([
    4,
    7,
    11,
    18,
  ]).analyze(1)
  const profiles = Array.from({ length: 16 }, (_, index) => ({
    ...sample,
    blockedCellIds: [
      index,
      index + 1,
      index + 2,
      index + 3,
    ],
    solutionCount: index % 3 === 0 ? 2 : 1,
    simulation: {
      ...sample.simulation,
      medianBacktracks: index,
      percentile90Backtracks: index,
    },
  }))

  const ranking = new DifficultyRanking([...profiles].reverse())
  const ranked = ranking.ranked()
  const candidates = ranking.candidates()

  expect(ranked.map((profile) => profile.simulation.medianBacktracks)).toEqual(
    Array.from({ length: 16 }, (_, index) => index),
  )
  expect(candidates).toHaveLength(12)
  expect(new Set(candidates.map((profile) => profile.blockedCellIds.join(','))).size).toBe(12)
  expect(candidates.slice(0, 4)).toEqual(ranked.slice(0, 4))
  expect(candidates.slice(4, 8)).toEqual([...ranked.slice(-4)].reverse())
  expect(candidates[8].solutionCount).toBe(candidates[9].solutionCount)
  expect(candidates[10].solutionCount).toBe(candidates[11].solutionCount)
  expect(ranking.baselineRanked()).toHaveLength(16)
})

it('DifficultyRanking: rejects duplicate challenge profiles', () => {
  const profile = new DifficultyAnalyzer([
    4,
    7,
    11,
    18,
  ]).analyze(1)

  expect(
    () =>
      new DifficultyRanking([
        profile,
        profile,
      ]),
  ).toThrow(RangeError)
})
