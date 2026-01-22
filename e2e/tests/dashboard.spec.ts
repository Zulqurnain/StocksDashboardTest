import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill('demo@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should display portfolio summary cards', async ({ page }) => {
    await expect(page.getByText('Total Value')).toBeVisible();
    await expect(page.getByText('Total Cost')).toBeVisible();
    await expect(page.getByText('Total Gain/Loss')).toBeVisible();
    await expect(page.getByText('Return')).toBeVisible();
  });

  test('should display performance by asset type table', async ({ page }) => {
    await expect(page.getByText('Performance by Asset Type')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should display all investments table', async ({ page }) => {
    await expect(page.getByText('All Investments')).toBeVisible();
    await expect(page.getByText('AAPL')).toBeVisible();
    await expect(page.getByText('Apple Inc.')).toBeVisible();
  });

  test('should navigate to investments page', async ({ page }) => {
    await page.getByRole('link', { name: 'Investments' }).click();
    await expect(page).toHaveURL('/investments');
  });

  test('should navigate to transactions page', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click();
    await expect(page).toHaveURL('/transactions');
  });
});
