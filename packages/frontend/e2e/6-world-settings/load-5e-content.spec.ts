import { expect, test } from '@playwright/test';
import { MIDDLE_EARTH_WIKI_URL } from '../util/constants';
import { adminLogin, goToWorldSettings, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('load 5e content', () => {
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

  test.skip('load all', async ({ page }) => {
    await page.locator('button', { hasText: 'Load' }).click();

    await expect(page).toHaveURL(MIDDLE_EARTH_WIKI_URL, { timeout: 10000 });
    await expect(page.locator(':nth-child(1) > [style="cursor: pointer;"] > :nth-child(1) > .ant-dropdown-trigger')).toContainText('5e');
  });
});
