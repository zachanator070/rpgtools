import { expect, test } from '@playwright/test';
import { MIDDLE_EARTH_MAP_URL } from '../util/constants';
import { adminLogin, goHome, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('select world', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goHome(page);
    await page.locator('#worldMenu').click();
    await page.locator('a', { hasText: 'Select World' }).click();
  });

  test('select middle earth', async ({ page }) => {
    await page.locator('#searchWorld').fill('middle earth');
    await page.getByTitle('Middle Earth').first().click();
    await page.locator('#submit').click();

    await expect(page).toHaveURL(MIDDLE_EARTH_MAP_URL);
  });

  test('no found worlds', async ({ page }) => {
    await page.locator('#searchWorld').fill('asdf');
    await expect(page.locator('#submit')).toBeDisabled();
  });
});
