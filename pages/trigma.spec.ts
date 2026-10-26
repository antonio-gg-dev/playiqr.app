import { expect, test } from '@playwright/test'

test('shows a Trigma challenge from four blocker IDs in the URL', async ({ page }) => {
  await page.goto('/trigma?b=0,11,21,27')

  const board = page.getByRole('img', { name: /Tablero de Trigma/ })
  await expect(board).toBeVisible()
  await expect(board.locator('polygon')).toHaveCount(36)
  await expect(board.locator('.trigma-board__cell--blocked')).toHaveCount(4)
  for (const id of [
    0,
    11,
    21,
    27,
  ]) {
    await expect(board.locator(`[data-cell-id="${id.toString()}"]`)).toHaveClass(/trigma-board__cell--blocked/)
  }
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect(page).toHaveScreenshot('trigma-challenge.png')
})

test('accepts another valid blocker order without changing the board', async ({ page }) => {
  await page.goto('/trigma?b=35,8,4,16')

  const board = page.getByRole('img', { name: /Tablero de Trigma/ })
  await expect(board.locator('polygon')).toHaveCount(36)
  await expect(board.locator('.trigma-board__cell--blocked')).toHaveCount(4)
  for (const id of [
    4,
    8,
    16,
    35,
  ]) {
    await expect(board.locator(`[data-cell-id="${id.toString()}"]`)).toHaveClass(/trigma-board__cell--blocked/)
  }
})

test('accepts a decimal cell ID with leading zeros', async ({ page }) => {
  await page.goto('/trigma?b=00,11,21,27')

  const board = page.getByRole('img', { name: /Tablero de Trigma/ })
  await expect(board.locator('[data-cell-id="0"]')).toHaveClass(/trigma-board__cell--blocked/)
  await expect(board.locator('.trigma-board__cell--blocked')).toHaveCount(4)
})

test('keeps the triangular board proportional on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 })
  await page.goto('/trigma?b=0,11,21,27')

  const board = page.getByRole('img', { name: /Tablero de Trigma/ })
  const bounds = await board.boundingBox()
  if (!bounds) {
    throw new Error('The Trigma board has no visible bounds')
  }
  expect(bounds.width).toBeLessThanOrEqual(320)
  expect(bounds.height / bounds.width).toBeCloseTo(Math.sqrt(3) / 2, 2)
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect(page).toHaveScreenshot('trigma-challenge-mobile.png')
})

test('explains missing and invalid blocker parameters', async ({ page }) => {
  for (const query of [
    '',
    '?b=',
    '?b=0,11,21',
    '?b=0,11,21,27,35',
    '?b=0,11,11,27',
    '?b=-1,11,21,27',
    '?b=0,11,21,36',
    '?b=0,11,21,3.5',
    '?b=0,11,21,nope',
    '?b=0,%2011,21,27',
    '?b=0,11,21,27&b=1,2,3,4',
  ]) {
    await page.goto(`/trigma${query}`)
    await expect(page.getByText(/debe contener cuatro IDs distintos/)).toBeVisible()
    await expect(page.getByRole('img', { name: /Tablero de Trigma/ })).toHaveCount(0)
  }

  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await expect(page).toHaveScreenshot('invalid-trigma-query.png')
})
