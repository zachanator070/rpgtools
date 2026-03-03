import { expect, test } from '@playwright/test';
import { adminLogin, goHome, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('logout', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goHome(page);
  });

  test('logout', async ({ page }) => {
    await page.locator('#logoutButton').click();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });
});
