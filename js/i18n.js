/**
 * SAN DUKHAR i18n engine.
 * Applies window.SD_TRANSLATIONS to every [data-i18n] element and wires
 * up the EN/RU toggle button ([data-lang-toggle]) present in every header.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'sd_lang';
    var DEFAULT_LANG = 'en';

    function getDict(lang) {
        return (window.SD_TRANSLATIONS && window.SD_TRANSLATIONS[lang]) || {};
    }

    function getLang() {
        var saved = localStorage.getItem(STORAGE_KEY);
        return saved === 'en' || saved === 'ru' ? saved : DEFAULT_LANG;
    }

    function updateToggleButtons(lang) {
        var target = lang === 'en' ? 'ru' : 'en';
        document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
            var span = btn.querySelector('.lang-toggle-current');
            if (span) span.textContent = target.toUpperCase();
            btn.setAttribute('aria-label', lang === 'en' ? 'Switch to Russian' : 'Переключить на английский');
        });
    }

    function t(key) {
        var dict = getDict(getLang());
        if (dict[key] !== undefined) return dict[key];
        var fallback = getDict('en');
        return fallback[key] !== undefined ? fallback[key] : key;
    }

    function applyLang(lang) {
        var dict = getDict(lang);
        var fallback = getDict('en');
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var value = dict[key];
            if (value === undefined) value = fallback[key];
            if (value === undefined) return;
            var attr = el.getAttribute('data-i18n-attr');
            if (attr) {
                el.setAttribute(attr, value);
            } else {
                el.innerHTML = value;
            }
        });
        document.documentElement.lang = lang;
        updateToggleButtons(lang);
        document.dispatchEvent(new CustomEvent('sd_i18n_changed', { detail: { lang: lang } }));
    }

    function setLang(lang) {
        if (lang !== 'en' && lang !== 'ru') return;
        localStorage.setItem(STORAGE_KEY, lang);
        applyLang(lang);
    }

    function toggleLang() {
        setLang(getLang() === 'en' ? 'ru' : 'en');
    }

    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            toggleLang();
        });
    });

    window.SD_I18N = {
        getLang: getLang,
        setLang: setLang,
        toggleLang: toggleLang,
        applyLang: applyLang,
        t: t
    };

    applyLang(getLang());
})();
