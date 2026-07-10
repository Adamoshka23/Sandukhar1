/**
 * SAN DUKHAR — ACCOUNT MODULE
 * Account page tab navigation
 */
'use strict';

SANDUKHAR.account = {
    init: function() {
        const nav = document.getElementById('account-nav');
        if (!nav) return;

        const buttons = nav.querySelectorAll('.account-nav-btn');
        const sections = document.querySelectorAll('.account-section');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionName = btn.getAttribute('data-section');
                
                // Update active button
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show corresponding section
                sections.forEach(section => section.classList.remove('active'));
                const targetSection = document.getElementById('section-' + sectionName);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SANDUKHAR.account.init();
});