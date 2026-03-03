import { expect, test } from '@playwright/test';
import { MIDDLE_EARTH_MAP_URL, MINAS_TIRITH_MAP_URL } from '../util/constants';
import { adminLogin, goToMap, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('map pins', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goToMap(page);
  });

  test('pin details', async ({ page }) => {
    await page.locator('.mapPin').first().click();
    await page.locator('a', { hasText: 'Details' }).click();
    await expect(page.locator('h1')).toContainText('Minas Tirith');
    await page.locator('button', { hasText: 'Close' }).click();
    await expect(page.locator('h1', { hasText: 'Minas Tirith' })).not.toBeVisible();
  });

  test('pin map', async ({ page }) => {
    await page.locator('.mapPin').first().click();
    await page.locator('a', { hasText: 'Open Map' }).click();
    await expect(page).toHaveURL(new RegExp(MINAS_TIRITH_MAP_URL));

    await page.locator(':nth-child(1) > .ant-breadcrumb-link > a').click();
    await expect(page).toHaveURL(new RegExp(MIDDLE_EARTH_MAP_URL));
  });

  test('new pin', async ({ page }) => {
    await page.locator('canvas').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'New Pin' }).click();

    await expect(page.locator('.mapPin')).toHaveCount(2);
  });

  test('edit pin', async ({ page }) => {
    await page.locator('.mapPin').first().click();
    await page.locator('.ant-popover-inner-content').getByText('Edit Pin', { exact: true }).click();
    await page.locator('.ant-form-item-control-input-content > .ant-select > .ant-select-selector').click();
    await expect(page.locator('.ant-select-item-option-active')).toBeVisible();
    await page.locator('.ant-select-item-option-active').click();
    await page.locator('#submit', { hasText: 'Save' }).click();

    await page.locator('.mapPin').first().click();
    await expect(page.locator('h2')).toContainText('Middle Earth');
  });
});
