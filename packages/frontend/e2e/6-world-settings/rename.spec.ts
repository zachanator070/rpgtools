import { expect, test } from '@playwright/test';
import { adminLogin, goToWorldSettings, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('world settings rename', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goToWorldSettings(page);
  });

  test('rename', async ({ page }) => {
    await page.locator('#newWorldNameInput').fill('Other Earth');
    await page.locator('button', { hasText: 'Submit' }).click();

    await expect(page.locator('h1')).toContainText('Settings for Other Earth');
  });
});
