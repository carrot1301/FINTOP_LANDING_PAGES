import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:8081';

test.describe('Dynamic Stock Lookup Fallback', () => {
  test('should successfully look up a stock ticker not in local filter DB and render it', async ({ page }) => {
    // 1. Navigate directly to index.html with the panel-tracuu hash active
    await page.goto(`${BASE}/index.html#panel-tracuu`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for modules/API client to hydrate

    const searchInput = page.locator('#stockSearchInput');
    await expect(searchInput).toBeVisible();

    // 2. Search for a stock ticker not in the default filter (e.g., 'VGT' - Dệt may, UPCOM)
    await searchInput.fill('VGT');
    
    // Press Enter to trigger addStockTicker
    await searchInput.press('Enter');

    // 3. Wait for the lookup request to complete (input will be re-enabled)
    await expect(searchInput).toBeEnabled({ timeout: 15000 });

    // 4. Verify that the row is added and render results correctly
    const firstRow = page.locator('#tracuuBody tr').first();
    await expect(firstRow).toBeVisible();

    // Verify cell values exactly
    await expect(firstRow.locator('td.ticker-cell')).toHaveText('VGT');
    await expect(firstRow.locator('td').nth(2)).toHaveText('UPCOM');
    await expect(firstRow.locator('td').nth(3)).toHaveText('Dệt may');

    // Verify it is not shaking or showing error border
    const borderColor = await searchInput.evaluate(el => window.getComputedStyle(el).borderColor);
    expect(borderColor).not.toContain('rgb(248, 113, 113)');
  });

  test('should shake and reject an invalid stock ticker symbol', async ({ page }) => {
    await page.goto(`${BASE}/index.html#panel-tracuu`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const searchInput = page.locator('#stockSearchInput');
    await expect(searchInput).toBeVisible();

    // Search for a non-existent stock ticker
    await searchInput.fill('INVALIDXYZ');
    await searchInput.press('Enter');

    // Wait for the lookup request to complete and fail (input will be re-enabled)
    await expect(searchInput).toBeEnabled({ timeout: 15000 });

    // The error border should be applied
    const borderColor = await searchInput.evaluate(el => window.getComputedStyle(el).borderColor);
    expect(borderColor).toContain('rgb(248, 113, 113)'); // #f87171 is rgb(248, 113, 113)
  });
});
