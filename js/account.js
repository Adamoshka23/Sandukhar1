/**
 * SAN DUKHAR — ACCOUNT MODULE
 * Authentication gate + account dashboard (orders, addresses, measurements, profile)
 */
'use strict';

SANDUKHAR.account = {
    currentUser: null,

    init: function() {
        if (!document.getElementById('auth-gate')) return;

        this.bindAuthTabs();
        this.bindAuthForms();
        this.bindDashboardNav();
        this.bindLogout();
        this.bindAddressForm();
        this.bindMeasurementsForm();
        this.bindProfileForm();

        this.checkSession();
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
            btn.textContent = 'Signing In…';

            window.SD_API.login(
                document.getElementById('login-email').value.trim(),
                document.getElementById('login-password').value
            ).then((res) => {
                self.currentUser = res.data.user;
                self.showDashboard();
            }).catch((err) => {
                msg.textContent = err.message || 'Invalid email or password.';
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = 'Sign In';
            });
        });

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('register-submit');
            const msg = document.getElementById('register-message');
            msg.className = 'form-message';

            const password = document.getElementById('register-password').value;
            if (password.length < 8) {
                msg.textContent = 'Password must be at least 8 characters.';
                msg.className = 'form-message error';
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Creating Account…';

            window.SD_API.register({
                firstName: document.getElementById('register-first-name').value.trim(),
                lastName: document.getElementById('register-last-name').value.trim(),
                email: document.getElementById('register-email').value.trim(),
                password: password
            }).then((res) => {
                self.currentUser = res.data.user;
                self.showDashboard();
            }).catch((err) => {
                msg.textContent = err.message || 'Could not create account.';
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = 'Create Account';
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
        window.SD_API.getOrders().then((res) => {
            const orders = res.data.orders;
            if (orders.length === 0) {
                list.innerHTML = '<div class="empty-state"><p>You have not placed any orders yet.</p><a href="catalog.html" class="btn-outline">Explore Collections</a></div>';
                return;
            }
            list.innerHTML = orders.map(order => {
                const statusClass = order.status === 'delivered' ? 'delivered' : 'in-progress';
                const itemsSummary = (order.items || []).map(i => i.product_name).join(', ');
                return `<div class="order-card">
                    <div class="order-card-header">
                        <span class="order-number">#${order.order_number}</span>
                        <span class="order-status ${statusClass}">${order.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
                        <span class="order-date">Placed on ${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span class="order-total">${SANDUKHAR.format.price(order.total)}</span>
                    </div>
                    ${itemsSummary ? `<p style="font-size:var(--font-size-caption);color:var(--color-text-muted);margin-top:0.5rem;">${itemsSummary}</p>` : ''}
                    <a href="track-order.html?order=${order.order_number}&email=${encodeURIComponent((order.shipping_address || {}).email || '')}" class="btn-outline" style="margin-top:1rem;display:inline-block;font-size:var(--font-size-caption);padding:0.5rem 1.2rem;">Track Order</a>
                </div>`;
            }).join('');
        }).catch(() => {
            list.innerHTML = '<div class="empty-state"><p>Could not load your orders. Please try again later.</p></div>';
        });
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
                msg.textContent = err.message || 'Could not save address.';
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
            });
        });
    },

    loadAddresses: function() {
        const list = document.getElementById('addresses-list');
        window.SD_API.getAddresses().then((res) => {
            const addresses = res.data.addresses;
            if (addresses.length === 0) {
                list.innerHTML = '<div class="empty-state"><p>No saved addresses yet.</p></div>';
                return;
            }
            list.innerHTML = addresses.map(a => `
                <div class="address-card">
                    <h4>${a.label}${a.is_default ? ' (Default)' : ''}</h4>
                    <p>${a.first_name} ${a.last_name}<br>${a.address_line1}<br>${a.city}, ${a.postal_code}<br>${a.country}</p>
                    <button class="btn-outline" style="margin-top:0.8rem;font-size:var(--font-size-caption);padding:0.4rem 1rem;" data-address-id="${a.id}">Remove</button>
                </div>
            `).join('');
            list.querySelectorAll('[data-address-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    window.SD_API.deleteAddress(btn.getAttribute('data-address-id')).then(() => this.loadAddresses());
                });
            });
        }).catch(() => {
            list.innerHTML = '<div class="empty-state"><p>Could not load addresses.</p></div>';
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
            btn.textContent = 'Saving…';

            window.SD_API.updateProfile({
                measurements: {
                    chest: document.getElementById('measure-chest').value,
                    waist: document.getElementById('measure-waist').value,
                    shoulder: document.getElementById('measure-shoulder').value,
                    sleeve: document.getElementById('measure-sleeve').value
                }
            }).then(() => {
                msg.textContent = 'Measurements saved.';
                msg.className = 'form-message success';
            }).catch((err) => {
                msg.textContent = err.message || 'Could not save measurements.';
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = 'Save Measurements';
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
            btn.textContent = 'Saving…';

            window.SD_API.updateProfile({
                firstName: document.getElementById('profile-first-name').value.trim(),
                lastName: document.getElementById('profile-last-name').value.trim(),
                phone: document.getElementById('profile-phone').value.trim()
            }).then((res) => {
                this.currentUser = Object.assign(this.currentUser, res.data.user);
                msg.textContent = 'Profile updated.';
                msg.className = 'form-message success';
            }).catch((err) => {
                msg.textContent = err.message || 'Could not update profile.';
                msg.className = 'form-message error';
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = 'Update Profile';
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SANDUKHAR.account.init();
});
