import { expect, test } from '@playwright/test'

type StorybookEntry = {
  exportName?: string
  id: string
  importPath?: string
  type: string
}

test('matches a screenshot for every Storybook story', async ({ page, request }) => {
  const response = await request.get('/index.json')
  expect(response.ok()).toBe(true)

  const index = (await response.json()) as { entries: Record<string, StorybookEntry> }
  const stories = Object.values(index.entries).filter((entry) => entry.type === 'story')
  expect(stories.length).toBeGreaterThan(0)
  const storybookUrl = new URL(response.url())

  for (const story of stories) {
    if (!story.importPath || !story.exportName) {
      throw new Error(`Story ${story.id} is missing its source path or export name`)
    }

    const sourcePath = story.importPath.replace(/^\.\//, '')
    const sourceParts = sourcePath.split('/')
    const sourceFileName = sourceParts.pop()
    if (!sourceFileName) {
      throw new Error(`Story ${story.id} has an invalid source path: ${story.importPath}`)
    }

    const storyPageUrl = new URL('/iframe.html', storybookUrl)
    storyPageUrl.searchParams.set('id', story.id)
    storyPageUrl.searchParams.set('viewMode', 'story')
    await page.goto(storyPageUrl.href)
    await expect(page).toHaveScreenshot([
      ...sourceParts,
      '.snapshots',
      sourceFileName,
      `${story.exportName}.png`,
    ])
  }
})
