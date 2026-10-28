import { log } from 'node:console'
import { readFile, writeFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import process from 'node:process'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(pathToFileURL(resolve(projectRoot, `${specifier.slice(2)}.ts`)).href, context)
    }

    return nextResolve(specifier, context)
  },
})

const { Board } = await import('../lib/Trigma/Board.ts')
const { DifficultyAnalyzer } = await import('../lib/Trigma/DifficultyAnalyzer.ts')
const { DifficultyRanking } = await import('../lib/Trigma/DifficultyRanking.ts')
const sampleChallenges = [
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
const sampleStart = performance.now()

for (const blocked of sampleChallenges) {
  new DifficultyAnalyzer(blocked).analyze()
}

log(
  `Benchmark: ${sampleChallenges.length} known solvable challenges in ${(performance.now() - sampleStart).toFixed(0)} ms`,
)

if (!process.argv.includes('--sample-only')) {
  const sourcePath = resolve(projectRoot, 'trigma-analysis.json')
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const groups = source.groups.filter((group) => group.solutionCount > 0)

  if (source.challenges.solvable !== 4180 || groups.length !== 4180) {
    throw new Error('The exhaustive Trigma report must contain exactly 4,180 solvable challenges')
  }

  const benchmarkCount = 50
  const benchmarkGroups = Array.from(
    { length: benchmarkCount },
    (_, index) => groups[Math.floor((index * (groups.length - 1)) / (benchmarkCount - 1))],
  )
  const benchmarkStart = performance.now()

  for (const group of benchmarkGroups) {
    new DifficultyAnalyzer(group.canonical).analyze()
  }

  const projectedSeconds = ((performance.now() - benchmarkStart) * groups.length) / benchmarkCount / 1000

  log(`Projected full difficulty analysis: ${projectedSeconds.toFixed(1)} s`)

  const started = performance.now()
  const profiles = groups.map((group) => {
    const profile = new DifficultyAnalyzer(group.canonical).analyze()

    if (profile.solutionCount !== group.solutionCount) {
      throw new Error(`Solution count changed for challenge ${group.canonical.join(',')}`)
    }

    return profile
  })
  const ranking = new DifficultyRanking(profiles)
  const baselineRanks = new Map(
    ranking.baselineRanked().map((profile, index) => [
      profile.blockedCellIds.join(','),
      index + 1,
    ]),
  )
  const ranked = ranking.ranked().map((profile, index) => ({
    rank: index + 1,
    baselineRank: baselineRanks.get(profile.blockedCellIds.join(',')),
    ...profile,
  }))
  const byKey = new Map(
    ranked.map((entry) => [
      entry.blockedCellIds.join(','),
      entry,
    ]),
  )
  const selected = ranking.candidates().map((profile, index) => ({
    profile,
    purpose: index < 4 ? 'easy extreme' : index < 8 ? 'hard extreme' : 'solution-count match',
  }))
  const hash = (ids) => ids.reduce((value, id) => (Math.imul(value ^ (id + 1), 1664525) + 1013904223) >>> 0, 1)
  const shuffled = selected.sort(
    (left, right) => hash(left.profile.blockedCellIds) - hash(right.profile.blockedCellIds),
  )
  const candidates = shuffled.map(({ profile, purpose }, index) => ({
    code: 'T' + String(index + 1).padStart(2, '0'),
    purpose,
    ...byKey.get(profile.blockedCellIds.join(',')),
  }))
  const blind = candidates.map(({ code, blockedCellIds }) => {
    const boardRows = []
    let cellId = 0

    for (let row = 0; row < Board.SIDE_LENGTH; row += 1) {
      const cells = []

      for (let column = 0; column < 2 * row + 1; column += 1) {
        cells.push(blockedCellIds.includes(cellId) ? '#' : '.')

        cellId += 1
      }

      boardRows.push(' '.repeat(Board.SIDE_LENGTH - row - 1) + cells.join(' '))
    }

    return {
      code,
      blockedCellIds,
      boardRows,
    }
  })

  const reportPath = resolve(projectRoot, 'trigma-difficulty.json')
  const blindPath = resolve(projectRoot, 'trigma-blind-trial.json')

  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        method: {
          simulationRuns: 32,
          ranking: 'median backtracks, p90 backtracks, trap rate, median discretionary choices',
        },
        challenges: ranked,
        candidates,
      },
      null,
      2,
    )}\n`,
  )
  await writeFile(blindPath, `${JSON.stringify(blind, null, 2)}\n`)
  log(`Difficulty analysis: ${(performance.now() - started).toFixed(0)} ms`)
  log(`Difficulty report: ${reportPath}`)
  log(`Blind trial: ${blindPath}`)
}
