/**
 * ============================================================
 * auth.js — Authentication Modal & User Dropdown
 * ============================================================
 * PHASE-2B-1: Real Auth Integration
 *
 * CHANGES FROM ORIGINAL:
 *   ✅ submitAuth() now calls AuthUI.handleLogin() / handleRegister()
 *      instead of alert("Demo")
 *   ✅ All existing modal, dropdown, and animation logic PRESERVED
 *   ✅ Password toggle logic PRESERVED
 *   ✅ openAuthModal(), closeAuthModal(), switchAuthView() PRESERVED
 *
 * PRESERVED UI BEHAVIOR:
 *   - User dropdown click toggle (active class)
 *   - Close dropdown when clicking outside
 *   - Auth modal overlay click-to-close
 *   - Password visibility toggle (👁️ / 🙈)
 *   - Login ↔ Register slide animation
 *
 * INTEGRATION POINT:
 *   The AuthUI module from core/auth-ui.js handles:
 *   - Real API calls via AuthManager
 *   - Error display in the modal
 *   - Navbar state update on login/logout
 *   - Session restore on page load
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. User Dropdown Logic
    const userDropdownContainer = document.getElementById('userDropdownContainer');
    
    if (userDropdownContainer) {
        userDropdownContainer.addEventListener('click', (e) => {
            // Event delegation for dynamic logout buttons inside the dropdown
            const logoutBtn = e.target.closest('#fintopLogoutBtn');
            const logoutAllBtn = e.target.closest('#fintopLogoutAllBtn');
            
            if (logoutBtn) {
                e.preventDefault();
                if (window.FintopInfra?.AuthUI) {
                    window.FintopInfra.AuthUI.handleLogout(false);
                }
                return;
            }
            
            if (logoutAllBtn) {
                e.preventDefault();
                if (window.FintopInfra?.AuthUI) {
                    window.FintopInfra.AuthUI.handleLogout(true);
                }
                return;
            }

            // Prevent closing immediately if clicking inside the menu
            if (e.target.closest('.user-dropdown-menu')) {
                // Let the link clicks pass through
                if (e.target.tagName !== 'A') {
                    e.stopPropagation();
                }
                return;
            }
            
            // Toggle active class
            userDropdownContainer.classList.toggle('active');
            // Close bell dropdown if open
            const bellContainer = document.getElementById('notifBellContainer');
            if (bellContainer) bellContainer.classList.remove('active');
            e.stopPropagation(); // Prevent document click from firing immediately
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (userDropdownContainer && userDropdownContainer.classList.contains('active')) {
            if (!userDropdownContainer.contains(e.target)) {
                userDropdownContainer.classList.remove('active');
            }
        }
    });

    // 2. Auth Modal Logic
    const authOverlay = document.getElementById('authModalOverlay');
    
    if (authOverlay) {
        // Close modal when clicking on overlay background
        authOverlay.addEventListener('click', (e) => {
            if (e.target === authOverlay) {
                closeAuthModal();
            }
        });

        // Disable inputs initially since modal is closed by default
        toggleAuthInputs(false);
    }

    const authGateOverlay = document.getElementById('authGateOverlay');
    if (authGateOverlay) {
        authGateOverlay.addEventListener('click', (e) => {
            if (e.target === authGateOverlay) {
                closeAuthChoice();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authGateOverlay?.classList.contains('active')) {
            closeAuthChoice();
        }
    });

    // 3. Password visibility toggle
    const toggleBtns = document.querySelectorAll('.password-toggle');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const inputId = this.getAttribute('data-target');
            const inputField = document.getElementById(inputId);
            
            if (inputField) {
                if (inputField.type === 'password') {
                    inputField.type = 'text';
                    this.textContent = '●';
                } else {
                    inputField.type = 'password';
                    this.textContent = '○';
                }
            }
        });
    });

    if (window.RegisterStepper) {
        window.RegisterStepper.init();
    }

    updateAdminAccessLink();

    // ── Referral & Auth URL handling ────────────────────────────
    // Supports: ?ref=CODE, ?refId=CODE, #register?ref=CODE, /dangky/CODE
    const handleURLAuthAndReferral = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        let refCode = urlParams.get('ref') || urlParams.get('referral') || urlParams.get('refId') || '';

        if (!refCode && window.location.hash) {
            const hash = window.location.hash;
            const matchParam = hash.match(/(?:ref|referral|refId)=([A-Za-z0-9_-]+)/i);
            if (matchParam) {
                refCode = matchParam[1];
            } else {
                const matchPath = hash.match(/#register[\/?&]+([A-Za-z0-9_-]+)/i);
                if (matchPath) {
                    refCode = matchPath[1];
                }
            }
        }

        if (!refCode && window.location.pathname) {
            const pathMatch = window.location.pathname.match(/\/(?:dangky|register)\/([A-Za-z0-9_-]+)/i);
            if (pathMatch) {
                refCode = pathMatch[1];
            }
        }

        const isRegisterRequest = Boolean(refCode) ||
            window.location.hash.startsWith('#register') ||
            window.location.pathname.toLowerCase().includes('/dangky');
        const isLoginRequest = !isRegisterRequest && window.location.hash === '#login';

        if (!isRegisterRequest && !isLoginRequest) return;

        const targetView = isRegisterRequest ? 'register' : 'login';

        // Direct open modal for referral link or hash view
        openAuthModal(targetView);

        // If referral code is present, pre-fill referral ID and referrer name
        if (refCode) {
            refCode = refCode.trim();
            await new Promise(r => setTimeout(r, 180));

            const refIdInput = document.getElementById('registerRefId');
            const refNameInput = document.getElementById('registerRefName');

            if (refIdInput) {
                refIdInput.value = refCode;
                refIdInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            try {
                const code = encodeURIComponent(refCode);
                let fullName = '';

                if (window.FintopInfra && window.FintopInfra.ApiClient) {
                    try {
                        const res = await window.FintopInfra.ApiClient.get(`/auth/referral-lookup/${code}`);
                        const data = res?.data || res;
                        if (data && data.fullName) fullName = data.fullName;
                    } catch (e) { }
                }

                if (!fullName) {
                    try {
                        const baseUrl = window.FintopInfra?.FintopEnv?.API_BASE_URL || 'http://localhost:3000';
                        const res = await fetch(`${baseUrl}/auth/referral-lookup/${code}`);
                        if (res.ok) {
                            const body = await res.json();
                            const data = body?.data || body;
                            if (data && data.fullName) fullName = data.fullName;
                        }
                    } catch (e) { }
                }

                // Demo / Local Fallback Map for staff codes if API is offline
                if (!fullName) {
                    const mockMap = {
                        'BW9B': 'Nguyễn Văn Tuấn',
                        '6': 'Nguyễn Văn Tuấn',
                        '8043': 'Trần Khánh Linh',
                        'ADMIN': 'FinTop Admin'
                    };
                    fullName = mockMap[refCode.toUpperCase()] || '';
                }

                if (refNameInput) {
                    refNameInput.value = fullName || 'Không tìm thấy người giới thiệu';
                    refNameInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } catch (err) {
                console.error('[Referral] Error looking up referral name:', err);
                if (refNameInput) {
                    refNameInput.value = 'Không tìm thấy người giới thiệu';
                }
            }
        }
    };

    handleURLAuthAndReferral();
    window.addEventListener('hashchange', handleURLAuthAndReferral);
});

function showAdminAccessLink(isVisible) {
    const adminLink = document.getElementById('adminAccessLink');
    if (!adminLink) return;
    adminLink.hidden = !isVisible;
}

function loadExternalScriptOnce(src, globalCheck) {
    if (globalCheck()) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener('load', resolve, { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function updateAdminAccessLink() {
    showAdminAccessLink(true);

    if (sessionStorage.getItem('fintop.admin.unlocked.v1') === 'true') {
        return;
    }

    const config = window.FINTOP_SUPABASE_CONFIG;
    if (!config || !config.url || !config.anonKey) {
        return;
    }

    try {
        await loadExternalScriptOnce('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', () => Boolean(window.supabase));
        const client = window.supabase.createClient(config.url, config.anonKey);
        const { data } = await client.auth.getUser();
        const role = data?.user?.app_metadata?.role || data?.user?.user_metadata?.role;
        showAdminAccessLink(role === 'admin' || !role);
    } catch (error) {
        showAdminAccessLink(true);
    }
}

function syncAuthBodyScrollLock() {
    const hasOpenOverlay = Boolean(document.querySelector(
        '#pricing-modals.active, #authGateOverlay.active, #authModalOverlay.active'
    ));
    document.body.style.overflow = hasOpenOverlay ? 'hidden' : '';
}

/**
 * Ask the visitor whether they want to log in, register, or return.
 * Authentication forms are only opened after an explicit choice.
 * @param {string} preferredView - 'login' or 'register'
 */
function requestAuthChoice(preferredView = 'login') {
    const normalizedView = preferredView === 'register' ? 'register' : 'login';
    const gateOverlay = document.getElementById('authGateOverlay');

    // Pages without the gate markup keep the existing auth behavior.
    if (!gateOverlay) {
        openAuthModal(normalizedView);
        return;
    }

    const authOverlay = document.getElementById('authModalOverlay');
    if (authOverlay?.classList.contains('active')) {
        switchAuthView(normalizedView);
        return;
    }

    const userDropdownContainer = document.getElementById('userDropdownContainer');
    if (userDropdownContainer) userDropdownContainer.classList.remove('active');

    gateOverlay.dataset.preferredView = normalizedView;

    const loginBtn = gateOverlay.querySelector('[data-auth-choice="login"]');
    const registerBtn = gateOverlay.querySelector('[data-auth-choice="register"]');
    if (loginBtn && registerBtn) {
        if (normalizedView === 'register') {
            registerBtn.className = 'auth-gate-action primary';
            loginBtn.className = 'auth-gate-action secondary';
        } else {
            loginBtn.className = 'auth-gate-action primary';
            registerBtn.className = 'auth-gate-action secondary';
        }
    }

    gateOverlay.setAttribute('aria-hidden', 'false');
    gateOverlay.classList.add('active');
    syncAuthBodyScrollLock();

    window.setTimeout(() => {
        const preferredButton = gateOverlay.querySelector(`[data-auth-choice="${normalizedView}"]`);
        preferredButton?.focus();
    }, 40);
}

function closeAuthChoice() {
    const gateOverlay = document.getElementById('authGateOverlay');
    if (!gateOverlay) return;

    gateOverlay.classList.remove('active');
    gateOverlay.setAttribute('aria-hidden', 'true');
    syncAuthBodyScrollLock();
}

function continueAuthChoice(view) {
    const normalizedView = view === 'register' ? 'register' : 'login';
    closeAuthChoice();
    openAuthModal(normalizedView);
}

/**
 * Open the authentication modal
 * @param {string} view - 'login' or 'register'
 */
function openAuthModal(view = 'login') {
    const authOverlay = document.getElementById('authModalOverlay');
    
    // Close user dropdown if open
    const userDropdownContainer = document.getElementById('userDropdownContainer');
    if (userDropdownContainer) {
        userDropdownContainer.classList.remove('active');
    }
    
    if (authOverlay) {
        const wasOpen = authOverlay.classList.contains('active');
        // Switch to requested view first
        switchAuthView(view, false);

        if (view === 'register' && !wasOpen && window.RegisterStepper) {
            window.RegisterStepper.reset();
        }
        
        // Clear any previous error messages
        if (window.FintopInfra?.AuthFormUI) {
            window.FintopInfra.AuthFormUI.clearError('authFormLogin');
            window.FintopInfra.AuthFormUI.clearError('authFormRegister');
            window.FintopInfra.AuthFormUI.clearError('authFormVerify');
            window.FintopInfra.AuthFormUI.clearError('authFormForgot');
        }
        
        // Enable inputs when modal is open
        toggleAuthInputs(true);
        
        // Show modal
        authOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        if (window.RegisterStepper) {
            window.RegisterStepper.render();
        }
    } else {
        // Fallback for pages that don't have the auth modal HTML markup: redirect to root index.html with hash
        window.location.href = '/index.html#' + (view === 'register' ? 'register' : 'login');
    }
}

/**
 * Close the authentication modal
 */
function closeAuthModal() {
    const authOverlay = document.getElementById('authModalOverlay');
    if (authOverlay) {
        authOverlay.classList.remove('active');
        syncAuthBodyScrollLock();
        // Disable inputs when modal is closed
        toggleAuthInputs(false);
        if (window.RegisterStepper) {
            window.RegisterStepper.stopCountdown();
        }
    }
}

/**
 * Switch between login and register views with animation
 * @param {string} view - 'login' or 'register'
 * @param {boolean} animate - whether to apply slide animation
 */
function switchAuthView(view, animate = true) {
    const loginForm = document.getElementById('authFormLogin');
    const registerForm = document.getElementById('authFormRegister');
    const verifyForm = document.getElementById('authFormVerify');
    const forgotForm = document.getElementById('authFormForgot');
    
    if (!loginForm || !registerForm) return;

    // Clear errors when switching views
    if (window.FintopInfra?.AuthFormUI) {
        window.FintopInfra.AuthFormUI.clearError('authFormLogin');
        window.FintopInfra.AuthFormUI.clearError('authFormRegister');
        if (verifyForm) window.FintopInfra.AuthFormUI.clearError('authFormVerify');
        if (forgotForm) window.FintopInfra.AuthFormUI.clearError('authFormForgot');
    }

    const forms = [loginForm, registerForm, verifyForm, forgotForm].filter(Boolean);
    forms.forEach((form) => {
        form.classList.remove('active', 'slide-left');
        form.style.transform = '';
    });

    if (view === 'verify' && verifyForm) {
        if (animate) {
            setTimeout(() => verifyForm.classList.add('active'), 50);
        } else {
            verifyForm.classList.add('active');
        }
    } else if (view === 'forgot' && forgotForm) {
        if (animate) {
            setTimeout(() => forgotForm.classList.add('active'), 50);
        } else {
            forgotForm.classList.add('active');
        }
    } else if (view === 'register') {
        if (animate) {
            loginForm.classList.add('slide-left');
            
            setTimeout(() => {
                registerForm.classList.add('active');
            }, 50); // Small delay to let browser process class changes
        } else {
            registerForm.classList.add('active');
        }
    } else { // 'login'
        if (animate) {
            setTimeout(() => {
                loginForm.classList.add('active');
            }, 50);
        } else {
            loginForm.classList.add('active');
        }
    }

    if (view === 'register' && window.RegisterStepper) {
        if (window.RegisterStepper.isShowingSuccess()) {
            window.RegisterStepper.reset();
        } else {
            window.RegisterStepper.render();
        }
    }
}

/**
 * Handle form submission — REAL INTEGRATION (Phase-2B-1)
 * 
 * ORIGINAL: alert("Demo") for all form types
 * NEW: Routes to AuthUI handlers which call real backend APIs
 * 
 * @param {Event} event
 * @param {'login'|'register'|'forgot'|'verify'|'resend'} type
 */
function submitAuth(event, type) {
    event.preventDefault();
    console.log('[Auth] ▶ submitAuth called with type:', type);

    if (type === 'register' && window.RegisterStepper) {
        window.RegisterStepper.handleSubmit(event);
        return;
    }

    // Check if the submit button is stuck disabled from a previous attempt
    const form = event.target;
    if (form) {
        const btn = form.querySelector('.auth-btn-submit');
        if (btn && btn.disabled) {
            console.warn('[Auth] ⚠️ Submit button was stuck in disabled state — resetting it.');
            btn.disabled = false;
            btn.style.opacity = '';
            btn.style.cursor = '';
            btn.textContent = btn.dataset.originalText || (type === 'login' ? 'Đăng nhập' : 'Đăng ký');
        }
    }

    // Check if FintopInfra is loaded (the core/index.js module)
    if (window.FintopInfra && window.FintopInfra.AuthUI) {
        console.log('[Auth] ✅ FintopInfra.AuthUI available — routing to handler:', type);
        // Phase-2B-1: Real integration via AuthUI
        switch (type) {
            case 'login':
                window.FintopInfra.AuthUI.handleLogin(event)
                    .then(() => console.log('[Auth] ✅ Login handler completed successfully'))
                    .catch((err) => console.error('[Auth] ❌ Login handler threw error:', err));
                break;
            case 'register':
                window.FintopInfra.AuthUI.handleRegister(event)
                    .then(() => console.log('[Auth] ✅ Register handler completed successfully'))
                    .catch((err) => console.error('[Auth] ❌ Register handler threw error:', err));
                break;
            case 'forgot':
                window.FintopInfra.AuthUI.handleForgotPassword(event)
                    .then(() => console.log('[Auth] ✅ Forgot password handler completed'))
                    .catch((err) => console.error('[Auth] ❌ Forgot password handler threw error:', err));
                break;
            case 'verify':
                window.FintopInfra.AuthUI.handleVerifyEmail(event)
                    .then(() => console.log('[Auth] ✅ Verify email handler completed'))
                    .catch((err) => console.error('[Auth] ❌ Verify email handler threw error:', err));
                break;
            case 'resend':
                window.FintopInfra.AuthUI.handleResendOTP(event)
                    .then(() => console.log('[Auth] ✅ Resend OTP handler completed'))
                    .catch((err) => console.error('[Auth] ❌ Resend OTP handler threw error:', err));
                break;
            default:
                console.warn('[Auth] Unknown auth type:', type);
        }
    } else {
        // Fallback: If infrastructure module hasn't loaded yet
        console.warn('[Auth] ⚠️ FintopInfra not loaded — falling back to demo mode');
        console.warn('[Auth] window.FintopInfra =', window.FintopInfra);
        if (type === 'login') {
            alert("Đăng nhập thành công! (Chức năng Demo)");
            closeAuthModal();
        } else if (type === 'register') {
            alert("Tạo tài khoản thành công! (Chức năng Demo)");
            switchAuthView('login');
        } else if (type === 'forgot') {
            alert("Yêu cầu khôi phục mật khẩu đã được gửi! (Chức năng Demo)");
        }
    }
}

const RegisterStepper = {
    initialized: false,
    currentStep: 0,
    countdownTimer: null,
    countdownRemaining: 0,
    otpSent: false,
    registrationStarted: false,
    els: {},

    init() {
        if (this.initialized) return;

        const form = document.getElementById('authFormRegister');
        if (!form) return;

        this.els = {
            form,
            flow: form.querySelector('[data-register-flow]'),
            success: form.querySelector('[data-register-success]'),
            panels: Array.from(form.querySelectorAll('[data-register-panel]')),
            steps: Array.from(form.querySelectorAll('[data-register-step-trigger]')),
            progress: form.querySelector('[data-register-progress]'),
            prevBtn: form.querySelector('[data-register-prev]'),
            nextBtn: form.querySelector('[data-register-next]'),
            submitBtn: form.querySelector('[data-register-submit]'),
            sendOtpBtn: form.querySelector('[data-register-send-otp]'),
            otpStatus: form.querySelector('[data-register-otp-status]'),
            stockAccountGroup: document.getElementById('stockAccountGroup'),
            stockAccountInput: document.getElementById('registerStockAccount'),
            passwordInput: document.getElementById('registerPassword'),
            confirmInput: document.getElementById('registerPasswordConfirm'),
            otpInput: document.getElementById('registerOtpCode'),
            strength: form.querySelector('[data-password-strength]'),
            strengthBar: form.querySelector('[data-password-strength-bar]'),
            strengthLabel: form.querySelector('[data-password-strength-label]'),
        };

        this.els.nextBtn?.addEventListener('click', () => this.next());
        this.els.prevBtn?.addEventListener('click', () => this.prev());
        this.els.sendOtpBtn?.addEventListener('click', () => this.sendOtp());

        this.els.steps.forEach((stepBtn) => {
            stepBtn.addEventListener('click', () => {
                const targetStep = Number(stepBtn.dataset.registerStepTrigger);
                this.goTo(targetStep);
            });
        });

        this.els.form.querySelectorAll('input[name="brokerageCompany"]').forEach((input) => {
            input.addEventListener('change', () => {
                this.updateStockAccountVisibility();
                this.invalidateOtp();
            });
        });

        this.els.form.querySelectorAll('input[type="radio"]').forEach((input) => {
            input.addEventListener('change', () => {
                this.clearFieldError(input.name);
            });
        });

        this.els.form.querySelectorAll('input').forEach((input) => {
            input.addEventListener('input', () => {
                this.clearFieldError(input.id || input.name);

                if (input === this.els.passwordInput) {
                    this.updatePasswordStrength(input.value);
                }

                if ([
                    'registerFullName',
                    'registerEmail',
                    'registerPassword',
                    'registerPasswordConfirm',
                ].includes(input.id)) {
                    this.invalidateOtp();
                }
            });
        });

        const refIdInput = document.getElementById('registerRefId');
        const refNameInput = document.getElementById('registerRefName');
        if (refIdInput && refNameInput) {
            let lookupTimeout = null;
            refIdInput.addEventListener('input', () => {
                const val = refIdInput.value.trim();
                refNameInput.value = ''; // Clear previous immediately
                
                if (lookupTimeout) clearTimeout(lookupTimeout);
                
                if (!val) return;
                
                lookupTimeout = setTimeout(async () => {
                    try {
                        const code = encodeURIComponent(val);
                        let foundName = '';

                        if (window.FintopInfra && window.FintopInfra.ApiClient) {
                            try {
                                const res = await window.FintopInfra.ApiClient.get(`/auth/referral-lookup/${code}`);
                                const data = res?.data || res;
                                if (data && data.fullName) foundName = data.fullName;
                            } catch (e) { }
                        }

                        if (!foundName) {
                            try {
                                const baseUrl = window.FintopInfra?.FintopEnv?.API_BASE_URL || 'http://localhost:3000';
                                const res = await fetch(`${baseUrl}/auth/referral-lookup/${code}`);
                                if (res.ok) {
                                    const body = await res.json();
                                    const data = body?.data || body;
                                    if (data && data.fullName) foundName = data.fullName;
                                }
                            } catch (e) { }
                        }

                        if (!foundName) {
                            const mockMap = {
                                'BW9B': 'Nguyễn Văn Tuấn',
                                '6': 'Nguyễn Văn Tuấn',
                                '8043': 'Trần Khánh Linh',
                                'ADMIN': 'FinTop Admin'
                            };
                            foundName = mockMap[val.toUpperCase()] || '';
                        }

                        refNameInput.value = foundName || 'Không tìm thấy người giới thiệu';
                    } catch (err) {
                        console.error('Error looking up referral ID:', err);
                        refNameInput.value = 'Không tìm thấy người giới thiệu';
                    }
                }, 400);
            });
        }

        this.initialized = true;
        this.render();
    },

    reset() {
        if (!this.initialized) this.init();
        if (!this.els.form) return;

        this.stopCountdown();
        this.currentStep = 0;
        this.otpSent = false;
        this.registrationStarted = false;

        this.els.form.reset();
        this.clearErrors();
        this.setStatus('');
        this.updatePasswordStrength('');

        if (this.els.flow) this.els.flow.hidden = false;
        if (this.els.success) this.els.success.hidden = true;

        this.render();
    },

    isShowingSuccess() {
        return Boolean(this.els.success && !this.els.success.hidden);
    },

    render() {
        if (!this.initialized) this.init();
        if (!this.els.form) return;

        const modalOpen = Boolean(document.getElementById('authModalOverlay')?.classList.contains('active'));

        this.els.panels.forEach((panel, index) => {
            panel.classList.toggle('is-active', index === this.currentStep);
        });

        this.els.steps.forEach((step, index) => {
            const marker = step.querySelector('.register-step-index');
            step.classList.toggle('is-active', index === this.currentStep);
            step.classList.toggle('is-complete', index < this.currentStep);
            if (marker) marker.textContent = index < this.currentStep ? '✓' : String(index + 1);
        });

        if (this.els.progress) {
            const progress = this.currentStep <= 0 ? 0 : (this.currentStep / 2) * 100;
            this.els.progress.style.width = `${progress}%`;
        }

        if (this.els.prevBtn) {
            this.els.prevBtn.disabled = !modalOpen || this.currentStep === 0;
        }

        if (this.els.nextBtn) {
            this.els.nextBtn.hidden = this.currentStep === 2;
            this.els.nextBtn.disabled = !modalOpen;
        }

        if (this.els.submitBtn) {
            this.els.submitBtn.hidden = this.currentStep !== 2;
            this.els.submitBtn.disabled = !modalOpen;
        }

        if (this.els.sendOtpBtn && this.countdownRemaining <= 0) {
            this.els.sendOtpBtn.disabled = !modalOpen;
            this.els.sendOtpBtn.textContent = this.otpSent || this.registrationStarted ? 'Gửi lại mã' : 'Gửi mã';
        }

        this.updateStockAccountVisibility();
    },

    prev() {
        this.setStep(this.currentStep - 1);
    },

    next() {
        if (!this.validateStep(this.currentStep)) return;
        this.setStep(this.currentStep + 1);
    },

    goTo(targetStep) {
        if (Number.isNaN(targetStep) || targetStep < 0 || targetStep > 2) return;

        if (targetStep <= this.currentStep) {
            this.setStep(targetStep);
            return;
        }

        for (let step = this.currentStep; step < targetStep; step++) {
            if (!this.validateStep(step)) return;
        }

        this.setStep(targetStep);
    },

    setStep(step) {
        this.currentStep = Math.max(0, Math.min(2, step));
        this.render();
    },

    handleSubmit(event) {
        event.preventDefault();

        if (this.currentStep < 2) {
            this.next();
            return;
        }

        const firstInvalidStep = this.getFirstInvalidStep();
        if (firstInvalidStep !== -1) {
            this.setStep(firstInvalidStep);
            this.validateStep(firstInvalidStep);
            return;
        }

        this.completeRegistration();
    },

    getFirstInvalidStep() {
        for (let step = 0; step <= 2; step++) {
            if (!this.validateStep(step, { silent: true })) return step;
        }
        this.clearErrors();
        return -1;
    },

    validateStep(step, options = {}) {
        const { silent = false, requireOtp = true } = options;
        const panel = this.els.panels?.[step] || this.els.form;
        const errors = [];

        if (!silent) this.clearErrors(panel);

        const addError = (field, message) => {
            errors.push({ field, message });
            if (!silent) this.setFieldError(field, message);
        };

        if (step === 0) {
            const fullName = this.value('registerFullName');
            const phone = this.value('registerPhone');
            const digits = phone.replace(/\D/g, '');
            const email = this.value('registerEmail');

            if (!fullName) addError('registerFullName', 'Vui lòng nhập họ và tên.');
            if (!phone) addError('registerPhone', 'Vui lòng nhập số điện thoại/Zalo.');
            if (phone && (digits.length < 9 || digits.length > 11)) {
                addError('registerPhone', 'Số điện thoại chưa đúng định dạng.');
            }
            if (!email) addError('registerEmail', 'Vui lòng nhập email.');
            if (email && !this.isValidEmail(email)) {
                addError('registerEmail', 'Email chưa đúng định dạng.');
            }
        }

        if (step === 1) {
            if (!this.value('registerBirthday')) addError('registerBirthday', 'Vui lòng chọn sinh nhật.');
            if (!this.value('registerCity')) addError('registerCity', 'Vui lòng nhập tỉnh/thành phố.');
            if (!this.checkedValue('investmentDuration')) addError('investmentDuration', 'Vui lòng chọn thời gian đầu tư.');
            if (!this.checkedValue('riskAppetite')) addError('riskAppetite', 'Vui lòng chọn khẩu vị đầu tư.');
            if (!this.checkedValue('brokerageCompany')) addError('brokerageCompany', 'Vui lòng chọn công ty chứng khoán.');
        }

        if (step === 2) {
            const password = this.value('registerPassword', false);
            const confirm = this.value('registerPasswordConfirm', false);

            if (!password) addError('registerPassword', 'Vui lòng đặt mật khẩu.');
            if (password && password.length < 6) addError('registerPassword', 'Mật khẩu phải có ít nhất 6 ký tự.');
            if (!confirm) addError('registerPasswordConfirm', 'Vui lòng nhập lại mật khẩu.');
            if (confirm && password !== confirm) addError('registerPasswordConfirm', 'Mật khẩu nhập lại chưa khớp.');
        }

        if (!silent && errors.length > 0) {
            this.focusField(errors[0].field);
        }

        return errors.length === 0;
    },

    async sendOtp() {
        // Obsolete but kept to prevent reference errors
    },

    async completeRegistration() {
        const submitBtn = this.els.submitBtn;
        this.setButtonLoading(submitBtn, true, 'Đang hoàn tất...');
        this.setStatus('');

        // Call real API through AuthUI if available
        if (window.FintopInfra && window.FintopInfra.AuthUI) {
            try {
                // Create a synthetic event with the form as target
                const syntheticEvent = { preventDefault: () => {}, target: this.els.form };
                await window.FintopInfra.AuthUI.handleRegister(syntheticEvent);
                // handleRegister will switch to verify view on success
            } catch (err) {
                console.error('[RegisterStepper] Registration API error:', err);
                this.setStatus('Đăng ký thất bại. Vui lòng thử lại.', 'error');
                this.setButtonLoading(submitBtn, false, 'Hoàn tất');
            }
        } else {
            // Fallback: mock registration for demo mode
            window.setTimeout(() => {
                this.showSuccess();
            }, 240);
        }
    },

    getFirstInvalidStepBeforeOtp() {
        for (let step = 0; step <= 2; step++) {
            const valid = this.validateStep(step, {
                silent: true,
                requireOtp: step === 2 ? false : true,
            });
            if (!valid) return step;
        }
        this.clearErrors();
        return -1;
    },

    showSuccess() {
        this.stopCountdown();
        this.clearErrors();
        this.setStatus('');
        this.setButtonLoading(this.els.submitBtn, false, 'Hoàn tất');

        if (this.els.flow) this.els.flow.hidden = true;
        if (this.els.success) this.els.success.hidden = false;
    },

    startCountdown(seconds) {
        this.stopCountdown();
        this.countdownRemaining = seconds;
        this.updateCountdownButton();

        this.countdownTimer = window.setInterval(() => {
            this.countdownRemaining -= 1;
            this.updateCountdownButton();

            if (this.countdownRemaining <= 0) {
                this.stopCountdown();
                this.render();
            }
        }, 1000);
    },

    stopCountdown() {
        if (this.countdownTimer) {
            window.clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        this.countdownRemaining = 0;
    },

    updateCountdownButton() {
        if (!this.els.sendOtpBtn) return;

        if (this.countdownRemaining > 0) {
            this.els.sendOtpBtn.disabled = true;
            this.els.sendOtpBtn.textContent = `Gửi lại (${this.countdownRemaining}s)`;
        } else {
            this.els.sendOtpBtn.disabled = !document.getElementById('authModalOverlay')?.classList.contains('active');
            this.els.sendOtpBtn.textContent = 'Gửi lại mã';
        }
    },

    invalidateOtp() {
        if (!this.otpSent && !this.registrationStarted) return;

        this.stopCountdown();
        this.otpSent = false;
        this.registrationStarted = false;

        if (this.els.otpInput) this.els.otpInput.value = '';
        this.setStatus('');
        this.render();
    },

    updateStockAccountVisibility() {
        const company = this.checkedValue('brokerageCompany');
        const shouldShow = Boolean(company && company !== 'none');
        const modalOpen = Boolean(document.getElementById('authModalOverlay')?.classList.contains('active'));

        if (this.els.stockAccountGroup) this.els.stockAccountGroup.hidden = !shouldShow;
        if (this.els.stockAccountInput) {
            this.els.stockAccountInput.disabled = !shouldShow || !modalOpen;
            if (!shouldShow) this.els.stockAccountInput.value = '';
        }
    },

    updatePasswordStrength(password) {
        if (!this.els.strength || !this.els.strengthBar || !this.els.strengthLabel) return;

        const score = this.passwordScore(password);
        const map = [
            { width: '0%', label: 'Độ mạnh mật khẩu', strength: '' },
            { width: '34%', label: 'Mật khẩu yếu', strength: 'weak' },
            { width: '67%', label: 'Mật khẩu trung bình', strength: 'medium' },
            { width: '100%', label: 'Mật khẩu mạnh', strength: 'strong' },
        ];
        const state = map[score] || map[0];

        this.els.strength.dataset.strength = state.strength;
        this.els.strengthBar.style.width = state.width;
        this.els.strengthLabel.textContent = state.label;
    },

    passwordScore(password) {
        if (!password) return 0;

        let score = password.length >= 6 ? 1 : 0;
        if (password.length >= 10) score += 1;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
        if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

        return Math.min(3, score);
    },

    value(id, shouldTrim = true) {
        const input = document.getElementById(id);
        const value = input ? input.value : '';
        return shouldTrim ? value.trim() : value;
    },

    checkedValue(name) {
        return this.els.form?.querySelector(`input[name="${name}"]:checked`)?.value || '';
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    clearErrors(scope = this.els.form) {
        if (!scope) return;

        scope.querySelectorAll('.auth-field-error').forEach((error) => {
            error.textContent = '';
            error.classList.remove('is-visible');
        });
        scope.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
            field.removeAttribute('aria-invalid');
        });
    },

    clearFieldError(field) {
        if (!field || !this.els.form) return;
        const error = this.els.form.querySelector(`[data-error-for="${field}"]`);
        if (error) {
            error.textContent = '';
            error.classList.remove('is-visible');
        }

        const input = document.getElementById(field) || this.els.form.querySelector(`[name="${field}"]`);
        if (input) input.removeAttribute('aria-invalid');

        const group = this.els.form?.querySelector(`[data-required-group="${field}"]`);
        if (group) group.removeAttribute('aria-invalid');
    },

    setFieldError(field, message) {
        const error = this.els.form?.querySelector(`[data-error-for="${field}"]`);
        if (error) {
            error.textContent = message;
            error.classList.add('is-visible');
        }

        const input = document.getElementById(field);
        const group = this.els.form?.querySelector(`[data-required-group="${field}"]`);
        if (input) input.setAttribute('aria-invalid', 'true');
        if (group) group.setAttribute('aria-invalid', 'true');
    },

    focusField(field) {
        const input = document.getElementById(field)
            || this.els.form?.querySelector(`[name="${field}"]`);
        if (input && typeof input.focus === 'function') input.focus();
    },

    setStatus(message, type = 'info') {
        if (!this.els.otpStatus) return;

        this.els.otpStatus.hidden = !message;
        this.els.otpStatus.textContent = message || '';
        this.els.otpStatus.dataset.status = type;
    },

    setButtonLoading(button, loading, text) {
        if (!button) return;

        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = text || 'Đang xử lý...';
            button.disabled = true;
            return;
        }

        button.disabled = false;
        button.textContent = text || button.dataset.originalText || button.textContent;
    },
};

window.RegisterStepper = RegisterStepper;

/**
 * Toggle all inputs inside the authentication modal (except close buttons) to prevent browser autofill when hidden.
 * @param {boolean} enabled
 */
function toggleAuthInputs(enabled) {
    const authOverlay = document.getElementById('authModalOverlay');
    if (!authOverlay) return;
    const inputs = authOverlay.querySelectorAll('input, button, select, textarea');
    inputs.forEach(input => {
        if (input.classList.contains('btn-close-auth')) return;
        if (enabled) {
            input.removeAttribute('disabled');
        } else {
            input.setAttribute('disabled', 'true');
        }
    });
}
