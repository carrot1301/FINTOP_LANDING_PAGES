import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:8080';
const BACKEND_URL = 'http://localhost:3000';
const EVIDENCE_DIR = path.join(__dirname, '../../visible-pass-evidence');

// Ensure evidence folder exists
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

// Config to enforce headed mode
test.use({
  headless: false,
  viewport: { width: 1440, height: 900 },
  launchOptions: {
    slowMo: 600,
  }
});

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Helper: login via API
async function getLoginTokens(email: string): Promise<TokenPair> {
  const resp = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'FinTop@2026' }),
  });
  if (!resp.ok) {
    throw new Error(`Failed to log in for ${email}: ${resp.statusText}`);
  }
  const data = await resp.json();
  const payload = data.data || data;
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken || 'mock_refresh_token_value',
  };
}

test.describe('ADMIN-NAV-1 — Role-Based Logo Navigation Tests', () => {

  // ─── 1. Guest Click Logo ──────────────────────────────────
  test('Guest: Click logo navigates to /index.html', async ({ page }) => {
    // Clear storage to make sure we are guest
    await page.goto(`${BASE_URL}/index.html`);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify logo link click
    const logoLink = page.locator('a.logo-link, a:has(img.neon-logo)').first();
    await expect(logoLink).toBeVisible();
    await logoLink.click();
    await page.waitForTimeout(1500);

    // Confirm url goes to/remains at index.html
    const currentUrl = page.url();
    expect(currentUrl).toContain('/index.html');

    // Save screenshot
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'guest_logo_home.png') });
    console.log('Guest logo home screenshot saved.');
  });

  // ─── 2. Normal User Login & Click Logo ─────────────────────
  test('Normal User: Login (no admin redirect) and logo click navigates to /index.html', async ({ page }) => {
    // Retrieve standard user token
    const standardTokens = await getLoginTokens('test@fintop.vn');

    await page.goto(`${BASE_URL}/index.html`);
    await page.evaluate((tokens) => {
      localStorage.setItem('fintop_access_token', tokens.accessToken);
      localStorage.setItem('fintop_refresh_token', tokens.refreshToken);
      localStorage.setItem('fintop_user', JSON.stringify({
        email: 'test@fintop.vn',
        fullName: 'Standard Tester',
        tierLevel: 'STANDARD',
        roles: [],
      }));
      window.dispatchEvent(new Event('storage'));
    }, standardTokens);

    await page.reload();
    await page.waitForTimeout(1500);

    // Confirm NOT redirected to /admin/
    expect(page.url()).not.toContain('/admin/');
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'user_login_no_admin_redirect.png') });
    console.log('User login no redirect screenshot saved.');

    // Click logo brand
    const logoLink = page.locator('a.logo-link, a:has(img.neon-logo)').first();
    await logoLink.click();
    await page.waitForTimeout(1500);

    // Confirm url remains at/goes to index.html
    expect(page.url()).toContain('/index.html');
    expect(page.url()).not.toContain('/admin/');
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'user_logo_home.png') });
    console.log('User logo home screenshot saved.');
  });

  // ─── 3. Admin User Login & Click Logo ──────────────────────
  test('Admin: Login (no auto redirect) and logo click navigates to /admin/', async ({ page }) => {
    const adminTokens = await getLoginTokens('admin@fintop.vn');

    await page.goto(`${BASE_URL}/index.html`);
    await page.evaluate((tokens) => {
      localStorage.setItem('fintop_access_token', tokens.accessToken);
      localStorage.setItem('fintop_refresh_token', tokens.refreshToken);
      localStorage.setItem('fintop_user', JSON.stringify({
        email: 'admin@fintop.vn',
        fullName: 'Admin FinTop',
        tierLevel: 'DIAMOND',
        roles: ['SUPER_ADMIN'],
      }));
      window.dispatchEvent(new Event('storage'));
    }, adminTokens);

    await page.reload();
    await page.waitForTimeout(1500);

    // Confirm NOT automatically redirected to /admin/ immediately
    expect(page.url()).not.toContain('/admin/');
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'admin_login_no_auto_admin_redirect.png') });
    console.log('Admin login no auto redirect screenshot saved.');

    // Click logo brand
    const logoLink = page.locator('a.logo-link, a:has(img.neon-logo)').first();
    await logoLink.click();
    await page.waitForTimeout(2000);

    // Confirm URL redirected to /admin/ and console loads
    expect(page.url()).toContain('/admin/');
    await expect(page.locator('#admin-app')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'admin_logo_to_admin_console.png') });
    console.log('Admin logo to admin console screenshot saved.');
  });

  // ─── 4. Direct Access & Security Gates ────────────────────
  test('Direct Access: Guest and Normal User are blocked from /admin/', async ({ page }) => {
    // Guest direct access to /admin/
    await page.goto(`${BASE_URL}/admin/`);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify guest blocked (should show denied screen)
    await expect(page.locator('#admin-denied')).toBeVisible();
    await expect(page.locator('#admin-app')).toBeHidden();

    // Normal User direct access to /admin/
    const standardTokens = await getLoginTokens('test@fintop.vn');
    await page.goto(`${BASE_URL}/admin/`);
    await page.evaluate((tokens) => {
      localStorage.setItem('fintop_access_token', tokens.accessToken);
      localStorage.setItem('fintop_refresh_token', tokens.refreshToken);
      localStorage.setItem('fintop_user', JSON.stringify({
        email: 'test@fintop.vn',
        fullName: 'Standard Tester',
        tierLevel: 'STANDARD',
        roles: [],
      }));
    }, standardTokens);
    
    await page.reload();
    await page.waitForTimeout(2000);

    // Verify standard user blocked (should show denied screen with 403 text)
    await expect(page.locator('#admin-denied')).toBeVisible();
    await expect(page.locator('#admin-app')).toBeHidden();
    
    const deniedDesc = page.locator('.denied-desc');
    await expect(deniedDesc).toContainText('Tài khoản của bạn không có quyền quản trị');

    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'user_admin_forbidden.png') });
    console.log('User admin forbidden screenshot saved.');
  });
});
