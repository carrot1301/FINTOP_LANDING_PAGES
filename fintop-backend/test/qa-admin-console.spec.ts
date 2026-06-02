/**
 * ============================================================
 * qa-admin-console.spec.ts — Playwright Verification of Admin Demo Console
 * ============================================================
 * PURPOSE:
 *   Validates the end-to-end access rules and automated testing capabilities
 *   of the new `/admin-demo/index.html` page.
 *
 * TESTS:
 *   1. Unauthenticated Gate: Verifies that an anonymous user is prompted to log in.
 *   2. Forbidden Gate (Standard User): Verifies that a STANDARD user receives a 403 screen.
 *   3. Admin Active Dashboard: Verifies that a SUPER_ADMIN user loads the full console,
 *      triggers the internal API checks, and successfully receives PASS states across
 *      the modules.
 * ============================================================
 */

import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:8080/admin-demo/index.html';
const BACKEND_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@fintop.vn';
const ADMIN_PASSWORD = 'FinTop@2026';
const STANDARD_EMAIL = 'test@fintop.vn';
const STANDARD_PASSWORD = 'FinTop@2026';
const EVIDENCE_DIR = 'test-results/qa-console-evidence';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

let adminTokens: TokenPair;
let standardTokens: TokenPair;

// Helper: login via API and get token pair, register user if not exists
async function getLoginTokens(email: string): Promise<TokenPair> {
  let resp = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'FinTop@2026' }),
  });

  if (resp.status === 401 || resp.status === 404) {
    console.log(`User ${email} not found or unauthorized. Registering new account...`);
    await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'FinTop@2026',
        fullName: email === ADMIN_EMAIL ? 'Admin FinTop' : 'Standard Tester'
      }),
    });

    // Retry login
    resp = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'FinTop@2026' }),
    });
  }

  const data = await resp.json();
  const payload = data.data || data;
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken || 'mock_refresh_token_value',
  };
}

test.beforeAll(async () => {
  adminTokens = await getLoginTokens(ADMIN_EMAIL);
  standardTokens = await getLoginTokens(STANDARD_EMAIL);
  console.log('Tokens retrieved successfully.');
});

// ─── TEST 1: UNAUTHENTICATED GATE ───────────────────────────
test('Admin Console — 1. Unauthenticated anonymous users prompted to login', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser Error] ${err.message}`));

  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Check login gate is visible
  const loginGate = page.locator('#loginGate');
  await expect(loginGate).toBeVisible();

  // Check forbidden gate and dashboard are hidden
  const forbiddenGate = page.locator('#forbiddenGate');
  await expect(forbiddenGate).toBeHidden();

  const sidebar = page.locator('.sidebar');
  await expect(sidebar).toBeHidden();

  // Capture screenshot of login prompt
  await page.screenshot({ path: `${EVIDENCE_DIR}/1_login_prompt_unauthenticated.png` });
});

// ─── TEST 2: FORBIDDEN GATE (STANDARD USER) ─────────────────
test('Admin Console — 2. Standard user receives 403 Forbidden screen', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser Error] ${err.message}`));

  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('domcontentloaded');

  // Inject STANDARD user token into localStorage
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

  // Reload to apply auth state
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Check forbidden gate is visible
  const forbiddenGate = page.locator('#forbiddenGate');
  await expect(forbiddenGate).toBeVisible();

  // Check login gate and sidebar are hidden
  const loginGate = page.locator('#loginGate');
  await expect(loginGate).toBeHidden();

  const sidebar = page.locator('.sidebar');
  await expect(sidebar).toBeHidden();

  // Capture screenshot of forbidden access screen
  await page.screenshot({ path: `${EVIDENCE_DIR}/2_forbidden_gate_standard.png` });
});

// ─── TEST 3: ACTIVE ADMIN CONSOLE & RUN AUTOMATED CHECKS ──
test('Admin Console — 3. Super Admin logs in, loads dashboard, and triggers API smoke checks', async ({ page }) => {
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser Error] ${err.message}`));

  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('domcontentloaded');

  // Inject SUPER_ADMIN credentials
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

  // Reload to apply auth state
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000); // Allow infrastructure to initialize

  // Ensure gates are hidden and dashboard is visible
  await expect(page.locator('#loginGate')).toBeHidden();
  await expect(page.locator('#forbiddenGate')).toBeHidden();
  await expect(page.locator('.sidebar')).toBeVisible();

  // Navigate to QA tab (10. QA Tools)
  const qaTabBtn = page.locator('button[data-tab="qa"]');
  await qaTabBtn.click();
  await page.waitForTimeout(500);

  // Take screenshot of QA Panel before check
  await page.screenshot({ path: `${EVIDENCE_DIR}/3_dashboard_qa_panel_ready.png` });

  // Click the run checks button
  const runChecksBtn = page.locator('button:has-text("Chạy Toàn bộ API Smoke Tests")');
  await runChecksBtn.click();

  console.log('Automated Console Suite started. Waiting for completion...');
  
  // Wait for all 6 test components to resolve as PASS
  const checkItems = ['qa-env', 'qa-state', 'qa-auth', 'qa-rbac', 'qa-api', 'qa-sockets'];
  for (const item of checkItems) {
    const locator = page.locator(`#${item}`);
    await expect(locator).toHaveText('PASS', { timeout: 12000 });
    console.log(`  [PASS] Resolved component: ${item}`);
  }

  // Capture final completed trace and dashboard state
  await page.screenshot({ path: `${EVIDENCE_DIR}/4_dashboard_all_checks_passed.png`, fullPage: true });
  console.log('All Console checks succeeded.');
});
