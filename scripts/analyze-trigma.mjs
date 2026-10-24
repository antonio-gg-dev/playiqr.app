import { log } from 'node:console'
import { writeFile } from 'node:fs/promises'
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

const { ChallengeAnalyzer } = await import('../lib/Trigma/ChallengeAnalyzer.ts')
const { Solver } = await import('../lib/Trigma/Solver.ts')
const analyzer = new ChallengeAnalyzer()
const representatives = analyzer.representatives()
const sampleSize = 200
const timings = []

for (let index = 0; index < sampleSize; index += 1) {
  const representative = representatives[Math.floor((index * (representatives.length - 1)) / (sampleSize - 1))]
  const started = performance.now()
  const solver = new Solver(representative)
  const constructed = performance.now()
  solver.countSolutions()
  timings.push({ constructorMs: constructed - started, countMs: performance.now() - constructed })
}

const averageMs = timings.reduce((total, timing) => total + timing.constructorMs + timing.countMs, 0) / timings.length
const projectedMs = averageMs * representatives.length

log(`Benchmark: ${sampleSize} canonical challenges`)
log(`Average construction and exact count: ${averageMs.toFixed(1)} ms`)
log(`Projected exhaustive time: ${(projectedMs / 1000).toFixed(1)} s`)

if (!process.argv.includes('--sample-only')) {
  const maximumProjectedMs = 10 * 60 * 1000
  if (projectedMs > maximumProjectedMs) {
    throw new Error('Projected analysis exceeds ten minutes; reuse piece placements and benchmark again')
  }

  const started = performance.now()
  const report = analyzer.analyze(representatives)
  if (report.configurations.total !== 58905 || report.challenges.total !== 9990) {
    throw new Error('Analysis did not cover every obstacle configuration exactly once')
  }

  const reportPath = resolve(projectRoot, 'trigma-analysis.json')
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  log(`Exhaustive result: ${(performance.now() - started).toFixed(0)} ms`)
  log(`Configurations: ${JSON.stringify(report.configurations)}`)
  log(`Unique challenges: ${JSON.stringify(report.challenges)}`)
  log(`JSON report: ${reportPath}`)
}
