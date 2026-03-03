import { expect, test } from '@playwright/test';
import { TEST_ROLE_NAME } from '../util/constants';
import { adminLogin, goToServerSettings, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('server permissions', () => {
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

  test('add role', async ({ page }) => {
    const rolesRadioLabel = page.locator('label[for="rolesPermissionTab"]');
    if (await rolesRadioLabel.first().isVisible().catch(() => false)) {
      await rolesRadioLabel.first().click();
    } else {
      await page.getByText('Roles', { exact: true }).first().click();
    }

    await page.locator('#selectRole').click();
    await page.locator('#selectRole').fill(TEST_ROLE_NAME);
    await page.getByTitle(TEST_ROLE_NAME).click();
    await page.locator('button', { hasText: 'Add role' }).click();

    await expect(page.locator('ul.ant-list-items > li', { hasText: TEST_ROLE_NAME }).first()).toBeVisible();
  });
});
