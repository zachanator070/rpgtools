import { expect, test } from '@playwright/test';
import { adminLogin, goHome, openRightMenuIfCollapsed, seedMiddleEarth, stopApp } from '../util/helper';

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
    await openRightMenuIfCollapsed(page);
    await page.locator('#logoutButton').click();
    await openRightMenuIfCollapsed(page);
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });
});
