import { expect, test } from '@playwright/test';
import { TEST_USER_PASSWORD, TEST_USER_USERNAME } from '../util/constants';
import { goHome, logout, openRightMenuIfCollapsed, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('login', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await logout(page);
    await goHome(page);
    await openRightMenuIfCollapsed(page);
    await page.locator('a', { hasText: 'Login' }).click();
  });

  test('success', async ({ page }) => {
    await page.locator('#loginEmail').fill(TEST_USER_USERNAME);
    await page.locator('#loginPassword').fill(TEST_USER_PASSWORD);
    await page.locator('#submit').click();
    await openRightMenuIfCollapsed(page);

    await expect(page.locator('#logoutButton')).toBeVisible();
  });

  test('bad password', async ({ page }) => {
    await page.locator('#loginEmail').fill(TEST_USER_USERNAME);
    await page.locator('#loginPassword').fill('bad_password');
    await page.locator('#submit').click();
  });
});
