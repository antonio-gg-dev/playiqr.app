import { DifficultyAnalyzer } from '@/lib/Trigma/DifficultyAnalyzer'
import { BoardSymmetry } from '@/lib/Trigma/BoardSymmetry'

it('DifficultyAnalyzer: reports repeatable local restrictions and solution counts', () => {
  const blocked = [
    4,
    7,
    11,
    18,
  ]

  const first = new DifficultyAnalyzer(blocked).analyze(4)
  const second = new DifficultyAnalyzer(blocked).analyze(4)

  expect(first).toEqual(second)
  expect(first.blockedCellIds).toEqual(blocked)
  expect(first.solutionCount).toBe(1)
  expect(first.initial.minimumCellPlacements).toBeGreaterThan(0)
  expect(first.initial.minimumCellPieceChoices).toBeGreaterThan(0)
  expect(first.simulation.runs).toBe(4)
  expect(first.simulation.completedRuns).toBe(4)
  expect(first.simulation.medianBacktracks).toBeGreaterThanOrEqual(0)
  expect(first.simulation.percentile90Backtracks).toBeGreaterThanOrEqual(first.simulation.medianBacktracks)
  expect(first.simulation.medianDiscretionaryChoices).toBeGreaterThanOrEqual(0)
  expect(first.simulation.trapRate).toBeGreaterThan(0)
})

it('DifficultyAnalyzer: rejects impossible challenges and invalid run counts', () => {
  expect(() =>
    new DifficultyAnalyzer([
      1,
      7,
      14,
      29,
    ]).analyze(),
  ).toThrow(RangeError)
  expect(() =>
    new DifficultyAnalyzer([
      4,
      7,
      11,
      18,
    ]).analyze(0),
  ).toThrow(RangeError)
})

it('DifficultyAnalyzer: keeps the physically easy many-solution challenges out of deep trial-and-error', () => {
  const first = new DifficultyAnalyzer([
    0,
    1,
    2,
    3,
  ]).analyze()
  const second = new DifficultyAnalyzer([
    0,
    1,
    2,
    25,
  ]).analyze()

  expect(first.solutionCount).toBe(262)
  expect(second.solutionCount).toBe(246)
  expect(first.simulation.medianBacktracks).toBeLessThan(30)
  expect(second.simulation.medianBacktracks).toBeLessThan(30)
})

it('DifficultyAnalyzer: preserves geometric restrictions across equivalent obstacle layouts', () => {
  const equivalents = new BoardSymmetry().equivalents([
    4,
    7,
    11,
    18,
  ])

  const profiles = equivalents.map((blocked) => new DifficultyAnalyzer(blocked).analyze(1))

  expect(new Set(profiles.map((profile) => profile.solutionCount))).toEqual(new Set([1]))
  expect(profiles.map((profile) => profile.initial)).toEqual(profiles.map(() => profiles[0].initial))
})
