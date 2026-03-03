import { expect, test } from '@playwright/test';
import { adminLogin, goToServerSettings, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('invite user', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goToServerSettings(page);
  });

  test('shows invite UI and adds an invite', async ({ page }) => {
    const inviteEmail = 'invite-user@example.com';

    if (!(await page.locator('#inviteEmail').isVisible().catch(() => false))) {
      await page.getByText('Invites', { exact: true }).first().click();
    }

    await expect(page.locator('h2', { hasText: 'Invites' })).toBeVisible();
    await expect(page.locator('#inviteEmail')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Invite' })).toBeVisible();

    await page.locator('#inviteEmail').fill(inviteEmail);
    await page.locator('button', { hasText: 'Invite' }).click();

    await expect(page.locator('#inviteEmail')).toHaveValue('');
    await expect(page.locator('#inviteList')).toContainText(inviteEmail);
  });
});
