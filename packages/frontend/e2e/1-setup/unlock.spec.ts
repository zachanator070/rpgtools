import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } from '../util/constants';
import { goHome, seedNewServer, stopApp } from '../util/helper';

test.describe('Unlock server test', () => {
  test.beforeAll(() => {
    seedNewServer();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await goHome(page);
    await page.goto('http://localhost:3000/ui/setup');
    await expect(page.locator('#registerEmail')).toBeVisible();
  });

  test('failure', async ({ page }) => {
    await page.locator('#registerEmail').fill(ADMIN_EMAIL);
    await page.locator('#registerDisplayName').fill(ADMIN_USERNAME);
    await page.locator('#registerPassword').fill(ADMIN_PASSWORD);
    await page.locator('#registerRepeatPassword').fill('wrong-password');
    await page.locator('#submit').click();

    await expect(page).toHaveURL('http://localhost:3000/ui/setup');
    await expect(page.locator('#errors')).toBeVisible();
  });

  test('success', async ({ page }) => {
    const uniqueSuffix = `${Date.now()}`;
    await page.locator('#registerEmail').fill(`admin-${uniqueSuffix}@gmail.com`);
    await page.locator('#registerDisplayName').fill(`admin-${uniqueSuffix}`);
    await page.locator('#registerPassword').fill(ADMIN_PASSWORD);
    await page.locator('#registerRepeatPassword').fill(ADMIN_PASSWORD);
    await page.locator('#submit').click();

    await expect(page).toHaveURL('http://localhost:3000/ui');
  });
});
