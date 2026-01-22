import { test, expect } from '@playwright/test';

test.describe('Investments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill('demo@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.goto('/investments');
  });

  test('should display investments list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Investments' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('AAPL')).toBeVisible();
  });

  test('should open add investment modal', async ({ page }) => {
    await page.getByRole('button', { name: /add investment/i }).click();
    await expect(page.getByRole('heading', { name: 'Add Investment' })).toBeVisible();
  });

  test('should add a new investment', async ({ page }) => {
    await page.getByRole('button', { name: /add investment/i }).click();

    await page.getByLabel('Type').selectOption('STOCK');
    await page.getByLabel('Symbol').fill('TSLA');
    await page.getByLabel('Name').fill('Tesla Inc.');
    await page.getByLabel('Quantity').fill('5');
    await page.getByLabel('Purchase Price').fill('200');
    await page.getByLabel('Current Price').fill('250');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('TSLA')).toBeVisible();
    await expect(page.getByText('Tesla Inc.')).toBeVisible();
  });

  test('should edit an investment', async ({ page }) => {
    await page.getByRole('row', { name: /AAPL/ }).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Investment' })).toBeVisible();

    await page.getByLabel('Current Price').clear();
    await page.getByLabel('Current Price').fill('200');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('heading', { name: 'Edit Investment' })).not.toBeVisible();
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /add investment/i }).click();
    await expect(page.getByRole('heading', { name: 'Add Investment' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Add Investment' })).not.toBeVisible();
  });
});
