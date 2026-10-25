import { execFileSync } from 'node:child_process'

it('rank-trigma: benchmarks known solvable challenges without writing reports', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--experimental-transform-types',
      'scripts/rank-trigma.mjs',
      '--sample-only',
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  )

  expect(output).toContain('Benchmark: 2 known solvable challenges')
  expect(output).not.toContain('Difficulty report:')
})
