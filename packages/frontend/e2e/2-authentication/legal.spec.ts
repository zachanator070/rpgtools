import { expect, test } from '@playwright/test';
import { goToMap, logout, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('legal', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await logout(page);
    await goToMap(page);
  });

  test('anonymous user can view terms and privacy from nav link', async ({ page }) => {
    await page.getByRole('link', { name: 'Legal' }).click();

    await expect(page).toHaveURL(/\/ui\/legal$/);
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  });
});
