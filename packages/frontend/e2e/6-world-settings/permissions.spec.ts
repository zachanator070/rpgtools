import { expect, test } from '@playwright/test';
import { adminLogin, goToWorldSettings, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('world settings permissions', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goToWorldSettings(page);
    await page.locator('.ant-radio-group > :nth-child(2)').click();
  });

  test('remove role', async ({ page }) => {
    await page.locator('li', { hasText: 'test role' }).locator('#removeRole').click();
    await expect(page.locator('ul.ant-list-items > li')).toHaveCount(2);
  });

  test('add role', async ({ page }) => {
    await page.getByText('Able to change permissions for this world', { exact: true }).click();
    await page.locator('#selectRole').click();
    await page.locator('.ant-select-item-option-content', { hasText: 'test role' }).first().click();
    await page.locator('button', { hasText: 'Add role' }).click();

    await expect(page.locator('ul.ant-list-items > li')).toHaveCount(2);
  });
});
