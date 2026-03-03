import { expect, test } from '@playwright/test';
import { MIDDLE_EARTH_WIKI_URL, TEST_IMAGE } from '../util/constants';
import { adminLogin, fixturePath, goToEditWiki, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('edit wiki', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goToEditWiki(page);
  });

  test('content change', async ({ page }) => {
    await page.locator('#editor .ql-editor').fill('testing a change');
    await page.locator('button', { hasText: 'Save' }).first().click();

    await expect(page).toHaveURL(new RegExp(MIDDLE_EARTH_WIKI_URL));
    await expect(page.locator('p')).toContainText('testing a change');
  });

  test('change images', async ({ page }) => {
    const image = fixturePath(TEST_IMAGE);

    await page.locator('#coverImageUpload').setInputFiles(image);
    await page.locator('#mapImageUpload').setInputFiles(image);
    await page.locator('button', { hasText: 'Save' }).first().click();

    await expect(page).toHaveURL(new RegExp(MIDDLE_EARTH_WIKI_URL), { timeout: 120000 });
    await page.locator('img').first().waitFor({ state: 'visible', timeout: 120000 });
    expect(await page.locator('img').count()).toBeGreaterThanOrEqual(2);
  });

  test('revert change images', async ({ page }) => {
    const image = fixturePath(TEST_IMAGE);

    await page.locator('#coverImageUpload').setInputFiles(image);
    await page.locator('#mapImageUpload').setInputFiles(image);
    await page.locator('#mapImageRevert').click();
    await page.locator('#coverImageRevert').click();
    await page.locator('button', { hasText: 'Save' }).first().click();

    await expect(page).toHaveURL(new RegExp(MIDDLE_EARTH_WIKI_URL));
    await page.locator('img').first().waitFor({ state: 'visible', timeout: 120000 });
    expect(await page.locator('img').count()).toBeGreaterThanOrEqual(2);
  });
});
