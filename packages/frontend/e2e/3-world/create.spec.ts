import { expect, test } from '@playwright/test';
import { adminLogin, goHome, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('create world', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goHome(page);
    await page.locator('#worldMenu', { hasText: 'No World Selected' }).click();
    await page.locator('a', { hasText: 'New World' }).click();
  });

  test('success', async ({ page }) => {
    await page.locator('#newWorldName').fill('Earth');
    await page.locator('#submit').click();

    await expect(page).not.toHaveURL('http://localhost:3000/#');
  });
});
