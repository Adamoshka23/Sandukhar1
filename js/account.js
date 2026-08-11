/**
 * SAN DUKHAR — ACCOUNT MODULE
 * Authentication gate + account dashboard (orders, addresses, measurements, profile)
 */
'use strict';

const ORDER_STATUS_KEYS = {
    pending: 'order_status_pending',
    confirmed: 'order_status_confirmed',
    in_production: 'order_status_in_production',
    quality_check: 'order_status_quality_check',
    shipped: 'order_status_shipped',
    delivered: 'order_status_delivered',
    cancelled: 'order_status_cancelled',
    returned: 'order_status_returned'
};

SANDUKHAR.account = {
    currentUser: null,
    resetToken: null,

    init: function() {
        if (!document.getElementById('auth-gate')) return;

        this.bindAuthTabs();
        this.bindAuthForms();
        this.bindDashboardNav();
        this.bindLogout();
        this.bindAddressForm();
        this.bindMeasurementsForm();
        this.bindProfileForm();
        this.bindResendVerification();
        this.bindForgotPassword();
        this.bindForgotPasswordForm();
        this.bindResetPasswordForm();

        this.handleEmailVerificationLink();
        this.handlePasswordResetLink();
        this.checkSession();
    },

    /**
     * @param {string} key
     * @param {string} fallback
     * @returns {string}
     */
    i18n: function(key, fallback) {
        if (window.SD_I18N && typeof window.SD_I18N.t === 'function') {
            return window.SD_I18N.t(key);
        }
        return fallback;
    },

    // ============================================================
    // EMAIL VERIFICATION
    // ============================================================
    handleEmailVerificationLink: function() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('verify');
        if (!token) return;

        // Strip the token from the URL so it can't be reused/shared accidentally.
        window.history.replaceState({}, '', window.location.pathname);

        const msg = document.getElementById('verify-result-message');
        window.SD_API.verifyEmail(token).then(() => {
            msg.textContent = this.i18n('auth_email_verified', 'Your email has been verified.');
            msg.className = 'form-message success';
            msg.style.display = 'block';
            if (this.currentUser) {
                this.currentUser.emailVerified = true;
                this.updateVerifyBanner();
            }
        }).catch((err) => {
            msg.textContent = err.message || this.i18n('auth_verify_link_invalid', 'This verification link is invalid or has expired.');
            msg.className = 'form-message error';
            msg.style.display = 'block';
        });
    },

    updateVerifyBanner: function() {
        const banner = document.getElementById('email-verify-banner');
        if (!banner) return;
        banner.style.display = (this.currentUser && !this.currentUser.emailVerified) ? 'flex' : 'none';
    },

    bindResendVerification: function() {
        const btn = document.getElementById('resend-verification-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = this.i18n('auth_sending', 'Sending…');
            window.SD_API.resendVerification().then(() => {
                btn.textContent = this.i18n('auth_verification_sent', 'Sent!');
            }).catch(() => {
                btn.textContent = this.i18n('auth_verification_failed', 'Failed — try again');
            }).finally(() => {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }, 3000);
            });
        });
    },

    // ============================================================
    // PASSWORD RESET
    // ============================================================
    handlePasswordResetLink: function() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('reset');
        if (!token) return;

        // Strip the token from the URL so it can't be reused/shared accidentally.
        window.history.replaceState({}, '', window.location.pathname);

        this.resetToken = token;
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.querySelector('.auth-tabs').style.display = 'none';
        document.getElementById('reset-password-form').classList.add('active');
    },

    bindForgotPassword: function() {
        const link = document.getElementById('forgot-password-link');
        const backLink = document.getElementById('back-to-login-link');

        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.querySelector('.auth-tabs').style.display = 'none';
                document.getElementById('forgot-password-form').classList.add('active');
            });
        }

        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.querySelector('.auth-tabs').style.display = 'flex';
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                document.getElementById('login-form').classList.add('active');
            });
        }
    },

    bindForgotPasswordForm: function() {
        const form = document.getElementById('forgot-password-form');
        if (!form) return;
        const self = this;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('forgot-password-submit');
            const msg = document.getElementById('forgot-password-message');
            msg.className = 'form-message';
            btn.disabled = true;
            btn.textContent = self.i18n('auth_sending', 'Sending…');

            window.SD_API.forgotPassword(document.getElementById('forgot-password-email').value.trim()).then(() => {
                msg.textContent = self.i18n('auth_reset_link_sent', 'If an account exists for that email, a reset link has been sent.');
                msg.className = 'form-message success';
                form.reset();
            }).catch((err) => {
                msg.textContent = err.message || self.i18n('auth_generic_error', 'Something went wrong. Please try again.');
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = self.i18n('auth_send_reset_link', 'Send Reset Link');
            });
        });
    },

    bindResetPasswordForm: function() {
        const form = document.getElementById('reset-password-form');
        if (!form) return;
        const self = this;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('reset-password-submit');
            const msg = document.getElementById('reset-password-message');
            msg.className = 'form-message';

            const password = document.getElementById('reset-password-new').value;
            const confirmPassword = document.getElementById('reset-password-confirm').value;

            if (password.length < 8) {
                msg.textContent = self.i18n('auth_password_min_length', 'Password must be at least 8 characters.');
                msg.className = 'form-message error';
                return;
            }
            if (password !== confirmPassword) {
                msg.textContent = self.i18n('auth_passwords_no_match', 'Passwords do not match.');
                msg.className = 'form-message error';
                return;
            }

            btn.disabled = true;
            btn.textContent = self.i18n('auth_saving', 'Saving…');

            window.SD_API.resetPassword(self.resetToken, password).then(() => {
                msg.textContent = self.i18n('auth_password_updated', 'Password updated. You can now sign in.');
                msg.className = 'form-message success';
                form.reset();
                setTimeout(() => {
                    document.getElementById('reset-password-form').classList.remove('active');
                    document.querySelector('.auth-tabs').style.display = 'flex';
                    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                    document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                    document.getElementById('login-form').classList.add('active');
                }, 1800);
            }).catch((err) => {
                msg.textContent = err.message || self.i18n('auth_reset_link_invalid', 'This reset link is invalid or has expired.');
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = self.i18n('auth_set_new_password', 'Set New Password');
            });
        });
    },

    // ============================================================
    // SESSION
    // ============================================================
    checkSession: function() {
        const token = localStorage.getItem('sandukhar_token');
        if (!token) {
            this.showAuthGate();
            return;
        }
        window.SD_API.getMe().then((res) => {
            this.currentUser = res.data.user;
            this.showDashboard();
        }).catch(() => {
            window.SD_API.setToken(null);
            this.showAuthGate();
        });
    },

    showAuthGate: function() {
        document.getElementById('auth-gate').style.display = 'block';
        document.getElementById('account-dashboard').style.display = 'none';
    },

    showDashboard: function() {
        document.getElementById('auth-gate').style.display = 'none';
        document.getElementById('account-dashboard').style.display = 'block';
        this.populateProfile();
        this.loadOrders();
        this.loadAddresses();
        this.updateVerifyBanner();
    },

    // ============================================================
    // AUTH TABS + FORMS
    // ============================================================
    bindAuthTabs: function() {
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.getElementById(tab.getAttribute('data-tab') + '-form').classList.add('active');
            });
        });
    },

    bindAuthForms: function() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const self = this;

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('login-submit');
            const msg = document.getElementById('login-message');
            msg.className = 'form-message';
            btn.disabled = true;
            btn.textContent = self.i18n('auth_signing_in', 'Signing In…');

            window.SD_API.login(
                document.getElementById('login-email').value.trim(),
                document.getElementById('login-password').value
            ).then((res) => {
                self.currentUser = res.data.user;
                self.showDashboard();
            }).catch((err) => {
                msg.textContent = err.message || self.i18n('auth_invalid_credentials', 'Invalid email or password.');
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = self.i18n('auth_sign_in', 'Sign In');
            });
        });

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('register-submit');
            const msg = document.getElementById('register-message');
            msg.className = 'form-message';

            const password = document.getElementById('register-password').value;
            if (password.length < 8) {
                msg.textContent = self.i18n('auth_password_min_length', 'Password must be at least 8 characters.');
                msg.className = 'form-message error';
                return;
            }

            btn.disabled = true;
            btn.textContent = self.i18n('auth_creating_account', 'Creating Account…');

            window.SD_API.register({
                firstName: document.getElementById('register-first-name').value.trim(),
                lastName: document.getElementById('register-last-name').value.trim(),
                email: document.getElementById('register-email').value.trim(),
                password: password
            }).then((res) => {
                self.currentUser = res.data.user;
                self.showDashboard();
            }).catch((err) => {
                msg.textContent = err.message || self.i18n('auth_could_not_create_account', 'Could not create account.');
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = self.i18n('auth_create_account', 'Create Account');
            });
        });
    },

    bindLogout: function() {
        const btn = document.getElementById('logout-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            window.SD_API.logout().finally(() => {
                this.currentUser = null;
                this.showAuthGate();
            });
        });
    },

    // ============================================================
    // DASHBOARD NAV (tabs)
    // ============================================================
    bindDashboardNav: function() {
        const nav = document.getElementById('account-nav');
        if (!nav) return;
        const buttons = nav.querySelectorAll('.account-nav-btn');
        const sections = document.querySelectorAll('.account-section');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sections.forEach(section => section.classList.remove('active'));
                const target = document.getElementById('section-' + btn.getAttribute('data-section'));
                if (target) target.classList.add('active');
            });
        });
    },

    // ============================================================
    // ORDERS
    // ============================================================
    loadOrders: function() {
        const list = document.getElementById('orders-list');
        const self = this;
        window.SD_API.getOrders().then((res) => {
            const orders = res.data.orders;
            if (orders.length === 0) {
                list.innerHTML = `<div class="empty-state"><p>${self.i18n('account_no_orders', 'You have not placed any orders yet.')}</p><a href="catalog.html" class="btn-outline">${self.i18n('cart_empty_btn', 'Explore Collections')}</a></div>`;
                return;
            }
            list.innerHTML = orders.map(order => {
                const statusClass = order.status === 'delivered' ? 'delivered' : 'in-progress';
                const statusLabel = self.i18n(ORDER_STATUS_KEYS[order.status], order.status.replace(/_/g, ' '));
                const itemsSummary = (order.items || []).map(i => i.product_name).join(', ');
                return `<div class="order-card">
                    <div class="order-card-header">
                        <span class="order-number">#${order.order_number}</span>
                        <span class="order-status ${statusClass}">${statusLabel}</span>
                    </div>
                    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:0.5rem;">
                        <span class="order-date">${self.i18n('account_placed_on', 'Placed on')} ${new Date(order.created_at).toLocaleDateString(self.currentLocale(), { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    ${itemsSummary ? `<p style="font-size:var(--font-size-caption);color:var(--color-text-muted);margin-top:0.5rem;">${itemsSummary}</p>` : ''}
                    <a href="track-order.html?order=${order.order_number}&email=${encodeURIComponent((order.shipping_address || {}).email || '')}" class="btn-outline" style="margin-top:1rem;display:inline-block;font-size:var(--font-size-caption);padding:0.5rem 1.2rem;">${self.i18n('footer_track', 'Track Order')}</a>
                </div>`;
            }).join('');
        }).catch(() => {
            list.innerHTML = `<div class="empty-state"><p>${self.i18n('account_could_not_load_orders', 'Could not load your orders. Please try again later.')}</p></div>`;
        });
    },

    currentLocale: function() {
        const lang = (window.SD_I18N && window.SD_I18N.getLang) ? window.SD_I18N.getLang() : 'en';
        return lang === 'ru' ? 'ru-RU' : 'en-US';
    },

    // ============================================================
    // ADDRESSES
    // ============================================================
    bindAddressForm: function() {
        const showBtn = document.getElementById('show-address-form-btn');
        const form = document.getElementById('address-form');
        if (!showBtn || !form) return;

        showBtn.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'flex' : 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const msg = document.getElementById('address-message');
            btn.disabled = true;

            window.SD_API.createAddress({
                firstName: document.getElementById('addr-first-name').value.trim(),
                lastName: document.getElementById('addr-last-name').value.trim(),
                addressLine1: document.getElementById('addr-line1').value.trim(),
                city: document.getElementById('addr-city').value.trim(),
                postalCode: document.getElementById('addr-postal').value.trim(),
                country: document.getElementById('addr-country').value.trim(),
                phone: document.getElementById('addr-phone').value.trim(),
                isDefault: true
            }).then(() => {
                form.reset();
                form.style.display = 'none';
                this.loadAddresses();
            }).catch((err) => {
                msg.textContent = err.message || this.i18n('account_could_not_save_address', 'Could not save address.');
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
            });
        });
    },

    loadAddresses: function() {
        const list = document.getElementById('addresses-list');
        const self = this;
        window.SD_API.getAddresses().then((res) => {
            const addresses = res.data.addresses;
            if (addresses.length === 0) {
                list.innerHTML = `<div class="empty-state"><p>${self.i18n('account_no_addresses', 'No saved addresses yet.')}</p></div>`;
                return;
            }
            list.innerHTML = addresses.map(a => `
                <div class="address-card">
                    <h4>${a.label}${a.is_default ? ' ' + self.i18n('account_default', '(Default)') : ''}</h4>
                    <p>${a.first_name} ${a.last_name}<br>${a.address_line1}<br>${a.city}, ${a.postal_code}<br>${a.country}</p>
                    <button class="btn-outline" style="margin-top:0.8rem;font-size:var(--font-size-caption);padding:0.4rem 1rem;" data-address-id="${a.id}">${self.i18n('remove', 'Remove')}</button>
                </div>
            `).join('');
            list.querySelectorAll('[data-address-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    window.SD_API.deleteAddress(btn.getAttribute('data-address-id')).then(() => self.loadAddresses());
                });
            });
        }).catch(() => {
            list.innerHTML = `<div class="empty-state"><p>${self.i18n('account_could_not_load_addresses', 'Could not load addresses.')}</p></div>`;
        });
    },

    // ============================================================
    // MEASUREMENTS
    // ============================================================
    bindMeasurementsForm: function() {
        const form = document.getElementById('measurements-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const msg = document.getElementById('measurements-message');
            btn.disabled = true;
            btn.textContent = this.i18n('auth_saving', 'Saving…');

            window.SD_API.updateProfile({
                measurements: {
                    chest: document.getElementById('measure-chest').value,
                    waist: document.getElementById('measure-waist').value,
                    shoulder: document.getElementById('measure-shoulder').value,
                    sleeve: document.getElementById('measure-sleeve').value
                }
            }).then(() => {
                msg.textContent = this.i18n('account_measurements_saved', 'Measurements saved.');
                msg.className = 'form-message success';
            }).catch((err) => {
                msg.textContent = err.message || this.i18n('account_could_not_save_measurements', 'Could not save measurements.');
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = this.i18n('account_save_measurements', 'Save Measurements');
            });
        });
    },

    // ============================================================
    // PROFILE
    // ============================================================
    populateProfile: function() {
        if (!this.currentUser) return;
        const u = this.currentUser;
        document.getElementById('profile-first-name').value = u.firstName || '';
        document.getElementById('profile-last-name').value = u.lastName || '';
        document.getElementById('profile-email').value = u.email || '';
        document.getElementById('profile-phone').value = u.phone || '';

        if (u.measurements) {
            const m = u.measurements;
            if (document.getElementById('measure-chest')) document.getElementById('measure-chest').value = m.chest || '';
            if (document.getElementById('measure-waist')) document.getElementById('measure-waist').value = m.waist || '';
            if (document.getElementById('measure-shoulder')) document.getElementById('measure-shoulder').value = m.shoulder || '';
            if (document.getElementById('measure-sleeve')) document.getElementById('measure-sleeve').value = m.sleeve || '';
        }
    },

    bindProfileForm: function() {
        const form = document.getElementById('profile-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const msg = document.getElementById('profile-message');
            btn.disabled = true;
            btn.textContent = this.i18n('auth_saving', 'Saving…');

            window.SD_API.updateProfile({
                firstName: document.getElementById('profile-first-name').value.trim(),
                lastName: document.getElementById('profile-last-name').value.trim(),
                phone: document.getElementById('profile-phone').value.trim()
            }).then((res) => {
                this.currentUser = Object.assign(this.currentUser, res.data.user);
                msg.textContent = this.i18n('account_profile_updated', 'Profile updated.');
                msg.className = 'form-message success';
            }).catch((err) => {
                msg.textContent = err.message || this.i18n('account_could_not_update_profile', 'Could not update profile.');
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = this.i18n('account_update_profile', 'Update Profile');
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SANDUKHAR.account.init();
});
