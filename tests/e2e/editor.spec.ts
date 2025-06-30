import { test, expect } from '@playwright/test';

test.describe('LaTeX Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh'
      }));
    });
    
    await page.goto('/');
  });

  test('should load editor with default LaTeX code', async ({ page }) => {
    await expect(page.locator('[data-testid="monaco-editor"]')).toBeVisible();
    await expect(page.locator('text=LaTeX Editor')).toBeVisible();
  });

  test('should update LaTeX code in editor', async ({ page }) => {
    const editor = page.locator('[data-testid="monaco-editor"]');
    await editor.click();
    await editor.fill('\\documentclass{article}\n\\begin{document}\nTest content\n\\end{document}');
    
    await expect(editor).toHaveValue(/Test content/);
  });

  test('should copy LaTeX code to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.click('[title="Copy LaTeX"]');
    
    // Check if clipboard contains LaTeX code
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('\\documentclass');
  });

  test('should download LaTeX file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('[title="Download LaTeX"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('document.tex');
  });

  test('should compile LaTeX document', async ({ page }) => {
    // Mock compilation API
    await page.route('**/api/projects/*/compile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          compilationId: 'mock-id',
          pdfPath: '/api/files/pdf/mock.pdf',
          duration: 1000
        })
      });
    });

    await page.click('text=Compile');
    
    // Should show compilation success
    await expect(page.locator('text=Document compiled successfully!')).toBeVisible();
  });

  test('should handle compilation errors', async ({ page }) => {
    // Mock compilation error
    await page.route('**/api/projects/*/compile', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'LaTeX Error: Missing \\begin{document}',
          duration: 500
        })
      });
    });

    await page.click('text=Compile');
    
    // Should show error message
    await expect(page.locator('text=Compilation Error')).toBeVisible();
    await expect(page.locator('text=Missing \\begin{document}')).toBeVisible();
  });
});