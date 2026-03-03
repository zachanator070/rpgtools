import { expect, test } from '@playwright/test';
import { MIDDLE_EARTH_MAP_URL, MINAS_TIRITH_MAP_URL, MINAS_TIRITH_WIKI_URL } from '../util/constants';
import { adminLogin, goToWiki, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('view wiki', () => {
  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    seedMiddleEarth();
    await adminLogin(page);
    await goToWiki(page);
  });

  test('view contents and images', async ({ page }) => {
    await page.locator('img').first().waitFor({ state: 'visible' });
    expect(await page.locator('img').count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('p')).toContainText('Here be dragons and hobbits');
  });

  test('map links', async ({ page }) => {
    await page.locator('a', { hasText: 'Go to Map' }).first().click();

    await expect(page).toHaveURL(new RegExp(MIDDLE_EARTH_MAP_URL));
  });

  test('visit map link', async ({ page }) => {
    await page.locator('a', { hasText: 'Minas Tirith' }).first().click();

    await expect(page).toHaveURL(MINAS_TIRITH_WIKI_URL);
    await page.locator('a', { hasText: 'Go to Map' }).first().click();
    await expect(page).toHaveURL(new RegExp(MINAS_TIRITH_MAP_URL));
  });

  test('see on map link', async ({ page }) => {
    await page.goto(MINAS_TIRITH_WIKI_URL);

    await expect(page).toHaveURL(MINAS_TIRITH_WIKI_URL);
    await page.locator('a', { hasText: 'See on map' }).first().click();
    await expect(page).toHaveURL(new RegExp(MIDDLE_EARTH_MAP_URL));
  });
});
