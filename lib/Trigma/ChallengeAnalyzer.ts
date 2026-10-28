import { Board } from '@/lib/Trigma/Board'
import { BoardSymmetry } from '@/lib/Trigma/BoardSymmetry'
import { Solver } from '@/lib/Trigma/Solver'

export class ChallengeAnalyzer {
  readonly #symmetry = new BoardSymmetry()

  public analyze(blockedConfigurations: readonly (readonly number[])[] = this.representatives()) {
    const groupsByCanonical = new Map<string, ReturnType<ChallengeAnalyzer['analyzeConfiguration']>>()

    for (const blockedCellIds of blockedConfigurations) {
      const canonical = this.#symmetry.equivalents(blockedCellIds)[0]
      const key = canonical.join(',')

      if (!groupsByCanonical.has(key)) {
        groupsByCanonical.set(key, this.analyzeConfiguration(canonical))
      }
    }

    const groups = Object.freeze(
      [...groupsByCanonical.values()].sort((left, right) => {
        for (let index = 0; index < left.canonical.length; index += 1) {
          if (left.canonical[index] !== right.canonical[index]) {
            return left.canonical[index] - right.canonical[index]
          }
        }

        return 0
      }),
    )
    const configurations = { total: 0, impossible: 0, oneSolution: 0, multipleSolutions: 0, solvable: 0 }
    const challenges = { total: groups.length, impossible: 0, oneSolution: 0, multipleSolutions: 0, solvable: 0 }

    for (const group of groups) {
      const size = group.equivalents.length
      configurations.total += size

      if (group.solutionCount === 0) {
        configurations.impossible += size
        challenges.impossible += 1
      } else if (group.solutionCount === 1) {
        configurations.oneSolution += size
        challenges.oneSolution += 1
      } else {
        configurations.multipleSolutions += size
        challenges.multipleSolutions += 1
      }
    }

    configurations.solvable = configurations.oneSolution + configurations.multipleSolutions
    challenges.solvable = challenges.oneSolution + challenges.multipleSolutions

    return Object.freeze({
      configurations: Object.freeze(configurations),
      challenges: Object.freeze(challenges),
      groups,
    })
  }

  public analyzeConfiguration(blockedCellIds: readonly number[]) {
    const equivalents = this.#symmetry.equivalents(blockedCellIds)
    const canonical = equivalents[0]

    return Object.freeze({
      canonical,
      equivalents,
      solutionCount: new Solver(canonical).countSolutions(),
    })
  }

  public representatives(): readonly (readonly number[])[] {
    const cellCount = new Board().cells.length
    const representatives: (readonly number[])[] = []

    for (let first = 0; first < cellCount - 3; first += 1) {
      for (let second = first + 1; second < cellCount - 2; second += 1) {
        for (let third = second + 1; third < cellCount - 1; third += 1) {
          for (let fourth = third + 1; fourth < cellCount; fourth += 1) {
            const ids = [
              first,
              second,
              third,
              fourth,
            ]
            const canonical = this.#symmetry.equivalents(ids)[0]

            if (ids.every((id, index) => id === canonical[index])) {
              representatives.push(Object.freeze(ids))
            }
          }
        }
      }
    }

    return Object.freeze(representatives)
  }
}
