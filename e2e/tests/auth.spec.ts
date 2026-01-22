import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should login with demo credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email address').fill('demo@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email address').fill('wrong@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    const uniqueEmail = `test-${Date.now()}@example.com`;

    await page.getByPlaceholder('Full name').fill('Test User');
    await page.getByPlaceholder('Email address').fill(uniqueEmail);
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /register/i }).click();

    await expect(page).toHaveURL('/');
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill('demo@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL('/login');
  });
});
