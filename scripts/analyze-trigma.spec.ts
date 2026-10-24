import { execFileSync } from 'node:child_process'

it('analyze-trigma: benchmarks canonical challenges before the exhaustive analysis', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--experimental-transform-types',
      'scripts/analyze-trigma.mjs',
      '--sample-only',
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  )

  expect(output).toContain('Benchmark: 200 canonical challenges')
  expect(output).toContain('Projected exhaustive time:')
  expect(output).not.toContain('Exhaustive result:')
})
