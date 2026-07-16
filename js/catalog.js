/**
 * ============================================================
 * SAN DUKHAR — CATALOG MODULE (v4.0 — I18N COMPLETE)
 * Advanced Filtering, Sorting, Pagination & Search
 * ============================================================
 */

'use strict';

SANDUKHAR.catalog = {
    productsGrid: null, productCards: [], sidebar: null, sidebarOverlay: null,
    filterToggle: null, activeFiltersContainer: null, resultsCount: null,
    sortSelect: null, viewButtons: null, pagination: null, emptyState: null,
    clearFiltersBtn: null, filterCount: null,
    activeFilters: {}, currentSort: 'featured', currentView: 'grid',
    currentPage: 1, productsPerPage: 12, filteredProducts: [],

    init: function() {
        this.productsGrid = document.getElementById('products-grid');
        if (!this.productsGrid) return;
        this.cacheDOMElements();
        this.collectProductData();
        this.bindEvents();
        this.applyInitialFilters();
        this.updateResults();
        if (window.SD_I18N && window.SD_I18N.translatePage) window.SD_I18N.translatePage();
    },

    cacheDOMElements: function() {
        this.sidebar = document.getElementById('catalog-sidebar');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        this.filterToggle = document.getElementById('filter-toggle');
        this.activeFiltersContainer = document.getElementById('active-filters');
        this.resultsCount = document.getElementById('results-count');
        this.sortSelect = document.getElementById('sort-select');
        this.viewButtons = document.querySelectorAll('.view-btn');
        this.pagination = document.getElementById('catalog-pagination');
        this.emptyState = document.getElementById('catalog-empty');
        this.clearFiltersBtn = document.getElementById('clear-filters');
        this.filterCount = document.querySelector('.filter-count');
    },

    collectProductData: function() {
        this.productCards = Array.from(this.productsGrid.querySelectorAll('.product-card'));
        this.filteredProducts = [...this.productCards];
    },

    bindEvents: function() {
        this.sidebar.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', () => this.onFilterChange(input));
        });
        const applyPriceBtn = document.getElementById('apply-price');
        if (applyPriceBtn) applyPriceBtn.addEventListener('click', () => this.onPriceFilter());
        if (this.sortSelect) this.sortSelect.addEventListener('change', () => {
            this.currentSort = this.sortSelect.value;
            this.applySorting();
            this.currentPage = 1;
            this.updateResultsDisplay();
        });
        this.viewButtons.forEach(btn => btn.addEventListener('click', () => this.switchView(btn)));
        if (this.pagination) {
            this.pagination.addEventListener('click', (e) => {
                const pageBtn = e.target.closest('.page-btn');
                if (!pageBtn || pageBtn.disabled) return;
                if (pageBtn.classList.contains('prev')) this.goToPage(this.currentPage - 1);
                else if (pageBtn.classList.contains('next')) this.goToPage(this.currentPage + 1);
                else this.goToPage(parseInt(pageBtn.getAttribute('data-page')));
            });
        }
        if (this.clearFiltersBtn) this.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        const clearEmptyBtn = document.getElementById('clear-filters-empty');
        if (clearEmptyBtn) clearEmptyBtn.addEventListener('click', () => this.clearAllFilters());
        if (this.filterToggle) this.filterToggle.addEventListener('click', () => this.toggleSidebar());
        if (this.sidebarOverlay) this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar?.classList.contains('active')) this.closeSidebar();
        });
        this.sidebar.querySelectorAll('.filter-group-title').forEach(title => {
            title.addEventListener('click', () => title.parentElement.classList.toggle('collapsed'));
        });
    },

    onFilterChange: function(input) {
        const filterType = input.name, filterValue = input.value;
        if (!this.activeFilters[filterType]) this.activeFilters[filterType] = [];
        if (input.checked) {
            if (!this.activeFilters[filterType].includes(filterValue)) this.activeFilters[filterType].push(filterValue);
        } else {
            this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== filterValue);
            if (this.activeFilters[filterType].length === 0) delete this.activeFilters[filterType];
        }
        this.currentPage = 1;
        this.applyAllFilters();
        this.updateResultsDisplay();
        this.updateActiveFilterTags();
        this.updateFilterCount();
    },

    onPriceFilter: function() {
        const minPrice = parseFloat(document.getElementById('price-min')?.value) || 0;
        const maxPrice = parseFloat(document.getElementById('price-max')?.value) || Infinity;
        if (minPrice > 0 || maxPrice < Infinity) this.activeFilters['price'] = [{ min: minPrice, max: maxPrice }];
        else delete this.activeFilters['price'];
        this.currentPage = 1;
        this.applyAllFilters();
        this.updateResultsDisplay();
        this.updateActiveFilterTags();
    },

    applyAllFilters: function() {
        this.filteredProducts = this.productCards.filter(card => {
            if (this.activeFilters['category']?.length && !this.activeFilters['category'].includes(card.getAttribute('data-category'))) return false;
            if (this.activeFilters['material']?.length && !this.activeFilters['material'].includes(card.getAttribute('data-material'))) return false;
            if (this.activeFilters['color']?.length && !this.activeFilters['color'].includes(card.getAttribute('data-color'))) return false;
            if (this.activeFilters['availability']?.length && !this.activeFilters['availability'].includes(card.getAttribute('data-availability'))) return false;
            if (this.activeFilters['price']) {
                const cardPrice = parseFloat(card.getAttribute('data-price'));
                const range = this.activeFilters['price'][0];
                if (cardPrice < range.min || cardPrice > range.max) return false;
            }
            return true;
        });
        this.applySorting();
    },

    applySorting: function() {
        const sortFns = {
            'featured': () => {},
            'newest': () => this.filteredProducts.sort((a, b) => b.getAttribute('data-product-id').localeCompare(a.getAttribute('data-product-id'))),
            'price-asc': () => this.filteredProducts.sort((a, b) => parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'))),
            'price-desc': () => this.filteredProducts.sort((a, b) => parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'))),
            'name-asc': () => this.filteredProducts.sort((a, b) => (a.querySelector('.product-card-name')?.textContent?.trim() || '').localeCompare(b.querySelector('.product-card-name')?.textContent?.trim() || ''))
        };
        if (sortFns[this.currentSort]) sortFns[this.currentSort]();
    },

    updateResults: function() {
        this.applyAllFilters();
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
    },

    updateResultsDisplay: function() {
        const total = this.filteredProducts.length;
        if (this.resultsCount) this.resultsCount.textContent = total;
        if (total === 0) { this.showEmptyState(); return; }
        this.hideEmptyState();
        const start = (this.currentPage - 1) * this.productsPerPage;
        const pageProducts = this.filteredProducts.slice(start, start + this.productsPerPage);
        this.productCards.forEach(c => c.style.display = 'none');
        pageProducts.forEach(c => c.style.display = '');
    },

    updatePagination: function(totalPages) {
        if (!this.pagination) return;
        const prevBtn = this.pagination.querySelector('.page-btn.prev');
        const nextBtn = this.pagination.querySelector('.page-btn.next');
        const container = this.pagination.querySelector('.page-numbers');
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        if (!container) return;
        container.innerHTML = '';
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn' + (i === this.currentPage ? ' active' : '');
            btn.setAttribute('data-page', i);
            btn.textContent = i;
            container.appendChild(btn);
        }
    },

    goToPage: function(page) {
        this.currentPage = page;
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
        if (this.productsGrid) this.productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    switchView: function(btn) {
        this.viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.getAttribute('data-view');
        this.productsGrid.classList.toggle('list-view', this.currentView === 'list');
    },

    showEmptyState: function() {
        if (this.emptyState) this.emptyState.style.display = 'block';
        if (this.pagination) this.pagination.style.display = 'none';
        if (this.productsGrid) this.productsGrid.style.display = 'none';
    },

    hideEmptyState: function() {
        if (this.emptyState) this.emptyState.style.display = 'none';
        if (this.pagination) this.pagination.style.display = '';
        if (this.productsGrid) this.productsGrid.style.display = '';
    },

    updateActiveFilterTags: function() {
        if (!this.activeFiltersContainer) return;
        this.activeFiltersContainer.innerHTML = '';
        const i18n = (key, fallback) => (window.SD_I18N && window.SD_I18N.t) ? window.SD_I18N.t(key) : fallback;
        const filterLabels = {
            'category': i18n('catalog_category', 'Category'),
            'material': i18n('catalog_material_filter', 'Material'),
            'color': i18n('catalog_color', 'Color'),
            'availability': i18n('catalog_availability', 'Availability')
        };
        for (const [filterType, values] of Object.entries(this.activeFilters)) {
            if (filterType === 'price') {
                const range = values[0];
                const tag = document.createElement('span');
                tag.className = 'active-filter-tag';
                tag.innerHTML = `${i18n('catalog_price_range', 'Price Range')}: $${range.min || 0} — $${range.max || '∞'} <span class="remove-tag" data-filter="${filterType}">×</span>`;
                this.activeFiltersContainer.appendChild(tag);
                continue;
            }
            values.forEach(value => {
                const tag = document.createElement('span');
                tag.className = 'active-filter-tag';
                const label = filterLabels[filterType] || filterType;
                const displayValue = value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                tag.innerHTML = `${label}: ${displayValue} <span class="remove-tag" data-filter="${filterType}" data-value="${value}">×</span>`;
                this.activeFiltersContainer.appendChild(tag);
            });
        }
        this.activeFiltersContainer.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', () => this.removeFilter(btn.getAttribute('data-filter'), btn.getAttribute('data-value')));
        });
    },

    removeFilter: function(filterType, filterValue) {
        if (filterType === 'price') {
            delete this.activeFilters['price'];
            const pm = document.getElementById('price-min'); if (pm) pm.value = '';
            const px = document.getElementById('price-max'); if (px) px.value = '';
        } else {
            const cb = this.sidebar.querySelector(`input[name="${filterType}"][value="${filterValue}"]`);
            if (cb) cb.checked = false;
            if (this.activeFilters[filterType]) {
                this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== filterValue);
                if (!this.activeFilters[filterType].length) delete this.activeFilters[filterType];
            }
        }
        this.currentPage = 1;
        this.updateResults();
        this.updateActiveFilterTags();
        this.updateFilterCount();
    },

    clearAllFilters: function() {
        this.sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        ['price-min', 'price-max'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        this.activeFilters = {};
        this.currentPage = 1;
        this.currentSort = 'featured';
        if (this.sortSelect) this.sortSelect.value = 'featured';
        this.filteredProducts = [...this.productCards];
        this.updateResults();
        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.closeSidebar();
    },

    updateFilterCount: function() {
        if (!this.filterCount) return;
        let count = 0;
        for (const v of Object.values(this.activeFilters)) count += Array.isArray(v) ? v.length : 1;
        this.filterCount.textContent = count;
        this.filterCount.classList.toggle('active', count > 0);
    },

    applyInitialFilters: function() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('search')) { const q = params.get('search'); if (q?.trim().length >= 2) { this.performSearch(q.trim()); return; } }
        ['category', 'material'].forEach(type => {
            if (params.has(type)) { const val = params.get(type); this.activeFilters[type] = [val]; this.syncCheckbox(type, val); }
        });
        if (params.has('collection')) this.activeFilters['collection'] = [params.get('collection')];
        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.updateResults();
    },

    syncCheckbox: function(name, value) {
        const cb = this.sidebar.querySelector(`input[name="${name}"][value="${value}"]`);
        if (cb) cb.checked = true;
    },

    performSearch: function(query) {
        if (!query || query.length < 2) { this.resetSearch(); return; }
        const q = query.toLowerCase();
        this.filteredProducts = this.productCards.filter(card => {
            const name = card.querySelector('.product-card-name')?.textContent?.toLowerCase() || '';
            const material = card.querySelector('.product-card-material')?.textContent?.toLowerCase() || '';
            const category = card.getAttribute('data-category')?.toLowerCase() || '';
            const mat = card.getAttribute('data-material')?.toLowerCase() || '';
            return name.includes(q) || material.includes(q) || category.includes(q) || mat.includes(q);
        });
        this.currentPage = 1;
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
    },

    resetSearch: function() {
        this.filteredProducts = [...this.productCards];
        this.applyAllFilters();
        this.currentPage = 1;
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
    },

    toggleSidebar: function() { this.sidebar.classList.contains('active') ? this.closeSidebar() : this.openSidebar(); },
    openSidebar: function() { this.sidebar.classList.add('active'); this.sidebarOverlay.classList.add('active'); document.body.classList.add('no-scroll'); },
    closeSidebar: function() { this.sidebar.classList.remove('active'); this.sidebarOverlay.classList.remove('active'); document.body.classList.remove('no-scroll'); }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#products-grid')) SANDUKHAR.catalog.init();
});