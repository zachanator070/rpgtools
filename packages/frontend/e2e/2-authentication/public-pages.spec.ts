import { expect, test } from '@playwright/test';
import { logout, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('public pages', () => {
	test.beforeAll(() => {
		seedMiddleEarth();
	});

	test.afterAll(() => {
		stopApp();
	});

	test.beforeEach(async ({ page }) => {
		await logout(page);
	});

	test('anonymous user can view home page directly', async ({ page }) => {
		await page.goto('/ui/home');

		await expect(page).toHaveURL(/\/ui\/home$/);
		await expect(page.getByRole('heading', { name: 'Create Fantasy Worlds' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'View Demo' })).toBeVisible();
	});

	test('home and legal links are adjacent in nav and home link works', async ({ page }) => {
		await page.goto('/ui/home');

		const homeLink = page.getByRole('link', { name: 'Home' });
		const legalLink = page.getByRole('link', { name: 'Legal' });

		await expect(homeLink).toBeVisible();
		await expect(legalLink).toBeVisible();

		const areAdjacent = await page.evaluate(() => {
			const links = Array.from(document.querySelectorAll('.nav-bar a'));
			const home = links.find((link) => link.textContent?.trim() === 'Home');
			const legal = links.find((link) => link.textContent?.trim() === 'Legal');

			if (!home || !legal || !home.parentElement || !legal.parentElement) {
				return false;
			}

			return home.parentElement.nextElementSibling === legal.parentElement;
		});
		expect(areAdjacent).toBeTruthy();

		await homeLink.click();
		await expect(page).toHaveURL(/\/ui\/home$/);
	});

	test('anonymous user can view legal page from nav link', async ({ page }) => {
		await page.goto('/ui/home');

		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
		await page.getByRole('link', { name: 'Legal' }).click();

		await expect(page).toHaveURL(/\/ui\/legal$/);
		await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
	});

	test('navbar collapses around search on narrow screens', async ({ page }) => {
		await page.setViewportSize({ width: 700, height: 900 });
		await page.goto('/ui/home');

		await expect(page.locator('#navLeftCollapseButton')).toBeVisible();
		await expect(page.locator('#navRightCollapseButton')).toBeVisible();
		await expect(page.locator('#worldMenu')).toBeHidden();
		await expect(page.getByRole('link', { name: 'Home' })).not.toBeVisible();
		await expect(page.getByRole('link', { name: 'Legal' })).not.toBeVisible();

		await page.locator('#navLeftCollapseButton').click();
		await expect(page.locator('#worldMenu')).toBeVisible();

		await page.locator('#navRightCollapseButton').click();
		await expect(page.locator('#worldMenu')).toBeHidden();
		await expect(page.getByRole('link', { name: 'Legal' })).toBeVisible();
		await page.getByRole('link', { name: 'Legal' }).click();

		await expect(page).toHaveURL(/\/ui\/legal$/);
		await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
	});
});
