import { ChallengeAnalyzer } from '@/lib/Trigma/ChallengeAnalyzer'
import { BoardSymmetry } from '@/lib/Trigma/BoardSymmetry'
import { Solver } from '@/lib/Trigma/Solver'

it('ChallengeAnalyzer: enumerates exactly one canonical representative per obstacle orbit', () => {
  const representatives = new ChallengeAnalyzer().representatives()

  expect(representatives).toHaveLength(9990)
  expect(representatives[0]).toEqual([
    0,
    1,
    2,
    3,
  ])
  expect(new Set(representatives.map((ids) => ids.join(','))).size).toBe(representatives.length)
})

it('ChallengeAnalyzer: symmetry groups partition all 58,905 obstacle configurations', () => {
  const representatives = new ChallengeAnalyzer().representatives()
  const symmetry = new BoardSymmetry()
  const allConfigurations = new Set<string>()
  let threeMemberGroups = 0

  for (const representative of representatives) {
    const equivalents = symmetry.equivalents(representative)

    expect(equivalents[0]).toEqual(representative)
    expect([
      3,
      6,
    ]).toContain(equivalents.length)

    if (equivalents.length === 3) {
      threeMemberGroups += 1
    }

    for (const ids of equivalents) {
      const key = ids.join(',')

      expect(allConfigurations.has(key)).toBe(false)

      allConfigurations.add(key)
    }
  }

  expect(threeMemberGroups).toBe(345)
  expect(allConfigurations.size).toBe(58905)
})

it('ChallengeAnalyzer: reports exact solution counts for impossible, unique, and multiple challenges', () => {
  const analyzer = new ChallengeAnalyzer()

  expect(
    analyzer.analyzeConfiguration([
      1,
      7,
      14,
      29,
    ]).solutionCount,
  ).toBe(0)
  expect(
    analyzer.analyzeConfiguration([
      4,
      7,
      11,
      18,
    ]).solutionCount,
  ).toBe(1)

  const multiple = analyzer.analyzeConfiguration([
    0,
    1,
    2,
    3,
  ])

  expect(multiple.solutionCount).toBeGreaterThan(1)
  expect(multiple.equivalents).toHaveLength(3)
  expect(multiple.canonical).toEqual([
    0,
    1,
    2,
    3,
  ])
})

it('ChallengeAnalyzer: equivalent obstacles have the same exact solution count', () => {
  const symmetry = new BoardSymmetry()

  for (const blocked of [
    [
      4,
      7,
      11,
      18,
    ],
    [
      0,
      1,
      2,
      3,
    ],
  ]) {
    const counts = symmetry.equivalents(blocked).map((ids) => new Solver(ids).countSolutions())

    expect(new Set(counts).size).toBe(1)
  }
})

it('ChallengeAnalyzer: weights solution categories by symmetry orbit size', () => {
  const analyzer = new ChallengeAnalyzer()
  const blocked = [
    [
      1,
      7,
      14,
      29,
    ],
    [
      4,
      7,
      11,
      18,
    ],
    [
      0,
      1,
      2,
      3,
    ],
  ]

  const report = analyzer.analyze(blocked)

  expect(report.groups).toHaveLength(3)
  expect(report.challenges).toEqual({
    total: 3,
    impossible: 1,
    oneSolution: 1,
    multipleSolutions: 1,
    solvable: 2,
  })
  expect(report.configurations.total).toBe(report.groups.reduce((total, group) => total + group.equivalents.length, 0))
  expect(report.configurations.impossible).toBe(analyzer.analyzeConfiguration(blocked[0]).equivalents.length)
  expect(report.configurations.oneSolution).toBe(analyzer.analyzeConfiguration(blocked[1]).equivalents.length)
  expect(report.configurations.multipleSolutions).toBe(analyzer.analyzeConfiguration(blocked[2]).equivalents.length)
  expect(report.configurations.solvable).toBe(
    report.configurations.oneSolution + report.configurations.multipleSolutions,
  )
})
