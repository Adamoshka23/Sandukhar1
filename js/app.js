/**
 * ============================================================
 * SAN DUKHAR — MAIN APPLICATION LOGIC (AUDITED & FIXED)
 * Luxury Exotic Leather Atelier
 * Version: 2.0 — Production Ready
 * Description: Core site functionality including header,
 * navigation, search, modals, and global UI interactions.
 * ============================================================
 */

'use strict';

// ============================================================
// SAN DUKHAR Global Namespace
// ============================================================
const SANDUKHAR = {
    version: '2.0.0',
    
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

    /**
     * Pause animations when tab is hidden to save resources
     */
    handleVisibilityChange: function() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('tab-hidden');
            } else {
                document.body.classList.remove('tab-hidden');
            }
        });
    },

    /**
     * Mark external links for security
     */
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
            requestAnimationFrame(() => {
                this.onScroll();
                this.ticking = false;
            });
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
        if (window.innerWidth > 1024) {
            SANDUKHAR.mobileNav.close();
        }
    }
};

// ============================================================
// SEARCH OVERLAY MODULE
// ============================================================
SANDUKHAR.searchOverlay = {
    overlay: null,
    input: null,
    trigger: null,
    closeBtn: null,

    init: function() {
        this.overlay = document.getElementById('search-overlay');
        this.input = document.getElementById('search-input');
        this.trigger = document.querySelector('.search-trigger');
        this.closeBtn = document.querySelector('.search-close');

        if (!this.overlay || !this.trigger) return;

        this.bindEvents();
    },

    bindEvents: function() {
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.open();
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.close();
            }
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    },

    open: function() {
        this.overlay.classList.add('active');
        document.body.classList.add('no-scroll');
        setTimeout(() => {
            if (this.input) this.input.focus();
        }, 150);
    },

    close: function() {
        this.overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        if (this.input) this.input.value = '';
    }
};

// ============================================================
// MOBILE NAVIGATION MODULE
// ============================================================
SANDUKHAR.mobileNav = {
    trigger: null,
    nav: null,
    isOpen: false,

    init: function() {
        this.trigger = document.getElementById('mobile-menu-trigger');
        this.nav = document.getElementById('mobile-nav');

        if (!this.trigger || !this.nav) return;

        this.bindEvents();
    },

    bindEvents: function() {
        this.trigger.addEventListener('click', () => this.toggle());

        const navLinks = this.nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.trigger.contains(e.target)) {
                this.close();
            }
        });
    },

    toggle: function() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open: function() {
        this.isOpen = true;
        this.nav.classList.add('active');
        this.trigger.classList.add('active');
        this.trigger.setAttribute('aria-expanded', 'true');
        this.nav.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    },

    close: function() {
        this.isOpen = false;
        this.nav.classList.remove('active');
        this.trigger.classList.remove('active');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.nav.setAttribute('aria-hidden', 'true');
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
            // Fallback: show all elements immediately
            document.querySelectorAll('.fade-in-up, .slide-up, .fade-in, .scale-in').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }

        const options = {
            root: null,
            rootMargin: '0px 0px -30px 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), options);

        const animatableSelectors = [
            '.fade-in-up',
            '.slide-up',
            '.fade-in',
            '.scale-in',
            '.stagger-children',
            '.reveal-text',
            '.parallax-image',
            '.lazy-image'
        ];

        animatableSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                this.observer.observe(el);
            });
        });
    },

    handleIntersect: function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                if (target.classList.contains('lazy-image')) {
                    this.loadLazyImage(target);
                }

                target.classList.add('visible');
                this.observer.unobserve(target);
            }
        });
    },

    loadLazyImage: function(img) {
        const src = img.getAttribute('data-src');
        if (src && !img.src.includes(src)) {
            const tempImage = new Image();
            tempImage.onload = () => {
                img.src = src;
                img.classList.add('loaded');
            };
            tempImage.onerror = () => {
                // Keep the placeholder on error
                img.classList.add('loaded');
            };
            tempImage.src = src;
            
            // Handle cached images
            if (tempImage.complete) {
                img.src = src;
                img.classList.add('loaded');
            }
        } else if (!img.getAttribute('data-src')) {
            // No data-src, just mark as loaded
            img.classList.add('loaded');
        }
    }
};

// ============================================================
// QUICK VIEW MODULE
// ============================================================
SANDUKHAR.quickView = {
    modal: null,
    content: null,
    closeBtn: null,
    previousActiveElement: null,

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
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                const productId = btn.getAttribute('data-product-id');
                this.open(productId);
            }
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
            // Trap focus inside modal
            if (e.key === 'Tab' && this.modal.classList.contains('active')) {
                this.trapFocus(e);
            }
        });
    },

    trapFocus: function(e) {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    },

    open: function(productId) {
        this.previousActiveElement = document.activeElement;
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        this.loadProductData(productId);
        
        // Focus close button
        if (this.closeBtn) {
            setTimeout(() => this.closeBtn.focus(), 100);
        }
    },

    close: function() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        
        // Restore focus
        if (this.previousActiveElement) {
            this.previousActiveElement.focus();
        }
    },

    loadProductData: function(productId) {
        this.content.innerHTML = `
            <div class="quick-view-layout">
                <div class="quick-view-gallery">
                    <div class="skeleton" style="width:100%; aspect-ratio:3/4;"></div>
                </div>
                <div class="quick-view-details">
                    <div class="skeleton" style="height:24px; width:60%; margin-bottom:16px;"></div>
                    <div class="skeleton" style="height:16px; width:80%; margin-bottom:12px;"></div>
                    <div class="skeleton" style="height:16px; width:40%; margin-bottom:24px;"></div>
                    <div class="skeleton" style="height:48px; width:100%;"></div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.content.innerHTML = `
                <div class="quick-view-layout">
                    <div class="quick-view-gallery">
                        <div style="width:100%; aspect-ratio:3/4; background:var(--color-charcoal); display:flex; align-items:center; justify-content:center; border-radius:4px;">
                            <p style="color:var(--color-text-muted); font-family:var(--font-display);">Product Preview</p>
                        </div>
                    </div>
                    <div class="quick-view-details">
                        <p class="quick-view-collection">The Imperium Collection</p>
                        <h2 class="quick-view-name">Exotic Leather Creation</h2>
                        <p class="quick-view-price">Price upon request</p>
                        <p class="quick-view-description">Handcrafted in our Istanbul atelier from the finest ethically sourced exotic leather. Each piece is unique and made to order.</p>
                        <a href="product.html" class="btn-primary" style="width:100%; margin-top:20px; display:inline-flex; text-align:center; justify-content:center;">View Full Details</a>
                    </div>
                </div>
            `;
        }, 500);
    }
};

// ============================================================
// LAZY LOADING MODULE
// ============================================================
SANDUKHAR.lazyLoading = {
    init: function() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                if (!img.src || img.src === '' || img.src === window.location.href) {
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                    }
                }
            });
        }
        // Fallback handled by scrollAnimations with Intersection Observer
    }
};

// ============================================================
// SMOOTH SCROLL MODULE
// ============================================================
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

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    }
};

// ============================================================
// TESTIMONIAL SLIDER MODULE
// ============================================================
SANDUKHAR.testimonialSlider = {
    items: [],
    currentIndex: 0,
    interval: null,
    delay: 5000,
    slider: null,

    init: function() {
        this.slider = document.querySelector('.testimonial-slider');
        if (!this.slider) return;

        this.items = this.slider.querySelectorAll('.testimonial-item');
        if (this.items.length <= 1) return;

        this.startAutoRotation();

        // Pause on hover
        this.slider.addEventListener('mouseenter', () => this.pause());
        this.slider.addEventListener('mouseleave', () => this.resume());
        this.slider.addEventListener('touchstart', () => this.pause(), { passive: true });
        this.slider.addEventListener('touchend', () => this.resume());
    },

    startAutoRotation: function() {
        this.stopAutoRotation();
        this.interval = setInterval(() => {
            this.next();
        }, this.delay);
    },

    stopAutoRotation: function() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    pause: function() {
        this.stopAutoRotation();
    },

    resume: function() {
        if (!this.interval) {
            this.startAutoRotation();
        }
    },

    next: function() {
        if (this.items.length === 0) return;
        this.items[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.items[this.currentIndex].classList.add('active');
    },

    prev: function() {
        if (this.items.length === 0) return;
        this.items[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.items[this.currentIndex].classList.add('active');
    }
};

// ============================================================
// MAGNETIC BUTTONS MODULE
// ============================================================
SANDUKHAR.magneticButtons = {
    init: function() {
        const magneticElements = document.querySelectorAll('.magnetic');
        if (magneticElements.length === 0) return;
        
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.15;
                const moveY = y * 0.15;
                
                el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
            });
        });
    }
};

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    SANDUKHAR.init();
});

// Clean up intervals on page unload
window.addEventListener('beforeunload', () => {
    if (SANDUKHAR.testimonialSlider) {
        SANDUKHAR.testimonialSlider.stopAutoRotation();
    }
});