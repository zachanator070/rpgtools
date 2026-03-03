import { expect, test } from '@playwright/test';
import { adminLogin, goToRoles, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('roles', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await goToRoles(page);
  });

  test('add role', async ({ page }) => {
    await page.locator('#newRoleName').fill('new test role');
    await page.locator('button', { hasText: 'Create' }).click();
    await page.locator('#selectRole').click();
    await expect(page.getByTitle('new test role')).toBeVisible();
  });

  test('add and remove user', async ({ page }) => {
    await page.locator('#selectRole').click();
    await page.locator('[title="test role"]').first().click();

    await page.getByText('Users with this role', { exact: true }).click();

    await page.locator('#selectUserInput').fill('tester');
    await page.getByTitle('tester').click();
    await page.locator('button', { hasText: 'Add User' }).click();

    await page.locator('.ant-list-items > :nth-child(2) > .ant-btn').click();
    await expect(page.locator('ul.ant-list-items > li')).toHaveCount(1);
  });

  test('delete role', async ({ page }) => {
    await page.locator('#selectRole').click();
    await page.locator('[title="test role"]').first().click();

    await page.getByText('Delete this role', { exact: true }).click();
    await page.locator('button', { hasText: 'Delete this role' }).click();

    await page.locator('#selectRole').click();
    await expect(page.locator('.ant-select-dropdown')).toHaveCount(1);
  });
});
