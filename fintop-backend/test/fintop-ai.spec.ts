import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:8081';

test.describe('Fintop AI User Page', () => {
  test('should show lock screen overlay when guest, and open login modal on click', async ({ page }) => {
    // 1. Clear credentials to start as guest
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 2. Access fintop-ai/index.html
    await page.goto(`${BASE}/fintop-ai/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Lock screen wrapper should be visible
    const lockWrapper = page.locator('#copilot-lock-screen');
    await expect(lockWrapper).toBeVisible();

    const chatContainer = page.locator('#copilot-chat-container');
    await expect(chatContainer).toBeHidden();

    // 4. Click login button in the lock card
    const loginBtn = page.locator('#lock-login-btn');
    await loginBtn.click();
    await page.waitForTimeout(500);

    // 5. Auth Modal overlay should be active
    const authOverlay = page.locator('#authModalOverlay');
    const hasActive = await authOverlay.evaluate(el => el.classList.contains('active'));
    expect(hasActive).toBe(true);
  });

  test('should unlock chat interface and render suggestion chips when authenticated', async ({ page }) => {
    // 1. Navigate to landing page and login
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Clear and login
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Trigger login
    const startBtn = page.locator('#fintopStartBtn');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(500);

      await page.fill('#loginEmail', 'testuser@fintop.vn');
      await page.fill('#loginPassword', 'TestUser@2026');
      await page.click('#authFormLogin .auth-btn-submit');
      await page.waitForTimeout(1500);
    }

    // 2. Go to fintop-ai page
    await page.goto(`${BASE}/fintop-ai/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for boot checks

    // 3. Lock screen should be hidden, chat container visible
    await expect(page.locator('#copilot-lock-screen')).toBeHidden();
    await expect(page.locator('#copilot-chat-container')).toBeVisible();

    // 4. Welcome text and suggestions chips should be visible
    await expect(page.locator('#copilot-welcome')).toBeVisible();
    
    const chipCount = await page.locator('.copilot-chip').count();
    expect(chipCount).toBeGreaterThan(0);
  });
});
