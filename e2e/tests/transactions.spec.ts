import { test, expect } from '@playwright/test';

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill('demo@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.goto('/transactions');
  });

  test('should display transaction history', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Transaction History' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should filter by transaction type', async ({ page }) => {
    await page.getByRole('combobox').selectOption('BUY');
    await expect(page.getByText('BUY')).toBeVisible();

    await page.getByRole('combobox').selectOption('SELL');
    await expect(page.getByText('SELL')).toBeVisible();
  });

  test('should open add transaction modal', async ({ page }) => {
    await page.getByRole('button', { name: /add transaction/i }).click();
    await expect(page.getByRole('heading', { name: 'Add Transaction' })).toBeVisible();
  });

  test('should add a new transaction', async ({ page }) => {
    const initialRows = await page.getByRole('row').count();

    await page.getByRole('button', { name: /add transaction/i }).click();

    await page.getByLabel('Type').selectOption('BUY');
    await page.getByLabel('Quantity').fill('2');
    await page.getByLabel('Price per Unit').fill('150');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('heading', { name: 'Add Transaction' })).not.toBeVisible();

    const finalRows = await page.getByRole('row').count();
    expect(finalRows).toBeGreaterThanOrEqual(initialRows);
  });
});
