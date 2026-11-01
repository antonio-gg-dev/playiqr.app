import { ChallengeAnalyzer } from '@/lib/Trigma/ChallengeAnalyzer'
import { CampaignCatalog } from '@/lib/Trigma/CampaignCatalog'
import { CampaignDifficulty } from '@/lib/Shared/CampaignDifficulty'
import { DifficultyAnalyzer } from '@/lib/Trigma/DifficultyAnalyzer'
import { DifficultyRanking } from '@/lib/Trigma/DifficultyRanking'
import { BoardSymmetry } from '@/lib/Trigma/BoardSymmetry'
import { Solver } from '@/lib/Trigma/Solver'
import campaignData from '@/lib/Trigma/campaign-catalog-v1.json'

it('CampaignCatalog: selects one hundred ranked challenges with five separated difficulty groups', () => {
  const blockedConfigurations = new ChallengeAnalyzer().representatives().slice(0, 4180)
  const sample = new DifficultyAnalyzer([
    4,
    7,
    11,
    18,
  ]).analyze(1)
  const profiles = blockedConfigurations.map((blockedCellIds, rank) => ({
    ...sample,
    blockedCellIds,
    simulation: {
      ...sample.simulation,
      medianBacktracks: rank,
      percentile90Backtracks: rank,
      medianDiscretionaryChoices: rank,
    },
  }))
  const catalog = CampaignCatalog.fromRanking(new DifficultyRanking(profiles))
  const levels = catalog.levels()

  expect(levels).toHaveLength(100)
  expect(levels.map(({ level }) => level)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1))
  expect(levels[0].blockedCellIds).toEqual(profiles[0].blockedCellIds)
  expect(levels[19].blockedCellIds).toEqual(profiles[751].blockedCellIds)
  expect(levels[20].blockedCellIds).toEqual(profiles[920].blockedCellIds)
  expect(levels[39].blockedCellIds).toEqual(profiles[1587].blockedCellIds)
  expect(levels[40].blockedCellIds).toEqual(profiles[1756].blockedCellIds)
  expect(levels[79].blockedCellIds).toEqual(profiles[3259].blockedCellIds)
  expect(levels[80].blockedCellIds).toEqual(profiles[3428].blockedCellIds)
  expect(levels[99].blockedCellIds).toEqual(profiles[4179].blockedCellIds)
  expect(levels.map(({ difficulty }) => difficulty)).toEqual([
    ...Array.from({ length: 20 }, () => CampaignDifficulty.Initiate),
    ...Array.from({ length: 20 }, () => CampaignDifficulty.Apprentice),
    ...Array.from({ length: 20 }, () => CampaignDifficulty.Adept),
    ...Array.from({ length: 20 }, () => CampaignDifficulty.Master),
    ...Array.from({ length: 20 }, () => CampaignDifficulty.Virtuoso),
  ])
  expect(new Set(levels.map(({ blockedCellIds }) => blockedCellIds.join(','))).size).toBe(100)
  expect(catalog.toJSON().remainingCanonicalChallengeCount).toBe(4080)
  expect(catalog.level(1)).toEqual(levels[0])
  expect(catalog.level(101)).toBeUndefined()
})

it('CampaignCatalog: requires all canonical solvable challenges before selecting the campaign', () => {
  const sample = new DifficultyAnalyzer([
    4,
    7,
    11,
    18,
  ]).analyze(1)

  expect(() => CampaignCatalog.fromRanking(new DifficultyRanking([sample]))).toThrow(RangeError)
})

it('CampaignCatalog: loads the committed immutable catalog and validates its version', () => {
  const catalog = CampaignCatalog.fromJSON(campaignData)
  const symmetry = new BoardSymmetry()

  expect(catalog.levels()).toHaveLength(100)
  expect(catalog.level(1)?.blockedCellIds).toEqual(campaignData.levels[0].blockedCellIds)
  expect(campaignData.rankedChallengeCount - catalog.levels().length).toBe(4080)
  expect(
    catalog
      .levels()
      .every((entry) => symmetry.equivalents(entry.blockedCellIds)[0].join(',') === entry.blockedCellIds.join(',')),
  ).toBe(true)
  expect(catalog.levels().every((entry) => new Solver(entry.blockedCellIds).countSolutions() > 0)).toBe(true)
  expect(() =>
    CampaignCatalog.fromJSON({
      ...campaignData,
      version: 2,
    }),
  ).toThrow(RangeError)
})
