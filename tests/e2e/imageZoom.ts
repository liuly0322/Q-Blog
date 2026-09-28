import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { openHydratedPage, scrollArticle } from '../helpers/site.ts'
import type { Site } from '../helpers/site.ts'

export function registerImageZoom(site: Site) {
  test('home and asynchronously loaded article images share the modal', async () => {
    const { page } = site
    await openHydratedPage(site, '/', '.md-blog img')
    const image = page.locator('.md-blog img').first()
    await image.evaluate((element: HTMLImageElement) => element.decode())
    await image.scrollIntoViewIfNeeded()
    const scrollY = await page.evaluate(() => window.scrollY)
    await image.click()
    const dialog = page.getByRole('dialog', { name: '图片预览' })
    await dialog.waitFor({ state: 'visible' })
    assert.equal(await dialog.locator('img').getAttribute('src'), await image.evaluate((element: HTMLImageElement) => element.currentSrc))
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.documentElement.style.overflow !== 'hidden')
    assert.equal(await page.evaluate(() => window.scrollY), scrollY)

    await page.locator(`article a[href="${scrollArticle}"]`).first().click()
    await page.waitForURL(`**${scrollArticle}`)
    const articleImage = page.locator('[data-post-body] img').first()
    await articleImage.waitFor({ state: 'visible' })
    await articleImage.evaluate((element: HTMLImageElement) => element.decode())
    await articleImage.click()
    await dialog.waitFor({ state: 'visible' })
    assert.equal(await page.locator('.image-zoom').count(), 1)
    assert.equal(await dialog.locator('img').getAttribute('src'), await articleImage.evaluate((element: HTMLImageElement) => element.currentSrc))
    await dialog.getByRole('button', { name: '关闭' }).click()
    await dialog.waitFor({ state: 'hidden' })
  })

  test('mobile image preview fits the viewport and closes on empty space', async () => {
    const mobile = await site.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
    try {
      await openHydratedPage(mobile, scrollArticle, '[data-post-body] img')
      const image = mobile.page.locator('[data-post-body] img').first()
      await image.evaluate((element: HTMLImageElement) => element.decode())
      await image.tap()
      const dialog = mobile.page.getByRole('dialog', { name: '图片预览' })
      await dialog.waitFor({ state: 'visible' })
      const bounds = await dialog.locator('img').boundingBox()
      assert(bounds && bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= 390 && bounds.y + bounds.height <= 844)
      await dialog.tap({ position: { x: 2, y: 400 } })
      await dialog.waitFor({ state: 'hidden' })
    }
    finally {
      await mobile.close()
    }
  })
}
