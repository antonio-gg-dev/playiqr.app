import { BoardSymmetry } from '@/lib/Trigma/BoardSymmetry'
import { CampaignDifficulty } from '@/lib/Shared/CampaignDifficulty'
import { DifficultyRanking } from '@/lib/Trigma/DifficultyRanking'
type CampaignLevel = Readonly<{
  level: number
  blockedCellIds: readonly number[]
  difficulty: CampaignDifficulty
}>
type CatalogData = Readonly<{
  version: number
  rankedChallengeCount: number
  remainingCanonicalChallengeCount: number
  selection: Readonly<{
    difficultyOrder: string
    groups: number
    levelsPerGroup: number
    edgeMargin: number
    forcedExtremes: readonly number[]
  }>
  levels: readonly CampaignLevel[]
}>

export class CampaignCatalog {
  private static readonly LEVEL_COUNT = 100
  private static readonly LEVELS_PER_DIFFICULTY = 20
  private static readonly DIFFICULTY_COUNT = 5
  private static readonly RANKED_CHALLENGE_COUNT = 4180
  private static readonly GROUP_SIZE = CampaignCatalog.RANKED_CHALLENGE_COUNT / CampaignCatalog.DIFFICULTY_COUNT
  private static readonly DAILY_CHALLENGE_COUNT = CampaignCatalog.RANKED_CHALLENGE_COUNT - CampaignCatalog.LEVEL_COUNT
  private static readonly EDGE_MARGIN = 0.1
  private static readonly VERSION = 1
  private static readonly RANKING_METHOD =
    'medianBacktracks, percentile90Backtracks, trapRate, medianDiscretionaryChoices, blockedCellIds'
  private static readonly DIFFICULTIES = [
    CampaignDifficulty.Initiate,
    CampaignDifficulty.Apprentice,
    CampaignDifficulty.Adept,
    CampaignDifficulty.Master,
    CampaignDifficulty.Virtuoso,
  ]
  private static readonly SYMMETRY = new BoardSymmetry()

  private readonly entries: readonly CampaignLevel[]

  public constructor(levels: readonly CampaignLevel[]) {
    if (levels.length !== CampaignCatalog.LEVEL_COUNT) {
      throw new RangeError('A campaign catalog must contain exactly one hundred levels')
    }

    const canonicalKeys = new Set<string>()
    this.entries = Object.freeze(
      levels.map((entry, index) => {
        const expectedDifficulty =
          CampaignCatalog.DIFFICULTIES[Math.floor(index / CampaignCatalog.LEVELS_PER_DIFFICULTY)]

        if (entry.level !== index + 1 || entry.difficulty !== expectedDifficulty) {
          throw new RangeError('Campaign levels must be consecutive and ordered by difficulty')
        }

        if (
          entry.blockedCellIds.length !== 4 ||
          new Set(entry.blockedCellIds).size !== 4 ||
          entry.blockedCellIds.some((id) => !Number.isSafeInteger(id) || id < 0 || id > 35)
        ) {
          throw new RangeError('Each campaign level must contain four distinct board cell IDs')
        }

        const key = entry.blockedCellIds.join(',')

        if (canonicalKeys.has(key)) {
          throw new RangeError('Campaign levels must be unique across board symmetries')
        }

        canonicalKeys.add(key)

        return Object.freeze({
          level: entry.level,
          blockedCellIds: Object.freeze([...entry.blockedCellIds]),
          difficulty: entry.difficulty,
        })
      }),
    )

    Object.freeze(this)
  }

  public static fromRanking(ranking: DifficultyRanking): CampaignCatalog {
    const ranked = ranking.ranked()

    if (ranked.length !== CampaignCatalog.RANKED_CHALLENGE_COUNT) {
      throw new RangeError('The campaign requires all 4,180 canonical solvable challenge profiles')
    }

    const canonicalKeys = new Set<string>()

    for (const profile of ranked) {
      if (profile.solutionCount <= 0) {
        throw new RangeError('Campaign rankings must contain only solvable challenges')
      }

      const equivalents = CampaignCatalog.SYMMETRY.equivalents(profile.blockedCellIds)
      const canonical = equivalents[0]
      const key = canonical.join(',')

      if (key !== profile.blockedCellIds.join(',') || canonicalKeys.has(key)) {
        throw new RangeError('Campaign rankings must contain distinct canonical challenges')
      }

      canonicalKeys.add(key)
    }

    const levels: CampaignLevel[] = []

    for (let groupIndex = 0; groupIndex < CampaignCatalog.DIFFICULTY_COUNT; groupIndex += 1) {
      const groupStart = groupIndex * CampaignCatalog.GROUP_SIZE
      const firstInteriorOffset = Math.ceil(CampaignCatalog.GROUP_SIZE * CampaignCatalog.EDGE_MARGIN)
      const interiorEndOffset = Math.floor(CampaignCatalog.GROUP_SIZE * (1 - CampaignCatalog.EDGE_MARGIN))
      const interiorProfiles = ranked.slice(groupStart + firstInteriorOffset, groupStart + interiorEndOffset)
      const selected = Array.from(
        { length: CampaignCatalog.LEVELS_PER_DIFFICULTY },
        (_, index) =>
          interiorProfiles[
            Math.round((index * (interiorProfiles.length - 1)) / (CampaignCatalog.LEVELS_PER_DIFFICULTY - 1))
          ],
      )

      if (groupIndex === 0) {
        selected[0] = ranked[0]
      }

      if (groupIndex === CampaignCatalog.DIFFICULTY_COUNT - 1) {
        selected[selected.length - 1] = ranked[ranked.length - 1]
      }

      for (const profile of selected) {
        levels.push({
          level: levels.length + 1,
          blockedCellIds: profile.blockedCellIds,
          difficulty: CampaignCatalog.DIFFICULTIES[groupIndex],
        })
      }
    }

    if (ranked.length - levels.length !== CampaignCatalog.DAILY_CHALLENGE_COUNT) {
      throw new RangeError('Campaign exclusion must leave exactly 4,080 canonical challenges')
    }

    return new CampaignCatalog(levels)
  }

  public static fromJSON(data: unknown): CampaignCatalog {
    if (!CampaignCatalog.isCatalogData(data)) {
      throw new RangeError('The campaign catalog data is invalid or uses an unsupported version')
    }

    return new CampaignCatalog(data.levels)
  }

  public levels(): readonly CampaignLevel[] {
    return this.entries
  }

  public level(level: number): CampaignLevel | undefined {
    if (!Number.isSafeInteger(level) || level < 1 || level > CampaignCatalog.LEVEL_COUNT) {
      return undefined
    }

    return this.entries[level - 1]
  }

  public toJSON(): CatalogData {
    return {
      version: CampaignCatalog.VERSION,
      rankedChallengeCount: CampaignCatalog.RANKED_CHALLENGE_COUNT,
      remainingCanonicalChallengeCount: CampaignCatalog.DAILY_CHALLENGE_COUNT,
      selection: {
        difficultyOrder: CampaignCatalog.RANKING_METHOD,
        groups: CampaignCatalog.DIFFICULTY_COUNT,
        levelsPerGroup: CampaignCatalog.LEVELS_PER_DIFFICULTY,
        edgeMargin: CampaignCatalog.EDGE_MARGIN,
        forcedExtremes: [
          1,
          CampaignCatalog.RANKED_CHALLENGE_COUNT,
        ],
      },
      levels: this.entries,
    }
  }

  private static isCatalogData(data: unknown): data is CatalogData {
    if (typeof data !== 'object' || data === null || !('selection' in data) || !('levels' in data)) {
      return false
    }

    const catalog = data as Record<string, unknown>
    const selection = catalog.selection

    if (
      typeof selection !== 'object' ||
      selection === null ||
      !Array.isArray(catalog.levels) ||
      !Array.isArray((selection as CatalogData['selection']).forcedExtremes)
    ) {
      return false
    }

    const metadata = selection as CatalogData['selection']

    return (
      catalog.version === CampaignCatalog.VERSION &&
      catalog.rankedChallengeCount === CampaignCatalog.RANKED_CHALLENGE_COUNT &&
      catalog.remainingCanonicalChallengeCount === CampaignCatalog.DAILY_CHALLENGE_COUNT &&
      metadata.difficultyOrder === CampaignCatalog.RANKING_METHOD &&
      metadata.groups === CampaignCatalog.DIFFICULTY_COUNT &&
      metadata.levelsPerGroup === CampaignCatalog.LEVELS_PER_DIFFICULTY &&
      metadata.edgeMargin === CampaignCatalog.EDGE_MARGIN &&
      metadata.forcedExtremes.length === 2 &&
      metadata.forcedExtremes[0] === 1 &&
      metadata.forcedExtremes[1] === CampaignCatalog.RANKED_CHALLENGE_COUNT
    )
  }
}
