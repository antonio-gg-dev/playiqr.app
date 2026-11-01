import { reactive, type InjectionKey } from 'vue'

export class CampaignProgress {
  public static readonly KEY: InjectionKey<CampaignProgress> = Symbol('IQR Trigma campaign progress')
  public static readonly STORAGE_KEY = 'trigma.campaign'

  private readonly state = reactive({
    completedLevels: [] as number[],
  })

  private browser?: Window

  public get completedLevels(): readonly number[] {
    return Object.freeze([...this.state.completedLevels])
  }

  public get completedCount(): number {
    return this.state.completedLevels.length
  }

  public initialize(browser: Window): void {
    this.browser = browser
    this.state.completedLevels = this.readCompletedLevels()
  }

  public isCompleted(level: number): boolean {
    this.validateLevel(level)

    return this.state.completedLevels.includes(level)
  }

  public setCompleted(level: number, completed: boolean): void {
    this.validateLevel(level)

    const alreadyCompleted = this.state.completedLevels.includes(level)

    if (completed === alreadyCompleted) {
      return
    }

    this.state.completedLevels = completed
      ? [
          ...this.state.completedLevels,
          level,
        ].sort((left, right) => left - right)
      : this.state.completedLevels.filter((completedLevel) => completedLevel !== level)

    this.persist()
  }

  public dispose(): void {
    this.browser = undefined
  }

  private readCompletedLevels(): number[] {
    try {
      const stored = this.browser?.localStorage.getItem(CampaignProgress.STORAGE_KEY)

      if (stored === null || stored === undefined) {
        return []
      }

      const value: unknown = JSON.parse(stored)

      if (!Array.isArray(value)) {
        return []
      }

      return [...new Set(value.filter((level): level is number => this.isValidLevel(level)))].sort(
        (left, right) => left - right,
      )
    } catch {
      return []
    }
  }

  private persist(): void {
    try {
      this.browser?.localStorage.setItem(CampaignProgress.STORAGE_KEY, JSON.stringify(this.state.completedLevels))
    } catch {
      return
    }
  }

  private validateLevel(level: number): void {
    if (!this.isValidLevel(level)) {
      throw new RangeError('A campaign level must be an integer between 1 and 100')
    }
  }

  private isValidLevel(level: unknown): level is number {
    return typeof level === 'number' && Number.isSafeInteger(level) && level >= 1 && level <= 100
  }
}
