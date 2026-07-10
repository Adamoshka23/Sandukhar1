/**
 * ============================================================
 * SAN DUKHAR — CART MODULE (FULLY FIXED — v4.0)
 * Shopping Cart Management with Persistent Storage
 * + Automatic re-render on language change
 * ============================================================
 *
 * FIXES IN THIS VERSION:
 * 1. No demo data injection — respects empty cart.
 * 2. localStorage.removeItem() when cart becomes empty.
 * 3. Proper item matching by id + variant for quantity increment.
 * 4. Global add-to-cart handler works repeatedly.
 * 5. XSS protection via HTML escaping.
 * 6. Subscribes to sd_i18n_changed event for re-render.
 * 7. Toast notification system.
 */

'use strict';

SANDUKHAR.cart = {
    items: [],
    storageKey: 'sandukhar_cart',
    initialized: false,

    /**
     * Initialize cart module.
     * Safe to call multiple times — runs only once.
     */
    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        this.loadCart();

        if (this.isCartPage()) {
            this.renderCart();
        }

        this.updateCartCount();
        this.bindGlobalEvents();
        this.subscribeToI18nEvents();
    },

    // ============================================================
    // STORAGE METHODS
    // ============================================================

    /**
     * Load cart from localStorage.
     * Never injects demo data. Respects user's actual state.
     */
    loadCart: function() {
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
            console.warn('SAN DUKHAR: Failed to parse cart data. Resetting.', error);
            this.items = [];
            localStorage.removeItem(this.storageKey);
        }
    },

    /**
     * Save cart to localStorage.
     * Removes key entirely when cart is empty.
     */
    saveCart: function() {
        try {
            if (this.items.length === 0) {
                localStorage.removeItem(this.storageKey);
            } else {
                localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            }
        } catch (error) {
            console.warn('SAN DUKHAR: Failed to save cart data.', error);
        }
    },

    // ============================================================
    // CART OPERATIONS
    // ============================================================

    /**
     * Add item to cart. Increments quantity if same id+variant exists.
     * @param {Object} product - { id, name, variant, price, quantity, image }
     */
    addItem: function(product) {
        if (!product || !product.id) {
            console.warn('SAN DUKHAR: Cannot add item without valid id.', product);
            return;
        }

        const existingIndex = this.items.findIndex(
            item => item.id === product.id && item.variant === product.variant
        );

        if (existingIndex > -1) {
            this.items[existingIndex].quantity += product.quantity || 1;
            if (this.items[existingIndex].quantity > 10) {
                this.items[existingIndex].quantity = 10;
            }
        } else {
            this.items.push({
                id: product.id,
                name: product.name || 'Unknown Product',
                variant: product.variant || '',
                price: product.price || 0,
                quantity: product.quantity || 1,
                image: product.image || ''
            });
        }

        this.saveCart();
        this.updateCartCount();

        if (this.isCartPage()) {
            this.renderCart();
        }

        this.showToast(
            this.i18n('cart_added', 'Added to your selection'),
            product.name
        );
    },

    /**
     * Remove item from cart by id.
     * @param {string} itemId
     */
    removeItem: function(itemId) {
        if (!itemId) return;

        const lengthBefore = this.items.length;
        this.items = this.items.filter(item => item.id !== itemId);

        if (this.items.length < lengthBefore) {
            this.saveCart();
            this.updateCartCount();

            if (this.isCartPage()) {
                this.renderCart();
            }
        }
    },

    /**
     * Update quantity for a specific item. Clamped 1–10.
     * @param {string} itemId
     * @param {number} newQuantity
     */
    updateQuantity: function(itemId, newQuantity) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        const quantity = Math.max(1, Math.min(10, parseInt(newQuantity, 10) || 1));

        if (item.quantity !== quantity) {
            item.quantity = quantity;
            this.saveCart();

            if (this.isCartPage()) {
                this.renderCart();
            }
        }
    },

    // ============================================================
    // CALCULATIONS
    // ============================================================

    /**
     * Calculate subtotal.
     * @returns {number}
     */
    getSubtotal: function() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    /**
     * Get total item count.
     * @returns {number}
     */
    getItemCount: function() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    // ============================================================
    // DOM UPDATES
    // ============================================================

    /**
     * Update all cart count badges in the header.
     */
    updateCartCount: function() {
        const count = this.getItemCount();
        const countElements = document.querySelectorAll('.cart-count');

        countElements.forEach(el => {
            el.textContent = count;
            if (count > 0) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    },

    /**
     * Render cart items on cart page.
     */
    renderCart: function() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        const cartSummary = document.getElementById('cart-summary');
        const cartLayout = document.getElementById('cart-layout');

        if (!cartItemsContainer) return;

        // Empty cart state
        if (this.items.length === 0) {
            if (cartItemsContainer) cartItemsContainer.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (cartEmpty) cartEmpty.style.display = 'block';
            if (cartLayout) cartLayout.style.display = 'block';
            return;
        }

        // Populated cart state
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartItemsContainer) cartItemsContainer.style.display = 'flex';
        if (cartSummary) cartSummary.style.display = 'block';
        if (cartLayout) cartLayout.style.display = 'grid';

        const removeText = this.i18n('remove', 'Remove');
        const noImageText = this.i18n('no_image', 'No image');

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${this.escapeHTML(item.id)}">
                <div class="cart-item-image">
                    ${item.image
                        ? `<img src="${this.escapeHTML(item.image)}" alt="${this.escapeHTML(item.name)}" loading="lazy">`
                        : `<div class="cart-item-image-placeholder" aria-hidden="true">
                            <span>${this.escapeHTML(noImageText)}</span>
                           </div>`
                    }
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${this.escapeHTML(item.name)}</h3>
                    ${item.variant ? `<p class="cart-item-variant">${this.escapeHTML(item.variant)}</p>` : ''}
                    <p class="cart-item-price">$${item.price.toLocaleString()}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="qty-btn qty-minus" data-id="${this.escapeHTML(item.id)}" aria-label="Decrease quantity">−</button>
                        <span class="qty-display" aria-live="polite">${item.quantity}</span>
                        <button class="qty-btn qty-plus" data-id="${this.escapeHTML(item.id)}" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${this.escapeHTML(item.id)}" aria-label="Remove ${this.escapeHTML(item.name)}">
                        ${this.escapeHTML(removeText)}
                    </button>
                </div>
            </div>
        `).join('');

        this.updateSummary();
        this.bindCartEvents();

        // Trigger i18n translation on newly added elements
        if (window.SD_I18N && window.SD_I18N.translatePage) {
            window.SD_I18N.translatePage();
        }
    },

    /**
     * Update order summary section.
     */
    updateSummary: function() {
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');
        const checkoutBtn = document.getElementById('btn-checkout');
        const shippingEl = document.getElementById('summary-shipping');
        const taxEl = document.getElementById('summary-tax');

        const subtotal = this.getSubtotal();

        if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toLocaleString();
        if (totalEl) totalEl.textContent = '$' + subtotal.toLocaleString();

        // Update shipping and tax texts via i18n
        if (shippingEl) {
            const shippingText = this.i18n('cart_shipping_value', 'Complimentary');
            shippingEl.textContent = shippingText;
        }
        if (taxEl) {
            const taxText = this.i18n('cart_tax_value', 'Included');
            taxEl.textContent = taxText;
        }

        if (checkoutBtn) {
            if (this.items.length === 0) {
                checkoutBtn.style.pointerEvents = 'none';
                checkoutBtn.style.opacity = '0.4';
                checkoutBtn.setAttribute('aria-disabled', 'true');
                checkoutBtn.setAttribute('tabindex', '-1');
            } else {
                checkoutBtn.style.pointerEvents = 'auto';
                checkoutBtn.style.opacity = '1';
                checkoutBtn.removeAttribute('aria-disabled');
                checkoutBtn.removeAttribute('tabindex');
            }
        }
    },

    // ============================================================
    // EVENT BINDING
    // ============================================================

    /**
     * Bind events to dynamically rendered cart item buttons.
     */
    bindCartEvents: function() {
        // Quantity decrease
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = this.items.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    this.updateQuantity(id, item.quantity - 1);
                }
            });
        });

        // Quantity increase
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = this.items.find(i => i.id === id);
                if (item && item.quantity < 10) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });

        // Remove item
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.removeItem(id);
            });
        });

        // Promo code
        const promoInput = document.getElementById('promo-code');
        if (promoInput) {
            if (promoInput._keypressHandler) {
                promoInput.removeEventListener('keypress', promoInput._keypressHandler);
            }
            const handler = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyPromoCode(promoInput.value);
                }
            };
            promoInput._keypressHandler = handler;
            promoInput.addEventListener('keypress', handler);
        }
    },

    /**
     * Global click handler for "Add to Cart" buttons on all pages.
     */
    bindGlobalEvents: function() {
        document.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.btn-add-to-cart');
            if (!addBtn) return;

            if (addBtn.tagName === 'A' || addBtn.closest('a')) {
                e.preventDefault();
            }

            const productData = this.extractProductData(addBtn);
            if (productData) {
                this.addItem(productData);

                const originalHTML = addBtn.innerHTML;
                addBtn.classList.add('added');
                addBtn.innerHTML = this.i18n('product_added_to_cart', '✓ Added to Cart');

                setTimeout(() => {
                    addBtn.classList.remove('added');
                    addBtn.innerHTML = originalHTML;
                }, 2000);
            }
        });
    },

    /**
     * Subscribe to language change events for automatic re-render.
     */
    subscribeToI18nEvents: function() {
        const self = this;
        document.addEventListener('sd_i18n_changed', function() {
            if (self.isCartPage()) {
                self.renderCart();
            }
            self.updateCartCount();
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
     * Extract product data from button context.
     * @param {HTMLElement} btn
     * @returns {Object|null}
     */
    extractProductData: function(btn) {
        let id = btn.getAttribute('data-product-id');
        if (!id) {
            const parentWithId = btn.closest('[data-product-id]');
            if (parentWithId) id = parentWithId.getAttribute('data-product-id');
        }
        if (!id) return null;

        const productSection =
            btn.closest('.product-details') ||
            btn.closest('.product-card') ||
            btn.closest('.quick-view-details') ||
            btn.closest('.product-layout');

        const nameEl = productSection
            ? productSection.querySelector('.product-title, .product-card-name, .quick-view-name')
            : null;
        const priceEl = productSection
            ? productSection.querySelector('.product-price, .product-card-price, .quick-view-price')
            : null;
        const variantColorEl = document.getElementById('selected-color');
        const variantHardwareEl = document.getElementById('selected-hardware');
        const imageEl =
            document.getElementById('main-product-image') ||
            (productSection ? productSection.querySelector('img') : null);

        const name = nameEl ? nameEl.textContent.trim() : 'Product';
        const priceText = priceEl ? priceEl.textContent.replace(/[^0-9]/g, '') : '0';
        const price = parseInt(priceText, 10) || 0;

        const variantParts = [];
        if (variantColorEl) variantParts.push(variantColorEl.textContent.trim());
        if (variantHardwareEl) variantParts.push(variantHardwareEl.textContent.trim());
        const variant = variantParts.join(' · ');

        const image = imageEl ? imageEl.getAttribute('src') : '';

        return { id, name, variant, price, quantity: 1, image };
    },

    /**
     * Apply promo code.
     * @param {string} code
     */
    applyPromoCode: function(code) {
        if (!code || !code.trim()) return;
        const cleanCode = code.trim().toUpperCase();
        this.showToast(
            this.i18n('promo_applied', 'Promo code applied'),
            cleanCode
        );
    },

    /**
     * Check if current page is cart page.
     * @returns {boolean}
     */
    isCartPage: function() {
        return window.location.pathname.includes('cart.html');
    },

    /**
     * Show toast notification.
     * @param {string} title
     * @param {string} message
     */
    showToast: function(title, message) {
        document.querySelectorAll('.sd-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'sd-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <span class="sd-toast-icon" aria-hidden="true">✓</span>
            <div class="sd-toast-content">
                <span class="sd-toast-title">${this.escapeHTML(title)}</span>
                ${message ? `<span class="sd-toast-message">${this.escapeHTML(message)}</span>` : ''}
            </div>
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        setTimeout(() => {
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
        }, 3000);
    },

    /**
     * Escape HTML to prevent XSS.
     * @param {string} str
     * @returns {string}
     */
    escapeHTML: function(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
};

// ============================================================
// TOAST STYLES — Injected once
// ============================================================
(function injectToastStyles() {
    if (document.getElementById('sd-toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'sd-toast-styles';
    style.textContent = `
        .sd-toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--color-graphite, #1a1a1a);
            border: 1px solid var(--color-gold, #c5a572);
            border-radius: var(--border-radius-sm, 2px);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 1000;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-luxury, 0 20px 60px rgba(0, 0, 0, 0.3));
            max-width: 420px;
            pointer-events: none;
        }
        .sd-toast.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .sd-toast-icon {
            color: var(--color-gold, #c5a572);
            font-size: 1.3rem;
            font-weight: var(--font-weight-semibold, 600);
            flex-shrink: 0;
            line-height: 1;
        }
        .sd-toast-content {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            min-width: 0;
        }
        .sd-toast-title {
            color: var(--color-white, #ffffff);
            font-size: var(--font-size-small, 0.85rem);
            font-weight: var(--font-weight-medium, 500);
            letter-spacing: 0.02em;
        }
        .sd-toast-message {
            color: var(--color-text-secondary, #b0a89e);
            font-size: var(--font-size-caption, 0.75rem);
            letter-spacing: 0.03em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .cart-item-image-placeholder {
            width: 100%;
            aspect-ratio: 1;
            background: var(--color-charcoal, #2a2a2a);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--border-radius-sm, 2px);
        }
        .cart-item-image-placeholder span {
            color: var(--color-text-muted, #8a8278);
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        @media screen and (max-width: 767px) {
            .sd-toast {
                left: 1rem;
                right: 1rem;
                bottom: 1rem;
                max-width: none;
                padding: 0.9rem 1.2rem;
            }
        }
    `;
    document.head.appendChild(style);
})();

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    SANDUKHAR.cart.init();
});