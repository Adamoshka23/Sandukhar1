/**
 * SAN DUKHAR — CATALOG MODULE (v6.0 — LIVE API)
 * Fetches products from the SAN DUKHAR API, renders the grid,
 * then applies client-side filtering, sorting & pagination.
 */
'use strict';

const MATERIAL_TONE = {
    crocodile: 'black',
    python: 'natural',
    ostrich: 'brown',
    stingray: 'grey',
    suede: 'cognac'
};

// The browser's automatic scroll restoration fires before the (async,
// fetch-driven) product grid has finished rendering, so it restores
// against a still-empty/short page and lands at the top regardless of
// where the user actually was. Take manual control instead — see
// SANDUKHAR.catalog.restoreScrollIfReturning().
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem('sd_catalog_scroll', String(window.scrollY)); } catch (e) {}
});

// categoryChildren: parent category slug -> its subcategory slugs, built at
// runtime from the categories API (see buildCategoryChildren). A product
// filed under a subcategory should still count toward and show up under
// the parent.
function categoryMatchesFilter(cardCategory, activeCategories, categoryChildren) {
    return activeCategories.some(filterValue => {
        if (filterValue === cardCategory) return true;
        const children = categoryChildren[filterValue];
        return children ? children.includes(cardCategory) : false;
    });
}

function sdLang() {
    return (window.SD_I18N && window.SD_I18N.getLang) ? window.SD_I18N.getLang() : 'en';
}

function sdAvailability(product) {
    if (product.made_to_order) return 'made-to-order';
    if (product.stock > 0) return 'in-stock';
    return 'made-to-order';
}

function sdT(key, fallback) {
    return (window.SD_I18N && window.SD_I18N.t) ? window.SD_I18N.t(key) : fallback;
}

function sdBadge(product) {
    if (product.made_to_order) return `<span class="product-badge made-to-order">${sdT('catalog_made_to_order', 'Made to Order')}</span>`;
    return '';
}

function sdProductCardHTML(product) {
    const availability = sdAvailability(product);
    const materials = product.materials || [];
    const color = MATERIAL_TONE[materials[0]?.slug] || 'natural';
    const materialSlugs = materials.map(m => m.slug).join(',');
    const materialNames = materials.map(m => m.name).join(', ');
    const lang = sdLang();
    const name = (lang === 'ru' ? product.name_ru : product.name_en) || product.name_en;
    const primaryImage = product.images && product.images.length
        ? (product.images.find(img => img.isPrimary) || product.images[0])
        : null;
    const image = primaryImage
        ? `<img src="${primaryImage.url}" alt="${name}" loading="lazy">`
        : (window.SANDUKHAR ? window.SANDUKHAR.media.placeholder(name) : '');
    const priceValue = parseFloat(product.price);
    const price = (priceValue > 0 && window.SANDUKHAR && window.SANDUKHAR.format)
        ? window.SANDUKHAR.format.price(priceValue)
        : '';

    return `
        <div class="product-card" data-product-id="${product.id}" data-category="${product.category_slug || ''}" data-material="${materialSlugs}" data-color="${color}" data-availability="${availability}">
            <a href="product.html?slug=${product.slug}" class="product-card-link">
                <div class="product-card-image">
                    ${image}
                    <div class="product-card-overlay"></div>
                    ${sdBadge(product)}
                    <button class="btn-wishlist" aria-label="Add to Wishlist" data-product-id="${product.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                </div>
                <div class="product-card-info">
                    <h3 class="product-card-name">${name}</h3>
                    <p class="product-card-material">${materialNames}</p>
                    <p class="product-card-price">${price}</p>
                </div>
            </a>
        </div>`;
}

// ========== ОСНОВНОЙ МОДУЛЬ ==========
SANDUKHAR.catalog = {
    productsGrid: null,
    productsCards: null,
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
    filterCount: null,
    activeFilters: {},
    currentSort: 'featured',
    currentView: 'grid',
    currentPage: 1,
    productsPerPage: 12,
    filteredProducts: [],
    allProducts: [],
    categories: [],
    categoryChildren: {},

    init: async function () {
        this.productsGrid = document.getElementById('products-grid');
        if (!this.productsGrid) return;
        this.cacheDOMElements();
        this.showLoadingState();
        await Promise.all([this.fetchProducts(), this.fetchCategories()]);
        this.renderCategoryFilter();
        this.bindEvents();
        this.applyInitialFilters();
        this.updateResults();
        this.restoreScrollIfReturning();
    },

    // If this load is the result of the browser's Back/Forward button
    // (rather than a fresh visit), scroll back to where the user was —
    // by then the filters/sort/page above already match the URL, so the
    // grid is the same height it was when they left.
    restoreScrollIfReturning: function () {
        const navEntries = typeof performance !== 'undefined' && performance.getEntriesByType
            ? performance.getEntriesByType('navigation') : [];
        const isBackForward = navEntries[0] && navEntries[0].type === 'back_forward';
        if (!isBackForward) return;
        let savedY = null;
        try { savedY = sessionStorage.getItem('sd_catalog_scroll'); } catch (e) {}
        if (savedY === null) return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => window.scrollTo(0, parseInt(savedY, 10)));
        });
    },

    showLoadingState: function () {
        this.productsGrid.innerHTML = '<div class="catalog-loading" style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--color-text-muted);letter-spacing:0.08em;text-transform:uppercase;font-size:0.85rem;">Loading the collection…</div>';
    },

    fetchCategories: async function () {
        try {
            const res = await fetch(`${window.SD_API.baseURL}/categories`);
            const data = await res.json();
            this.categories = (data.success && data.data.categories) ? data.data.categories : [];
        } catch (error) {
            this.categories = [];
        }
        this.categoryChildren = {};
        this.categories.forEach(c => {
            if (!c.parent_id) return;
            const parent = this.categories.find(p => p.id === c.parent_id);
            if (!parent) return;
            if (!this.categoryChildren[parent.slug]) this.categoryChildren[parent.slug] = [];
            this.categoryChildren[parent.slug].push(c.slug);
        });
    },

    renderCategoryFilter: function () {
        const container = document.getElementById('category-filter-options');
        if (!container || this.categories.length === 0) return;

        const lang = sdLang();
        const nameOf = (c) => (lang === 'ru' ? c.name_ru : c.name_en) || c.name_en;
        const topLevel = this.categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
        const childrenOf = (parentId) => this.categories.filter(c => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);

        const optionHtml = (c, isChild) => `
            <label class="filter-option${isChild ? ' filter-suboption' : ''}"><input type="checkbox" name="category" value="${c.slug}"><span class="checkmark"></span><span class="option-label">${nameOf(c)}</span></label>
        `;

        container.innerHTML = topLevel.map(parent =>
            optionHtml(parent, false) + childrenOf(parent.id).map(child => optionHtml(child, true)).join('')
        ).join('');
    },

    fetchProducts: async function () {
        try {
            const res = await fetch(`${window.SD_API.baseURL}/products?limit=1000&locale=${sdLang()}`);
            const data = await res.json();
            this.allProducts = (data.success && data.data.products) ? data.data.products : [];
        } catch (error) {
            console.error('SAN DUKHAR: Failed to load products.', error);
            this.allProducts = [];
        }

        this.applyFeaturedOrder();

        this.productsGrid.innerHTML = '<div class="products-cards" id="products-cards">'
            + this.allProducts.map(sdProductCardHTML).join('') + '</div>'
            + this.emptyStateMarkup() + this.paginationMarkup();
    },

    shuffleArray: function (arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // "Featured" (the default, no-filter view) shows products in a
    // scattered order rather than raw insertion order. The order is
    // re-shuffled once per tab session and then persisted in
    // sessionStorage, so paging through the grid or returning via the
    // back button (see restoreScrollIfReturning) lands on the same
    // arrangement instead of reshuffling under the user.
    applyFeaturedOrder: function () {
        let savedOrder = null;
        try {
            savedOrder = JSON.parse(sessionStorage.getItem('sd_catalog_order'));
        } catch (e) {}

        if (Array.isArray(savedOrder) && savedOrder.length) {
            const byId = new Map(this.allProducts.map(p => [p.id, p]));
            const ordered = savedOrder.map(id => byId.get(id)).filter(Boolean);
            const seen = new Set(ordered.map(p => p.id));
            const newProducts = this.allProducts.filter(p => !seen.has(p.id));
            this.allProducts = ordered.concat(this.shuffleArray(newProducts));
        } else {
            this.allProducts = this.shuffleArray(this.allProducts.slice());
        }

        try {
            sessionStorage.setItem('sd_catalog_order', JSON.stringify(this.allProducts.map(p => p.id)));
        } catch (e) {}
    },

    /**
     * Re-fetch products in the new locale and rebuild the grid,
     * preserving active filters/sort/page. Also rebinds the
     * pagination click handler since fetchProducts() replaces
     * the pagination DOM node.
     */
    refreshLocale: async function () {
        if (!this.productsGrid) return;
        await this.fetchProducts();
        this.collectProductData();
        this.bindPagination();

        // Category option labels are rendered in the current language —
        // rebuild them, then re-check whatever was active and rebind
        // their change listeners (renderCategoryFilter replaces the nodes).
        const checkedCategories = this.activeFilters['category'] || [];
        this.renderCategoryFilter();
        this.sidebar?.querySelectorAll('input[name="category"]').forEach(input => {
            input.checked = checkedCategories.includes(input.value);
            input.addEventListener('change', () => this.onFilterChange(input));
        });

        this.applyAllFilters();
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
    },

    emptyStateMarkup: function () {
        return `<div class="catalog-empty" id="catalog-empty" style="display:none;">
            <div class="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
            <h3 data-i18n="catalog_empty_title">No creations found</h3>
            <p data-i18n="catalog_empty_desc">We couldn't find any pieces matching your current filters. Try adjusting your selection or explore our full collection.</p>
            <button class="btn-outline" id="clear-filters-empty" data-i18n="catalog_empty_btn">View All Collections</button>
        </div>`;
    },

    paginationMarkup: function () {
        return `<nav class="pagination" id="catalog-pagination" aria-label="Catalog Pagination">
            <button class="page-btn prev" disabled aria-label="Previous Page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m15 18-6-6 6-6"/></svg></button>
            <div class="page-numbers"><button class="page-btn active" data-page="1">1</button></div>
            <button class="page-btn next" aria-label="Next Page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 18 6-6-6-6"/></svg></button>
        </nav>`;
    },

    bindPagination: function () {
        if (!this.pagination) return;
        this.pagination.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.page-btn');
            if (!pageBtn || pageBtn.disabled) return;
            if (pageBtn.classList.contains('prev')) this.goToPage(this.currentPage - 1);
            else if (pageBtn.classList.contains('next')) this.goToPage(this.currentPage + 1);
            else this.goToPage(parseInt(pageBtn.getAttribute('data-page')));
        });
    },

    cacheDOMElements: function () {
        this.sidebar = document.getElementById('catalog-sidebar');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        this.filterToggle = document.getElementById('filter-toggle');
        this.activeFiltersContainer = document.getElementById('active-filters');
        this.resultsCount = document.getElementById('results-count');
        this.sortSelect = document.getElementById('sort-select');
        this.viewButtons = document.querySelectorAll('.view-btn');
        this.clearFiltersBtn = document.getElementById('clear-filters');
        this.filterCount = document.querySelector('.filter-count');
    },

    collectProductData: function () {
        this.productsCards = document.getElementById('products-cards');
        this.pagination = document.getElementById('catalog-pagination');
        this.emptyState = document.getElementById('catalog-empty');
        this.productCards = Array.from(this.productsGrid.querySelectorAll('.product-card'));
        this.filteredProducts = [...this.productCards];
    },

    bindEvents: function () {
        this.collectProductData();

        // Фильтры
        this.sidebar.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', () => this.onFilterChange(input));
        });

        // Сортировка
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => {
                this.currentSort = this.sortSelect.value;
                this.applySorting();
                this.currentPage = 1;
                this.updateResultsDisplay();
                this.syncUrlWithState();
            });
        }

        // Вид (сетка/список)
        this.viewButtons.forEach(btn => btn.addEventListener('click', () => this.switchView(btn)));

        // Пагинация
        this.bindPagination();

        // Очистка фильтров
        if (this.clearFiltersBtn) this.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        const clearEmptyBtn = document.getElementById('clear-filters-empty');
        if (clearEmptyBtn) clearEmptyBtn.addEventListener('click', () => this.clearAllFilters());

        // Сайдбар (мобильный)
        if (this.filterToggle) this.filterToggle.addEventListener('click', () => this.toggleSidebar());
        if (this.sidebarOverlay) this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar?.classList.contains('active')) this.closeSidebar();
        });

        // Сворачивание групп фильтров
        this.sidebar.querySelectorAll('.filter-group-title').forEach(title => {
            title.addEventListener('click', () => title.parentElement.classList.toggle('collapsed'));
        });
    },

    // ========== ФИЛЬТРЫ ==========
    onFilterChange: function (input) {
        const filterType = input.name,
            filterValue = input.value;
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
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.syncUrlWithState();
    },

    applyAllFilters: function () {
        this.filteredProducts = this.productCards.filter(card => {
            if (this.activeFilters['category']?.length && !categoryMatchesFilter(card.getAttribute('data-category'), this.activeFilters['category'], this.categoryChildren)) return false;
            if (this.activeFilters['material']?.length) {
                const cardMaterials = (card.getAttribute('data-material') || '').split(',').filter(Boolean);
                if (!this.activeFilters['material'].some(m => cardMaterials.includes(m))) return false;
            }
            if (this.activeFilters['availability']?.length && !this.activeFilters['availability'].includes(card.getAttribute('data-availability'))) return false;
            return true;
        });
        this.applySorting();
    },

    applySorting: function () {
        const sortFns = {
            'featured': () => {},
            'newest': () => this.filteredProducts.sort((a, b) => b.getAttribute('data-product-id').localeCompare(a.getAttribute('data-product-id'))),
            'name-asc': () => this.filteredProducts.sort((a, b) => (a.querySelector('.product-card-name')?.textContent?.trim() || '').localeCompare(b.querySelector('.product-card-name')?.textContent?.trim() || ''))
        };
        if (sortFns[this.currentSort]) sortFns[this.currentSort]();
    },

    updateResults: function () {
        this.applyAllFilters();
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
    },

    updateResultsDisplay: function () {
        const total = this.filteredProducts.length;
        if (this.resultsCount) this.resultsCount.textContent = total;

        // Sorting/filtering only reorders the in-memory array — the DOM nodes
        // themselves stay wherever they were first inserted unless we move
        // them. Re-append in the current sorted order (then any filtered-out
        // cards after) so the grid's visual order actually matches.
        const hidden = this.productCards.filter(c => !this.filteredProducts.includes(c));
        this.filteredProducts.concat(hidden).forEach(c => this.productsCards.appendChild(c));

        this.productCards.forEach(c => c.style.display = 'none');
        if (total === 0) { this.showEmptyState(); return; }
        this.hideEmptyState();
        const start = (this.currentPage - 1) * this.productsPerPage;
        const pageProducts = this.filteredProducts.slice(start, start + this.productsPerPage);
        pageProducts.forEach(c => c.style.display = '');
    },

    updatePagination: function (totalPages) {
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

    goToPage: function (page) {
        this.currentPage = page;
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
        this.syncUrlWithState();
        if (this.productsGrid) this.productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    switchView: function (btn) {
        this.viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.getAttribute('data-view');
        this.productsCards.classList.toggle('list-view', this.currentView === 'list');
    },

    showEmptyState: function () {
        if (this.emptyState) this.emptyState.style.display = 'block';
        if (this.pagination) this.pagination.style.display = 'none';
    },

    hideEmptyState: function () {
        if (this.emptyState) this.emptyState.style.display = 'none';
        if (this.pagination) this.pagination.style.display = '';
    },

    updateActiveFilterTags: function () {
        if (!this.activeFiltersContainer) return;
        this.activeFiltersContainer.innerHTML = '';
        const filterLabels = {
            'category': sdT('catalog_category', 'Category'),
            'material': sdT('catalog_material_filter', 'Material'),
            'availability': sdT('catalog_availability', 'Availability')
        };
        for (const [filterType, values] of Object.entries(this.activeFilters)) {
            values.forEach(value => {
                const tag = document.createElement('span');
                tag.className = 'active-filter-tag';
                const label = filterLabels[filterType] || filterType;
                const optionLabelEl = this.sidebar?.querySelector(`input[name="${filterType}"][value="${value}"]`)
                    ?.closest('.filter-option')?.querySelector('.option-label');
                const displayValue = optionLabelEl ? optionLabelEl.textContent : value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                tag.innerHTML = `${label}: ${displayValue} <span class="remove-tag" data-filter="${filterType}" data-value="${value}">×</span>`;
                this.activeFiltersContainer.appendChild(tag);
            });
        }
        this.activeFiltersContainer.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', () => this.removeFilter(btn.getAttribute('data-filter'), btn.getAttribute('data-value')));
        });
    },

    removeFilter: function (filterType, filterValue) {
        const cb = this.sidebar.querySelector(`input[name="${filterType}"][value="${filterValue}"]`);
        if (cb) cb.checked = false;
        if (this.activeFilters[filterType]) {
            this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== filterValue);
            if (!this.activeFilters[filterType].length) delete this.activeFilters[filterType];
        }
        this.currentPage = 1;
        this.updateResults();
        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.syncUrlWithState();
    },

    clearAllFilters: function () {
        this.sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        this.activeFilters = {};
        this.currentPage = 1;
        this.currentSort = 'featured';
        if (this.sortSelect) this.sortSelect.value = 'featured';
        this.filteredProducts = [...this.productCards];
        this.updateResults();
        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.closeSidebar();
        this.syncUrlWithState();
    },

    updateFilterCount: function () {
        if (!this.filterCount) return;
        let count = 0;
        for (const v of Object.values(this.activeFilters)) count += Array.isArray(v) ? v.length : 1;
        this.filterCount.textContent = count;
        this.filterCount.classList.toggle('active', count > 0);
    },

    // Reflects the current filters/sort/page in the URL (no navigation,
    // no new history entry) so that reloading — including the browser's
    // Back button landing back on this page — reconstructs the same view
    // instead of resetting to an unfiltered page 1.
    syncUrlWithState: function () {
        const params = new URLSearchParams();
        ['category', 'material', 'availability'].forEach(type => {
            if (this.activeFilters[type]?.length) params.set(type, this.activeFilters[type].join(','));
        });
        if (this.currentSort && this.currentSort !== 'featured') params.set('sort', this.currentSort);
        if (this.currentPage > 1) params.set('page', this.currentPage);
        const qs = params.toString();
        const newUrl = window.location.pathname + (qs ? '?' + qs : '');
        history.replaceState(history.state, '', newUrl);
    },

    applyInitialFilters: function () {
        const params = new URLSearchParams(window.location.search);
        if (params.has('search')) { const q = params.get('search'); if (q?.trim().length >= 2) { this.performSearch(q.trim()); return; } }
        ['category', 'material', 'availability'].forEach(type => {
            if (params.has(type)) {
                const values = params.get(type).split(',').filter(Boolean);
                this.activeFilters[type] = values;
                values.forEach(val => this.syncCheckbox(type, val));
            }
        });
        if (params.has('collection')) this.activeFilters['collection'] = [params.get('collection')];
        if (params.has('sort')) {
            this.currentSort = params.get('sort');
            if (this.sortSelect) this.sortSelect.value = this.currentSort;
        }
        const pageParam = parseInt(params.get('page'), 10);
        if (pageParam > 1) this.currentPage = pageParam;
        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.updateResults();
    },

    syncCheckbox: function (name, value) {
        const cb = this.sidebar.querySelector(`input[name="${name}"][value="${value}"]`);
        if (cb) cb.checked = true;
    },

    performSearch: function (query) {
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

    resetSearch: function () {
        this.filteredProducts = [...this.productCards];
        this.applyAllFilters();
        this.currentPage = 1;
        this.updateResultsDisplay();
        this.updatePagination(Math.ceil(this.filteredProducts.length / this.productsPerPage));
    },

    toggleSidebar: function () { this.sidebar.classList.contains('active') ? this.closeSidebar() : this.openSidebar(); },
    openSidebar: function () { this.sidebar.classList.add('active'); this.sidebarOverlay.classList.add('active'); document.body.classList.add('no-scroll'); },
    closeSidebar: function () { this.sidebar.classList.remove('active'); this.sidebarOverlay.classList.remove('active'); document.body.classList.remove('no-scroll'); }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#products-grid')) SANDUKHAR.catalog.init();
});

document.addEventListener('sd_i18n_changed', () => {
    if (SANDUKHAR.catalog.productsGrid) SANDUKHAR.catalog.refreshLocale();
});
