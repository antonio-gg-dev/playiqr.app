import { expect, test } from '@playwright/test'

type StorybookEntry = {
  exportName?: string
  id: string
  importPath?: string
  type: string
}

const response = await fetch('http://127.0.0.1:6200/index.json')
if (!response.ok) {
  throw new Error(`Failed to load the Storybook index: ${String(response.status)} ${response.statusText}`)
}

const index = (await response.json()) as { entries: Record<string, StorybookEntry> }
const stories = Object.values(index.entries).filter((entry) => entry.type === 'story')
if (stories.length === 0) {
  throw new Error('The Storybook index does not contain any stories')
}
const storybookUrl = new URL(response.url)

for (const story of stories) {
  if (!story.importPath || !story.exportName) {
    throw new Error(`Story ${story.id} is missing its source path or export name`)
  }

  const exportName = story.exportName
  const sourcePath = story.importPath.replace(/^\.\//, '')
  const sourceParts = sourcePath.split('/')
  const sourceFileName = sourceParts.pop()
  if (!sourceFileName) {
    throw new Error(`Story ${story.id} has an invalid source path: ${story.importPath}`)
  }

  test(`${sourcePath}:${exportName}`, async ({ page }) => {
    const storyPageUrl = new URL('/iframe.html', storybookUrl)
    storyPageUrl.searchParams.set('id', story.id)
    storyPageUrl.searchParams.set('viewMode', 'story')
    await page.goto(storyPageUrl.href)
    await expect(page).toHaveScreenshot([
      ...sourceParts,
      '.snapshots',
      sourceFileName,
      `${exportName}.png`,
    ])
  })
}
