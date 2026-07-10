/**
 * SAN DUKHAR — ADVANCED ANIMATIONS
 */
'use strict';

SANDUKHAR.advancedAnimations = {
    init: function() {
        this.initParallax();
        this.initMagneticElements();
        this.initSmoothReveal();
    },

    initParallax: function() {
        const parallaxElements = document.querySelectorAll('.parallax-image');
        
        window.addEventListener('scroll', () => {
            parallaxElements.forEach(el => {
                if (el.classList.contains('visible')) {
                    const rect = el.getBoundingClientRect();
                    const scrolled = window.pageYOffset;
                    const rate = 0.15;
                    const yPos = (rect.top + scrolled) * rate;
                    const img = el.querySelector('img');
                    if (img) {
                        img.style.transform = `translateY(${yPos * 0.3}px) scale(1.02)`;
                    }
                }
            });
        }, { passive: true });
    },

    initMagneticElements: function() {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                el.style.transform = `translate(${x * 12}px, ${y * 12}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
            });
        });
    },

    initSmoothReveal: function() {
        const revealElements = document.querySelectorAll('.reveal-text');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        revealElements.forEach(el => observer.observe(el));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SANDUKHAR.advancedAnimations.init();
});