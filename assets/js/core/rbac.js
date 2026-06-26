/**
 * ============================================================
 * rbac.js — Frontend RBAC & Subscription Tier Evaluator
 * ============================================================
 * PHASE-2A: Frontend Infrastructure Foundation
 *
 * PURPOSE:
 *   Mirrors backend RBAC guard logic in the frontend.
 *   Provides permission evaluators, tier comparisons, and
 *   DOM element visibility helpers for UI gating.
 *
 * DESIGN DECISIONS:
 *   This module NEVER trusts frontend-only state as the security
 *   enforcement layer. Backend guards remain the authoritative
 *   security boundary. This module is for UX ONLY — to hide
 *   controls users cannot use, preventing 403 errors.
 *
 *   SUPER_ADMIN BYPASS:
 *   Mirrors backend behavior where SubscriptionTierGuard and
 *   PermissionsGuard both bypass for SUPER_ADMIN users.
 *   (subscription-tier.guard.ts L35, permissions.guard.ts)
 *
 * BACKEND CONTRACT:
 *   Tier hierarchy (subscription-tier.guard.ts L8-13):
 *     STANDARD: 1, SILVER: 2, GOLD: 3, DIAMOND: 4
 *   Permissions are string codes checked against user.permissions[]
 *   Example: 'CREATE_SIGNAL', 'MANAGE_USERS', 'VIEW_AUDIT_LOGS'
 * ============================================================
 */

import { AppState } from './state.js';

// ─────────────────────────────────────────────────────────────
// TIER HIERARCHY
// Aligned with backend subscription-tier.guard.ts
// ─────────────────────────────────────────────────────────────

const TIER_HIERARCHY = Object.freeze({
  STANDARD: 1,
  SILVER:   2,
  GOLD:     3,
  DIAMOND:  4,
});

// ─────────────────────────────────────────────────────────────
// KNOWN PERMISSIONS (frontend documentation)
// These mirror the @Permissions() decorator values in backend.
// ─────────────────────────────────────────────────────────────

const PERMISSIONS = Object.freeze({
  CREATE_SIGNAL:    'VIP_SIGNALS:CREATE',
  UPDATE_SIGNAL:    'VIP_SIGNALS:UPDATE',
  CREATE_BLOG:      'BLOG:CREATE',
  UPDATE_BLOG:      'BLOG:UPDATE',
  MANAGE_USERS:     'USER:READ',
  MANAGE_ROLES:     'ROLE:READ',
  VIEW_AUDIT_LOGS:  'SYSTEM:READ',
});

// ─────────────────────────────────────────────────────────────
// DATA ATTRIBUTES FOR DOM GATING
// Used by gateElement() and gateSection()
// Usage: <button data-require-tier="GOLD">View Signals</button>
//        <div data-require-permission="CREATE_SIGNAL">...</div>
//        <section data-require-auth>Protected Content</section>
// ─────────────────────────────────────────────────────────────

const DATA_ATTRS = Object.freeze({
  REQUIRE_ROLE:       'data-require-role',
  REQUIRE_TIER:       'data-require-tier',
  REQUIRE_PERMISSION: 'data-require-permission',
  REQUIRE_AUTH:       'data-require-auth',
  HIDE_WHEN_AUTH:     'data-hide-when-auth',  // For login/register buttons
  LOCKED_CLASS:       'fintop-locked',         // CSS class for locked state
  HIDDEN_CLASS:       'fintop-hidden',          // CSS class for hidden elements
});

// ─────────────────────────────────────────────────────────────
// RBAC EVALUATOR CLASS
// ─────────────────────────────────────────────────────────────

class RbacEvaluatorSingleton {
  constructor() {
    // Re-evaluate gates whenever auth or user state changes
    AppState.on(AppState.EVENTS.AUTH_CHANGED, () => this.applyAllGates());
    AppState.on(AppState.EVENTS.USER_LOADED, () => this.applyAllGates());
    AppState.on(AppState.EVENTS.SUBSCRIPTION_CHANGED, () => this.applyAllGates());
    AppState.on(AppState.EVENTS.AUTH_LOGOUT, () => this.applyAllGates());
  }

  // ─────────────────────────────────────────────────────
  // CORE EVALUATORS
  // ─────────────────────────────────────────────────────

  /**
   * Check if user is authenticated.
   * @returns {boolean}
   */
  isAuthenticated() {
    return AppState.get('auth', 'isAuthenticated') === true;
  }

  /**
   * Check if user has SUPER_ADMIN role.
   * SUPER_ADMIN bypasses all tier and permission checks.
   * @returns {boolean}
   */
  isSuperAdmin() {
    const roles = AppState.get('user', 'roles') || [];
    return roles.includes('SUPER_ADMIN');
  }

  /**
   * Check if user has a specific role.
   * SUPER_ADMIN always passes.
   * @param {string} roleName - e.g. 'SUPER_ADMIN'
   * @returns {boolean}
   */
  hasRole(roleName) {
    if (this.isSuperAdmin()) return true;
    const roles = AppState.get('user', 'roles') || [];
    return roles.includes(roleName);
  }

  /**
   * Check if user is admin-capable (SuperAdmin, Admin, EditorAdmin, SaleAdmin,
   * or any role with admin permissions).
   * @returns {boolean}
   */
  isAdminCapable() {
    if (!this.isAuthenticated()) return false;
    
    // Check roles
    if (this.isSuperAdmin() || 
        this.hasRole('ADMIN') || 
        this.hasRole('EDITOR_ADMIN') || 
        this.hasRole('SALE_ADMIN')) {
      return true;
    }

    // Check permissions
    const adminPermissions = [
      'USER:READ',
      'USER:UPDATE',
      'ROLE:READ',
      'ROLE:UPDATE',
      'SYSTEM:READ',
      'VIP_SIGNALS:CREATE',
      'VIP_SIGNALS:UPDATE',
      'BLOG:CREATE',
      'BLOG:UPDATE',
      'MANAGE_USERS',
      'MANAGE_ROLES',
      'VIEW_AUDIT_LOGS',
      'CREATE_SIGNAL',
      'UPDATE_SIGNAL',
      'CREATE_BLOG',
      'UPDATE_BLOG'
    ];

    return adminPermissions.some(perm => this.hasPermission(perm));
  }


  /**
   * Check if user's subscription tier meets or exceeds the required tier.
   * SUPER_ADMIN always passes.
   * @param {'STANDARD'|'SILVER'|'GOLD'|'DIAMOND'} requiredTier
   * @returns {boolean}
   */
  hasTier(requiredTier) {
    if (this.isSuperAdmin()) return true;

    const userTier = AppState.get('user', 'tierLevel') || 'STANDARD';
    const userLevel = TIER_HIERARCHY[userTier] || 0;
    const requiredLevel = TIER_HIERARCHY[requiredTier] || 0;

    return userLevel >= requiredLevel;
  }

  hasPermission(permissionCode) {
    if (this.isSuperAdmin()) return true;

    // Resolve known permission mapping if present
    const resolvedCode = PERMISSIONS[permissionCode] || permissionCode;

    const permissions = AppState.get('user', 'permissions') || [];
    return permissions.includes(resolvedCode);
  }

  /**
   * Check if user satisfies multiple permissions (AND logic).
   * @param {string[]} permissionCodes
   * @returns {boolean}
   */
  hasAllPermissions(...permissionCodes) {
    return permissionCodes.every(code => this.hasPermission(code));
  }

  /**
   * Check if user satisfies at least one permission (OR logic).
   * @param {string[]} permissionCodes
   * @returns {boolean}
   */
  hasAnyPermission(...permissionCodes) {
    return permissionCodes.some(code => this.hasPermission(code));
  }

  /**
   * Get tier rank as integer.
   * @param {'STANDARD'|'SILVER'|'GOLD'|'DIAMOND'} tier
   * @returns {number}
   */
  getTierRank(tier) {
    return TIER_HIERARCHY[tier] || 0;
  }

  /**
   * Get the current user's tier rank.
   * @returns {number}
   */
  getUserTierRank() {
    const tier = AppState.get('user', 'tierLevel') || 'STANDARD';
    return TIER_HIERARCHY[tier] || 1;
  }

  // ─────────────────────────────────────────────────────
  // DOM GATING HELPERS
  // ─────────────────────────────────────────────────────

  /**
   * Show or hide a DOM element based on access evaluation.
   * @param {HTMLElement} element
   * @param {{ requiredTier?: string, requiredPermission?: string, requireAuth?: boolean }} options
   * @param {'hide'|'lock'|'disable'} [behavior='hide'] - What to do when access denied
   */
  gateElement(element, options = {}, behavior = 'hide') {
    if (!element) return;

    const { requiredTier, requiredPermission, requireAuth, requiredRole } = options;

    let hasAccess = true;

    if (requireAuth) hasAccess = hasAccess && this.isAuthenticated();
    if (requiredRole) hasAccess = hasAccess && this.isAuthenticated() && this.hasRole(requiredRole);
    if (requiredTier) hasAccess = hasAccess && this.isAuthenticated() && this.hasTier(requiredTier);
    if (requiredPermission) hasAccess = hasAccess && this.isAuthenticated() && this.hasPermission(requiredPermission);

    this._applyGate(element, hasAccess, behavior);
  }

  _applyGate(element, hasAccess, behavior) {
    if (hasAccess) {
      element.classList.remove(DATA_ATTRS.LOCKED_CLASS, DATA_ATTRS.HIDDEN_CLASS);
      element.removeAttribute('disabled');
      element.style.display = '';
    } else {
      if (behavior === 'hide') {
        element.classList.add(DATA_ATTRS.HIDDEN_CLASS);
        element.style.display = 'none';
      } else if (behavior === 'lock') {
        element.classList.add(DATA_ATTRS.LOCKED_CLASS);
        element.setAttribute('disabled', 'true');
      } else if (behavior === 'disable') {
        element.setAttribute('disabled', 'true');
      }
    }
  }

  // ─────────────────────────────────────────────────────
  // APPLY ALL GATES (Declarative DOM Scanning)
  // Scans the entire DOM for data-require-* attributes
  // and applies gates automatically. Called on auth state changes.
  // ─────────────────────────────────────────────────────

  applyAllGates() {
    // Gate: data-require-auth
    document.querySelectorAll(`[${DATA_ATTRS.REQUIRE_AUTH}]`).forEach(el => {
      this._applyGate(el, this.isAuthenticated(), 'hide');
    });

    // Gate: data-hide-when-auth (e.g. login button)
    document.querySelectorAll(`[${DATA_ATTRS.HIDE_WHEN_AUTH}]`).forEach(el => {
      this._applyGate(el, !this.isAuthenticated(), 'hide');
    });

    // Gate: data-require-role="SUPER_ADMIN"
    document.querySelectorAll(`[${DATA_ATTRS.REQUIRE_ROLE}]`).forEach(el => {
      const requiredRole = el.getAttribute(DATA_ATTRS.REQUIRE_ROLE);
      this.gateElement(el, { requiredRole, requireAuth: true }, 'hide');
    });

    // Gate: data-require-tier="GOLD"
    document.querySelectorAll(`[${DATA_ATTRS.REQUIRE_TIER}]`).forEach(el => {
      const requiredTier = el.getAttribute(DATA_ATTRS.REQUIRE_TIER);
      this.gateElement(el, { requiredTier, requireAuth: true }, 'lock');
    });

    // Gate: data-require-permission="CREATE_SIGNAL"
    document.querySelectorAll(`[${DATA_ATTRS.REQUIRE_PERMISSION}]`).forEach(el => {
      const requiredPermission = el.getAttribute(DATA_ATTRS.REQUIRE_PERMISSION);
      this.gateElement(el, { requiredPermission, requireAuth: true }, 'hide');
    });
  }

  // ─────────────────────────────────────────────────────
  // UPGRADE PROMPT HELPER
  // ─────────────────────────────────────────────────────

  /**
   * Show an upgrade prompt for an element that requires higher tier.
   * @param {HTMLElement} container - Where to inject the prompt
   * @param {'SILVER'|'GOLD'|'DIAMOND'} requiredTier
   */
  showUpgradePrompt(container, requiredTier) {
    if (!container) return;

    const tierNames = { SILVER: 'Bạc', GOLD: 'Vàng', DIAMOND: 'Kim Cương' };
    const tierName = tierNames[requiredTier] || requiredTier;

    container.innerHTML = `
      <div class="fintop-upgrade-prompt" style="
        text-align: center; padding: 2rem;
        background: rgba(124, 58, 237, 0.08);
        border: 1px solid rgba(124, 58, 237, 0.2);
        border-radius: 12px; margin: 1rem 0;
      ">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
        <h3 style="color: #a78bfa; margin-bottom: 0.5rem;">
          Yêu cầu gói ${tierName}
        </h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">
          Nâng cấp tài khoản để truy cập tính năng này.
        </p>
        <a href="/index.html#panel-hoivien" style="
          background: #7c3aed; color: white; padding: 0.6rem 1.5rem;
          border-radius: 8px; text-decoration: none; font-weight: 600;
        ">Xem gói hội viên</a>
      </div>
    `;
  }

  /**
   * Show a login prompt for protected content.
   * @param {HTMLElement} container
   * @param {Function} [onLoginClick]
   */
  showLoginPrompt(container, onLoginClick) {
    if (!container) return;

    container.innerHTML = `
      <div class="fintop-login-prompt" style="
        text-align: center; padding: 2rem;
        background: rgba(30, 27, 75, 0.5);
        border: 1px solid rgba(124, 58, 237, 0.2);
        border-radius: 12px; margin: 1rem 0;
      ">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔐</div>
        <h3 style="color: #e2e8f0; margin-bottom: 0.5rem;">Đăng nhập để tiếp tục</h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">
          Vui lòng đăng nhập để xem nội dung này.
        </p>
        <button id="fintop-login-cta" style="
          background: #7c3aed; color: white; padding: 0.6rem 1.5rem;
          border-radius: 8px; border: none; cursor: pointer; font-weight: 600;
        ">Đăng nhập ngay</button>
      </div>
    `;

    document.getElementById('fintop-login-cta')?.addEventListener('click', () => {
      if (onLoginClick) {
        onLoginClick();
      } else if (typeof openAuthModal === 'function') {
        openAuthModal('login');
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────

const RbacEvaluator = new RbacEvaluatorSingleton();

export { RbacEvaluator, TIER_HIERARCHY, PERMISSIONS, DATA_ATTRS };
export default RbacEvaluator;
