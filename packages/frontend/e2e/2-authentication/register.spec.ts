import { expect, test } from '@playwright/test';
import { TEST_USER_EMAIL } from '../util/constants';
import { goHome, logout, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('register', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await logout(page);
    await goHome(page);
    await page.locator('a', { hasText: 'Register' }).click();
  });

  test('success', async ({ page }) => {
    await page.locator('#registerEmail').fill('tester2@gmail.com');
    await page.locator('#registerDisplayName').fill('user');
    await page.locator('#registerPassword').fill('password');
    await page.locator('#registerRepeatPassword').fill('password');
    await page.locator('#submit').click();
  });

  test('failure', async ({ page }) => {
    await page.locator('#registerEmail').fill(TEST_USER_EMAIL);
    await page.locator('#registerDisplayName').fill('user');
    await page.locator('#registerPassword').fill('password');
    await page.locator('#registerRepeatPassword').fill('password');
    await page.locator('#submit').click();

    await expect(page.locator('.ant-modal-body')).toContainText('Registration Error');
  });
});
