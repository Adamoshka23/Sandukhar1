/**
 * ============================================================
 * SAN DUKHAR — MAIN APPLICATION LOGIC (v4.0 — I18N COMPLETE)
 * Luxury Exotic Leather Atelier
 * ============================================================
 */

'use strict';

const SANDUKHAR = {
    version: '4.0.0',

    init: function() {
        this.header.init();
        this.searchOverlay.init();
        this.mobileNav.init();
        this.scrollAnimations.init();
        this.quickView.init();
        this.lazyLoading.init();
        this.smoothScroll.init();
        this.testimonialSlider.init();
        this.magneticButtons.init();
        this.handleVisibilityChange();
        this.handleExternalLinks();
    },

    handleVisibilityChange: function() {
        document.addEventListener('visibilitychange', () => {
            document.body.classList.toggle('tab-hidden', document.hidden);
        });
    },

    handleExternalLinks: function() {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            if (!link.getAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
};

// ============================================================
// HEADER MODULE
// ============================================================
SANDUKHAR.header = {
    header: null,
    lastScroll: 0,
    scrollThreshold: 50,
    ticking: false,

    init: function() {
        this.header = document.getElementById('main-header');
        if (!this.header) return;
        this.onScroll();
        this.bindEvents();
    },

    bindEvents: function() {
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        window.addEventListener('resize', () => this.onResize());
    },

    requestTick: function() {
        if (!this.ticking) {
            requestAnimationFrame(() => { this.onScroll(); this.ticking = false; });
            this.ticking = true;
        }
    },

    onScroll: function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > this.scrollThreshold) {
            if (!this.header.classList.contains('scrolled')) {
                this.header.classList.add('scrolled');
                this.header.classList.remove('transparent');
            }
        } else {
            if (this.header.classList.contains('scrolled')) {
                this.header.classList.remove('scrolled');
                this.header.classList.add('transparent');
            }
        }
        this.lastScroll = currentScroll;
    },

    onResize: function() {
        if (window.innerWidth > 1024) SANDUKHAR.mobileNav.close();
    }
};

// ============================================================
// SEARCH OVERLAY MODULE
// ============================================================
SANDUKHAR.searchOverlay = {
    overlay: null, input: null, trigger: null, closeBtn: null, searchTimeout: null,

    init: function() {
        this.overlay = document.getElementById('search-overlay');
        this.input = document.getElementById('search-input');
        this.trigger = document.querySelector('.search-trigger');
        this.closeBtn = document.querySelector('.search-close');
        if (!this.overlay || !this.trigger) return;
        this.bindEvents();
    },

    bindEvents: function() {
        this.trigger.addEventListener('click', (e) => { e.preventDefault(); this.open(); });
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) this.close();
            if (e.key === 'Enter' && this.overlay.classList.contains('active') && this.input) {
                const query = this.input.value.trim();
                if (query.length >= 2) { this.close(); window.location.href = 'catalog.html?search=' + encodeURIComponent(query); }
            }
        });
        this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
        if (this.input) this.input.addEventListener('input', () => this.performLiveSearch());
    },

    open: function() {
        this.overlay.classList.add('active');
        document.body.classList.add('no-scroll');
        setTimeout(() => { if (this.input) this.input.focus(); }, 150);
    },

    close: function() {
        this.overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        if (this.input) this.input.value = '';
        clearTimeout(this.searchTimeout);
    },

    performLiveSearch: function() {
        clearTimeout(this.searchTimeout);
        const query = this.input ? this.input.value.trim() : '';
        if (query.length < 2) {
            if (window.SANDUKHAR.catalog && typeof window.SANDUKHAR.catalog.resetSearch === 'function') {
                window.SANDUKHAR.catalog.resetSearch();
            }
            return;
        }
        this.searchTimeout = setTimeout(() => {
            if (window.SANDUKHAR.catalog && typeof window.SANDUKHAR.catalog.performSearch === 'function') {
                window.SANDUKHAR.catalog.performSearch(query);
            }
        }, 300);
    }
};

// ============================================================
// MOBILE NAVIGATION MODULE
// ============================================================
SANDUKHAR.mobileNav = {
    trigger: null, nav: null, isOpen: false,

    init: function() {
        this.trigger = document.getElementById('mobile-menu-trigger');
        this.nav = document.getElementById('mobile-nav');
        if (!this.trigger || !this.nav) return;
        this.bindEvents();
    },

    bindEvents: function() {
        this.trigger.addEventListener('click', () => this.toggle());
        this.nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => this.close()));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen) this.close(); });
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.trigger.contains(e.target)) this.close();
        });
    },

    toggle: function() { this.isOpen ? this.close() : this.open(); },
    open: function() {
        this.isOpen = true;
        this.nav.classList.add('active'); this.trigger.classList.add('active');
        this.trigger.setAttribute('aria-expanded', 'true'); this.nav.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    },
    close: function() {
        this.isOpen = false;
        this.nav.classList.remove('active'); this.trigger.classList.remove('active');
        this.trigger.setAttribute('aria-expanded', 'false'); this.nav.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }
};

// ============================================================
// SCROLL ANIMATIONS MODULE
// ============================================================
SANDUKHAR.scrollAnimations = {
    observer: null,
    init: function() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.fade-in-up, .slide-up, .fade-in, .scale-in').forEach(el => el.classList.add('visible'));
            return;
        }
        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), { root: null, rootMargin: '0px 0px -30px 0px', threshold: 0.1 });
        ['.fade-in-up', '.slide-up', '.fade-in', '.scale-in', '.stagger-children', '.reveal-text', '.parallax-image', '.lazy-image']
            .forEach(s => document.querySelectorAll(s).forEach(el => this.observer.observe(el)));
    },
    handleIntersect: function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.classList.contains('lazy-image')) this.loadLazyImage(target);
                target.classList.add('visible');
                this.observer.unobserve(target);
            }
        });
    },
    loadLazyImage: function(img) {
        const src = img.getAttribute('data-src');
        if (src && !img.src.includes(src)) {
            const temp = new Image();
            temp.onload = () => { img.src = src; img.classList.add('loaded'); };
            temp.onerror = () => { img.classList.add('loaded'); };
            temp.src = src;
            if (temp.complete) { img.src = src; img.classList.add('loaded'); }
        } else if (!img.getAttribute('data-src')) {
            img.classList.add('loaded');
        }
    }
};

// ============================================================
// QUICK VIEW MODULE — ALL TEXTS I18N
// ============================================================
SANDUKHAR.quickView = {
    modal: null, content: null, closeBtn: null, previousActiveElement: null,

    init: function() {
        this.modal = document.getElementById('quick-view-modal');
        if (!this.modal) return;
        this.content = this.modal.querySelector('.modal-content');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-quick-view');
            if (btn) { e.preventDefault(); e.stopPropagation(); this.open(btn.getAttribute('data-product-id')); }
        });
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) this.close();
            if (e.key === 'Tab' && this.modal.classList.contains('active')) this.trapFocus(e);
        });
    },

    trapFocus: function(e) {
        const focusable = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    },

    open: function(productId) {
        this.previousActiveElement = document.activeElement;
        this.modal.classList.add('active'); this.modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        this.loadProductData(productId);
        if (this.closeBtn) setTimeout(() => this.closeBtn.focus(), 100);
    },

    close: function() {
        this.modal.classList.remove('active'); this.modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        if (this.previousActiveElement) this.previousActiveElement.focus();
    },

    loadProductData: function(productId) {
        const i18n = (key, fallback) => (window.SD_I18N && window.SD_I18N.t) ? window.SD_I18N.t(key) : fallback;

        this.content.innerHTML = `
            <div class="quick-view-layout">
                <div class="quick-view-gallery"><div class="skeleton" style="width:100%; aspect-ratio:3/4;"></div></div>
                <div class="quick-view-details">
                    <div class="skeleton" style="height:24px; width:60%; margin-bottom:16px;"></div>
                    <div class="skeleton" style="height:16px; width:80%; margin-bottom:12px;"></div>
                    <div class="skeleton" style="height:16px; width:40%; margin-bottom:24px;"></div>
                    <div class="skeleton" style="height:48px; width:100%;"></div>
                </div>
            </div>`;

        setTimeout(() => {
            this.content.innerHTML = `
                <div class="quick-view-layout">
                    <div class="quick-view-gallery">
                        <div style="width:100%; aspect-ratio:3/4; background:var(--color-charcoal); display:flex; align-items:center; justify-content:center; border-radius:4px;">
                            <p style="color:var(--color-text-muted); font-family:var(--font-display);">${i18n('qv_product_preview', 'Product Preview')}</p>
                        </div>
                    </div>
                    <div class="quick-view-details">
                        <p class="quick-view-collection" data-i18n="product_collection_label">${i18n('product_collection_label', 'The Imperium Collection')}</p>
                        <h2 class="quick-view-name">${i18n('qv_exotic_creation', 'Exotic Leather Creation')}</h2>
                        <p class="quick-view-price">${i18n('price_upon_request', 'Price upon request')}</p>
                        <p class="quick-view-description">${i18n('qv_handcrafted_desc', 'Handcrafted in our Istanbul atelier from the finest ethically sourced exotic leather. Each piece is unique and made to order.')}</p>
                        <a href="product.html" class="btn-primary" style="width:100%; margin-top:20px; display:inline-flex; text-align:center; justify-content:center;" data-i18n="view_details">${i18n('view_details', 'View Full Details')}</a>
                    </div>
                </div>`;
            if (window.SD_I18N && window.SD_I18N.translatePage) window.SD_I18N.translatePage();
        }, 500);
    }
};

// ============================================================
// LAZY LOADING, SMOOTH SCROLL, TESTIMONIALS, MAGNETIC
// ============================================================
SANDUKHAR.lazyLoading = {
    init: function() {
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[data-src]').forEach(img => {
                if (!img.src || img.src === '' || img.src === window.location.href) {
                    const src = img.getAttribute('data-src');
                    if (src) img.src = src;
                }
            });
        }
    }
};

SANDUKHAR.smoothScroll = {
    init: function() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            const targetId = link.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            e.preventDefault();
            const headerHeight = document.getElementById('main-header')?.offsetHeight || 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        });
    }
};

SANDUKHAR.testimonialSlider = {
    items: [], currentIndex: 0, interval: null, delay: 5000, slider: null,
    init: function() {
        this.slider = document.querySelector('.testimonial-slider');
        if (!this.slider) return;
        this.items = this.slider.querySelectorAll('.testimonial-item');
        if (this.items.length <= 1) return;
        this.startAutoRotation();
        this.slider.addEventListener('mouseenter', () => this.pause());
        this.slider.addEventListener('mouseleave', () => this.resume());
        this.slider.addEventListener('touchstart', () => this.pause(), { passive: true });
        this.slider.addEventListener('touchend', () => this.resume());
    },
    startAutoRotation: function() { this.stopAutoRotation(); this.interval = setInterval(() => this.next(), this.delay); },
    stopAutoRotation: function() { if (this.interval) { clearInterval(this.interval); this.interval = null; } },
    pause: function() { this.stopAutoRotation(); },
    resume: function() { if (!this.interval) this.startAutoRotation(); },
    next: function() { if (!this.items.length) return; this.items[this.currentIndex].classList.remove('active'); this.currentIndex = (this.currentIndex + 1) % this.items.length; this.items[this.currentIndex].classList.add('active'); },
    prev: function() { if (!this.items.length) return; this.items[this.currentIndex].classList.remove('active'); this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length; this.items[this.currentIndex].classList.add('active'); }
};

SANDUKHAR.magneticButtons = {
    init: function() {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                el.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.15}px, ${(e.clientY - rect.top - rect.height / 2) * 0.15}px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0, 0)'; });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => { SANDUKHAR.init(); });
window.addEventListener('beforeunload', () => { if (SANDUKHAR.testimonialSlider) SANDUKHAR.testimonialSlider.stopAutoRotation(); });