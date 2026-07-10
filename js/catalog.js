/**
 * ============================================================
 * SAN DUKHAR — CATALOG MODULE (v3.0 — SEARCH INTEGRATED)
 * Advanced Filtering, Sorting, Pagination & Search
 * ============================================================
 */

'use strict';

SANDUKHAR.catalog = {
    productsGrid: null,
    productCards: [],
    sidebar: null,
    sidebarOverlay: null,
    filterToggle: null,
    activeFiltersContainer: null,
    resultsCount: null,
    sortSelect: null,
    viewButtons: null,
    pagination: null,
    emptyState: null,
    clearFiltersBtn: null,
    activeFilters: {},
    currentSort: 'featured',
    currentView: 'grid',
    currentPage: 1,
    productsPerPage: 12,
    filteredProducts: [],

    init: function() {
        this.productsGrid = document.getElementById('products-grid');
        if (!this.productsGrid) return;

        this.cacheDOMElements();
        this.collectProductData();
        this.bindEvents();
        this.applyInitialFilters();
        this.updateResults();

        if (window.SD_I18N && window.SD_I18N.translatePage) {
            window.SD_I18N.translatePage();
        }
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
        const filterInputs = this.sidebar.querySelectorAll('input[type="checkbox"]');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.onFilterChange(input));
        });

        const applyPriceBtn = document.getElementById('apply-price');
        if (applyPriceBtn) applyPriceBtn.addEventListener('click', () => this.onPriceFilter());

        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => {
                this.currentSort = this.sortSelect.value;
                this.applySorting();
                this.currentPage = 1;
                this.updateResultsDisplay();
            });
        }

        this.viewButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn));
        });

        if (this.pagination) {
            this.pagination.addEventListener('click', (e) => {
                const pageBtn = e.target.closest('.page-btn');
                if (!pageBtn || pageBtn.disabled) return;
                if (pageBtn.classList.contains('prev')) { this.goToPage(this.currentPage - 1); }
                else if (pageBtn.classList.contains('next')) { this.goToPage(this.currentPage + 1); }
                else { const page = parseInt(pageBtn.getAttribute('data-page')); this.goToPage(page); }
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

        const filterGroupTitles = this.sidebar.querySelectorAll('.filter-group-title');
        filterGroupTitles.forEach(title => {
            title.addEventListener('click', () => title.parentElement.classList.toggle('collapsed'));
        });
    },

    onFilterChange: function(input) {
        const filterType = input.name;
        const filterValue = input.value;
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
        if (minPrice > 0 || maxPrice < Infinity) {
            this.activeFilters['price'] = [{ min: minPrice, max: maxPrice }];
        } else {
            delete this.activeFilters['price'];
        }
        this.currentPage = 1;
        this.applyAllFilters();
        this.updateResultsDisplay();
        this.updateActiveFilterTags();
    },

    applyAllFilters: function() {
        this.filteredProducts = this.productCards.filter(card => {
            if (this.activeFilters['category'] && this.activeFilters['category'].length > 0) {
                if (!this.activeFilters['category'].includes(card.getAttribute('data-category'))) return false;
            }
            if (this.activeFilters['material'] && this.activeFilters['material'].length > 0) {
                if (!this.activeFilters['material'].includes(card.getAttribute('data-material'))) return false;
            }
            if (this.activeFilters['color'] && this.activeFilters['color'].length > 0) {
                if (!this.activeFilters['color'].includes(card.getAttribute('data-color'))) return false;
            }
            if (this.activeFilters['availability'] && this.activeFilters['availability'].length > 0) {
                if (!this.activeFilters['availability'].includes(card.getAttribute('data-availability'))) return false;
            }
            if (this.activeFilters['price']) {
                const cardPrice = parseFloat(card.getAttribute('data-price'));
                const priceRange = this.activeFilters['price'][0];
                if (cardPrice < priceRange.min || cardPrice > priceRange.max) return false;
            }
            return true;
        });
        this.applySorting();
    },

    applySorting: function() {
        const sortFunctions = {
            'featured': () => {},
            'newest': () => { this.filteredProducts.sort((a, b) => b.getAttribute('data-product-id').localeCompare(a.getAttribute('data-product-id'))); },
            'price-asc': () => { this.filteredProducts.sort((a, b) => parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'))); },
            'price-desc': () => { this.filteredProducts.sort((a, b) => parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'))); },
            'name-asc': () => { this.filteredProducts.sort((a, b) => { const na = a.querySelector('.product-card-name')?.textContent?.trim() || ''; const nb = b.querySelector('.product-card-name')?.textContent?.trim() || ''; return na.localeCompare(nb); }); }
        };
        if (sortFunctions[this.currentSort]) sortFunctions[this.currentSort]();
    },

    updateResults: function() {
        this.applyAllFilters();
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
    },

    updateResultsDisplay: function() {
        const totalProducts = this.filteredProducts.length;
        if (this.resultsCount) this.resultsCount.textContent = totalProducts;

        if (totalProducts === 0) {
            this.showEmptyState();
            return;
        }
        this.hideEmptyState();

        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        this.productCards.forEach(card => card.style.display = 'none');
        pageProducts.forEach(card => card.style.display = '');
    },

    updatePagination: function(totalPages) {
        if (!this.pagination) return;
        const prevBtn = this.pagination.querySelector('.page-btn.prev');
        const nextBtn = this.pagination.querySelector('.page-btn.next');
        const pageNumbersContainer = this.pagination.querySelector('.page-numbers');
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        if (!pageNumbersContainer) return;
        pageNumbersContainer.innerHTML = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-btn');
            pageBtn.setAttribute('data-page', i);
            pageBtn.textContent = i;
            if (i === this.currentPage) pageBtn.classList.add('active');
            pageNumbersContainer.appendChild(pageBtn);
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
        if (this.currentView === 'list') { this.productsGrid.classList.add('list-view'); }
        else { this.productsGrid.classList.remove('list-view'); }
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
        const filterLabels = { 'category': 'Category', 'material': 'Material', 'color': 'Color', 'availability': 'Availability' };
        for (const [filterType, values] of Object.entries(this.activeFilters)) {
            if (filterType === 'price') {
                const range = values[0];
                const tag = document.createElement('span');
                tag.classList.add('active-filter-tag');
                tag.innerHTML = `Price: $${range.min || 0} — $${range.max || '∞'} <span class="remove-tag" data-filter="${filterType}">×</span>`;
                this.activeFiltersContainer.appendChild(tag);
                continue;
            }
            values.forEach(value => {
                const tag = document.createElement('span');
                tag.classList.add('active-filter-tag');
                const label = filterLabels[filterType] || filterType;
                const displayValue = value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                tag.innerHTML = `${label}: ${displayValue} <span class="remove-tag" data-filter="${filterType}" data-value="${value}">×</span>`;
                this.activeFiltersContainer.appendChild(tag);
            });
        }
        this.activeFiltersContainer.querySelectorAll('.remove-tag').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                const filterType = removeBtn.getAttribute('data-filter');
                const filterValue = removeBtn.getAttribute('data-value');
                this.removeFilter(filterType, filterValue);
            });
        });
    },

    removeFilter: function(filterType, filterValue) {
        if (filterType === 'price') {
            delete this.activeFilters['price'];
            const priceMin = document.getElementById('price-min'); if (priceMin) priceMin.value = '';
            const priceMax = document.getElementById('price-max'); if (priceMax) priceMax.value = '';
        } else {
            const checkbox = this.sidebar.querySelector(`input[name="${filterType}"][value="${filterValue}"]`);
            if (checkbox) checkbox.checked = false;
            if (this.activeFilters[filterType]) {
                this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== filterValue);
                if (this.activeFilters[filterType].length === 0) delete this.activeFilters[filterType];
            }
        }
        this.currentPage = 1;
        this.updateResults();
        this.updateActiveFilterTags();
        this.updateFilterCount();
    },

    clearAllFilters: function() {
        this.sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        const priceMin = document.getElementById('price-min'); if (priceMin) priceMin.value = '';
        const priceMax = document.getElementById('price-max'); if (priceMax) priceMax.value = '';
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
        for (const values of Object.values(this.activeFilters)) { count += Array.isArray(values) ? values.length : 1; }
        this.filterCount.textContent = count;
        if (count > 0) { this.filterCount.classList.add('active'); } else { this.filterCount.classList.remove('active'); }
    },

    applyInitialFilters: function() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('search')) {
            const query = params.get('search');
            if (query && query.trim().length >= 2) {
                this.performSearch(query.trim());
                return;
            }
        }

        if (params.has('category')) { const cat = params.get('category'); this.activeFilters['category'] = [cat]; this.syncCheckbox('category', cat); }
        if (params.has('material')) { const mat = params.get('material'); this.activeFilters['material'] = [mat]; this.syncCheckbox('material', mat); }
        if (params.has('collection')) { this.activeFilters['collection'] = [params.get('collection')]; }

        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.updateResults();
    },

    syncCheckbox: function(name, value) {
        const checkbox = this.sidebar.querySelector(`input[name="${name}"][value="${value}"]`);
        if (checkbox) checkbox.checked = true;
    },

    // ============================================================
    // SEARCH FUNCTIONALITY
    // ============================================================
    performSearch: function(query) {
        if (!query || query.length < 2) {
            this.resetSearch();
            return;
        }
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

    toggleSidebar: function() {
        if (this.sidebar.classList.contains('active')) { this.closeSidebar(); } else { this.openSidebar(); }
    },
    openSidebar: function() { this.sidebar.classList.add('active'); this.sidebarOverlay.classList.add('active'); document.body.classList.add('no-scroll'); },
    closeSidebar: function() { this.sidebar.classList.remove('active'); this.sidebarOverlay.classList.remove('active'); document.body.classList.remove('no-scroll'); }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#products-grid')) SANDUKHAR.catalog.init();
});