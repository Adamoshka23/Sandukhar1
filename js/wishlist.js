/**
 * ============================================================
 * SAN DUKHAR — WISHLIST MODULE (FULLY FIXED — v3.0)
 * Wishlist Management with Persistent Storage
 * + Automatic re-render on language change
 * ============================================================
 *
 * FIXES IN THIS VERSION:
 * 1. Toggle wishlist items in localStorage.
 * 2. Update all wishlist buttons across the site.
 * 3. Subscribes to sd_i18n_changed event for UI update.
 * 4. Dispatches custom events for wishlist page re-render.
 * 5. Works with both static and dynamic product cards.
 */

'use strict';

SANDUKHAR.wishlist = {
    items: [],
    storageKey: 'sandukhar_wishlist',
    initialized: false,

    /**
     * Initialize wishlist module.
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        this.loadWishlist();
        this.bindEvents();
        this.updateAllWishlistButtons();
        this.subscribeToI18nEvents();
        this.syncFromServer();
    },

    /**
     * If the user is logged in, pull their server-side wishlist so it's
     * consistent across devices, merging with any local guest selections.
     */
    syncFromServer: function() {
        if (!window.SD_API || !window.SD_API.token) return;
        window.SD_API.getWishlist().then((res) => {
            if (!res.success) return;
            const serverIds = res.data.items.map(item => item.id);
            const merged = Array.from(new Set([...this.items, ...serverIds]));
            this.items = merged;
            this.saveWishlist();
            this.updateAllWishlistButtons();
            document.dispatchEvent(new CustomEvent('wishlistUpdated'));
        }).catch(() => {});
    },

    // ============================================================
    // STORAGE METHODS
    // ============================================================

    /**
     * Load wishlist from localStorage.
     */
    loadWishlist: function() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    this.items = parsed;
                } else {
                    this.items = [];
                    localStorage.removeItem(this.storageKey);
                }
            } else {
                this.items = [];
            }
        } catch (error) {
            console.warn('SAN DUKHAR: Failed to parse wishlist data. Resetting.', error);
            this.items = [];
            localStorage.removeItem(this.storageKey);
        }
    },

    /**
     * Save wishlist to localStorage.
     */
    saveWishlist: function() {
        try {
            if (this.items.length === 0) {
                localStorage.removeItem(this.storageKey);
            } else {
                localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            }
        } catch (error) {
            console.warn('SAN DUKHAR: Failed to save wishlist data.', error);
        }
    },

    // ============================================================
    // WISHLIST OPERATIONS
    // ============================================================

    /**
     * Toggle a product in/out of wishlist.
     * @param {string} productId
     */
    toggle: function(productId) {
        if (!productId) return;

        if (window.SD_API && window.SD_API.token) {
            window.SD_API.toggleWishlist(productId).catch(() => {});
        }

        const index = this.items.indexOf(productId);

        if (index > -1) {
            // Remove from wishlist
            this.items.splice(index, 1);
            this.saveWishlist();
            this.updateAllWishlistButtons();

            // Dispatch event for wishlist page
            document.dispatchEvent(new CustomEvent('wishlistUpdated'));

            // Optional toast notification
            if (window.SANDUKHAR && window.SANDUKHAR.cart && window.SANDUKHAR.cart.showToast) {
                window.SANDUKHAR.cart.showToast(
                    this.i18n('wishlist_removed', 'Removed from wishlist')
                );
            }
        } else {
            // Add to wishlist
            this.items.push(productId);
            this.saveWishlist();
            this.updateAllWishlistButtons();

            // Dispatch event for wishlist page
            document.dispatchEvent(new CustomEvent('wishlistUpdated'));

            // Optional toast notification
            if (window.SANDUKHAR && window.SANDUKHAR.cart && window.SANDUKHAR.cart.showToast) {
                window.SANDUKHAR.cart.showToast(
                    this.i18n('wishlist_added', 'Added to wishlist')
                );
            }
        }
    },

    /**
     * Check if a product is in the wishlist.
     * @param {string} productId
     * @returns {boolean}
     */
    isInWishlist: function(productId) {
        return this.items.includes(productId);
    },

    /**
     * Get wishlist item count.
     * @returns {number}
     */
    getCount: function() {
        return this.items.length;
    },

    // ============================================================
    // DOM UPDATES
    // ============================================================

    /**
     * Update all wishlist buttons on the page.
     * Adds/removes 'active' class based on wishlist state.
     */
    updateAllWishlistButtons: function() {
        const allButtons = document.querySelectorAll('.btn-wishlist, .btn-wishlist-large');

        allButtons.forEach(btn => {
            const productId = btn.getAttribute('data-product-id');
            if (!productId) return;

            if (this.isInWishlist(productId)) {
                btn.classList.add('active');
                // Update SVG fill if it exists
                const svg = btn.querySelector('svg');
                if (svg) {
                    svg.setAttribute('fill', 'currentColor');
                }
            } else {
                btn.classList.remove('active');
                // Reset SVG fill if it exists
                const svg = btn.querySelector('svg');
                if (svg) {
                    svg.setAttribute('fill', 'none');
                }
            }
        });
    },

    // ============================================================
    // EVENT BINDING
    // ============================================================

    /**
     * Bind click events to wishlist buttons.
     * Uses event delegation on document for dynamic elements.
     */
    bindEvents: function() {
        const self = this;

        document.addEventListener('click', function(e) {
            // Find closest wishlist button
            const wishlistBtn = e.target.closest('.btn-wishlist, .btn-wishlist-large');
            if (!wishlistBtn) return;

            // Prevent navigation if button is inside a link
            e.preventDefault();
            e.stopPropagation();

            const productId = wishlistBtn.getAttribute('data-product-id');
            if (productId) {
                self.toggle(productId);
            }
        });
    },

    /**
     * Subscribe to language change events.
     * Updates all buttons to reflect current language.
     */
    subscribeToI18nEvents: function() {
        const self = this;

        document.addEventListener('sd_i18n_changed', function() {
            // Update all wishlist buttons
            self.updateAllWishlistButtons();

            // If on wishlist page, trigger re-render
            if (self.isWishlistPage()) {
                document.dispatchEvent(new CustomEvent('wishlistUpdated'));
            }
        });
    },

    // ============================================================
    // HELPERS
    // ============================================================

    /**
     * Get translated string or fallback.
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

    /**
     * Check if current page is the wishlist page.
     * @returns {boolean}
     */
    isWishlistPage: function() {
        return window.location.pathname.includes('wishlist.html');
    }
};

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    SANDUKHAR.wishlist.init();
});