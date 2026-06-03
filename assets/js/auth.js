document.addEventListener('DOMContentLoaded', () => {
    // 1. User Dropdown Logic
    const userDropdownContainer = document.getElementById('userDropdownContainer');
    
    if (userDropdownContainer) {
        userDropdownContainer.addEventListener('click', (e) => {
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
    }

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
                    this.textContent = '🙈'; // Change icon to hide
                } else {
                    inputField.type = 'password';
                    this.textContent = '👁️'; // Change icon to show
                }
            }
        });
    });

    updateAdminAccessLink();
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
        // Switch to requested view first
        switchAuthView(view, false);
        
        // Show modal
        authOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

/**
 * Close the authentication modal
 */
function closeAuthModal() {
    const authOverlay = document.getElementById('authModalOverlay');
    if (authOverlay) {
        authOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
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
    
    if (!loginForm || !registerForm) return;

    if (view === 'register') {
        if (animate) {
            loginForm.classList.remove('active');
            loginForm.classList.add('slide-left');
            
            setTimeout(() => {
                registerForm.classList.remove('slide-left');
                registerForm.classList.add('active');
            }, 50); // Small delay to let browser process class changes
        } else {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        }
    } else { // 'login'
        if (animate) {
            registerForm.classList.remove('active');
            registerForm.style.transform = 'translateX(20px)'; // Reset position for next time
            
            setTimeout(() => {
                loginForm.classList.remove('slide-left');
                loginForm.classList.add('active');
            }, 50);
        } else {
            registerForm.classList.remove('active');
            loginForm.classList.remove('slide-left');
            loginForm.classList.add('active');
        }
    }
}

/**
 * Simulate form submission
 */
function submitAuth(event, type) {
    event.preventDefault();
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
