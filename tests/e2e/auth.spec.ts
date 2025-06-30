import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login modal when clicking sign in', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should switch between login and register forms', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    
    // Switch to register
    await page.click('text=Sign up');
    await expect(page.locator('text=Create Account')).toBeVisible();
    
    // Switch back to login
    await page.click('text=Sign in');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should validate login form', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for HTML5 validation
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should validate registration form', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await page.click('text=Sign up');
    
    // Fill form with mismatched passwords
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should handle OAuth login redirects', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    
    // Mock OAuth redirect
    await page.route('**/api/auth/google', route => {
      route.fulfill({
        status: 302,
        headers: {
          'Location': 'http://localhost:5173/auth/callback?token=mock-token'
        }
      });
    });
    
    await page.click('text=Google');
    // Should redirect to OAuth provider
  });
});