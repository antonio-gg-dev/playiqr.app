import { CampaignProgress } from '@/lib/Trigma/CampaignProgress'

it('CampaignProgress: records a completed level in its dedicated storage key', () => {
  localStorage.clear()

  const progress = new CampaignProgress()
  progress.initialize(window)
  progress.setCompleted(12, true)

  expect(progress.isCompleted(12)).toBe(true)
  expect(progress.completedCount).toBe(1)
  expect(localStorage.getItem(CampaignProgress.STORAGE_KEY)).toBe('[12]')
})

it('CampaignProgress: restores completed levels and allows completion to be reversed', () => {
  localStorage.clear()

  const first = new CampaignProgress()
  first.initialize(window)
  first.setCompleted(20, true)

  const reloaded = new CampaignProgress()
  reloaded.initialize(window)
  reloaded.setCompleted(20, false)

  expect(reloaded.completedLevels).toEqual([])
  expect(reloaded.completedCount).toBe(0)
  expect(localStorage.getItem(CampaignProgress.STORAGE_KEY)).toBe('[]')
})

it('CampaignProgress: ignores malformed or out-of-range saved level IDs', () => {
  localStorage.setItem(CampaignProgress.STORAGE_KEY, '[1,0,101,1.5,"2"]')

  const progress = new CampaignProgress()
  progress.initialize(window)

  expect(progress.completedLevels).toEqual([1])
  expect(() => {
    progress.setCompleted(0, true)
  }).toThrow(RangeError)
  expect(() => {
    progress.setCompleted(101, true)
  }).toThrow(RangeError)
})
