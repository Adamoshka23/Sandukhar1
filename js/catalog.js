/**
 * ============================================================
 * SAN DUKHAR — CATALOG MODULE
 * Advanced Filtering, Sorting, Pagination
 * Version: 1.0
 * ============================================================
 */

'use strict';

SANDUKHAR.catalog = {
    // DOM References
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

    // State
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
    },

    bindEvents: function() {
        // Filter checkboxes
        const filterInputs = this.sidebar.querySelectorAll('input[type="checkbox"]');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.onFilterChange(input));
        });

        // Price apply button
        const applyPriceBtn = document.getElementById('apply-price');
        if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', () => this.onPriceFilter());
        }

        // Sort select
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => {
                this.currentSort = this.sortSelect.value;
                this.updateResults();
            });
        }

        // View toggle buttons
        this.viewButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn));
        });

        // Pagination
        if (this.pagination) {
            this.pagination.addEventListener('click', (e) => {
                const pageBtn = e.target.closest('.page-btn');
                if (!pageBtn || pageBtn.disabled) return;
                
                if (pageBtn.classList.contains('prev')) {
                    this.goToPage(this.currentPage - 1);
                } else if (pageBtn.classList.contains('next')) {
                    this.goToPage(this.currentPage + 1);
                } else {
                    const page = parseInt(pageBtn.getAttribute('data-page'));
                    this.goToPage(page);
                }
            });
        }

        // Clear all filters
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // Clear filters from empty state
        const clearEmptyBtn = document.getElementById('clear-filters-empty');
        if (clearEmptyBtn) {
            clearEmptyBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // Mobile filter toggle
        if (this.filterToggle) {
            this.filterToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Sidebar overlay click
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        // Close sidebar on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar?.classList.contains('active')) {
                this.closeSidebar();
            }
        });

        // Filter group collapse
        const filterGroupTitles = this.sidebar.querySelectorAll('.filter-group-title');
        filterGroupTitles.forEach(title => {
            title.addEventListener('click', () => {
                title.parentElement.classList.toggle('collapsed');
            });
        });
    },

    onFilterChange: function(input) {
        const filterType = input.name;
        const filterValue = input.value;

        if (!this.activeFilters[filterType]) {
            this.activeFilters[filterType] = [];
        }

        if (input.checked) {
            if (!this.activeFilters[filterType].includes(filterValue)) {
                this.activeFilters[filterType].push(filterValue);
            }
        } else {
            this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== filterValue);
            if (this.activeFilters[filterType].length === 0) {
                delete this.activeFilters[filterType];
            }
        }

        this.currentPage = 1;
        this.updateResults();
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
        this.updateResults();
        this.updateActiveFilterTags();
    },

    applyFilters: function() {
        this.filteredProducts = this.productCards.filter(card => {
            // Category filter
            if (this.activeFilters['category'] && this.activeFilters['category'].length > 0) {
                const cardCategory = card.getAttribute('data-category');
                if (!this.activeFilters['category'].includes(cardCategory)) return false;
            }

            // Material filter
            if (this.activeFilters['material'] && this.activeFilters['material'].length > 0) {
                const cardMaterial = card.getAttribute('data-material');
                if (!this.activeFilters['material'].includes(cardMaterial)) return false;
            }

            // Color filter
            if (this.activeFilters['color'] && this.activeFilters['color'].length > 0) {
                const cardColor = card.getAttribute('data-color');
                if (!this.activeFilters['color'].includes(cardColor)) return false;
            }

            // Availability filter
            if (this.activeFilters['availability'] && this.activeFilters['availability'].length > 0) {
                const cardAvailability = card.getAttribute('data-availability');
                if (!this.activeFilters['availability'].includes(cardAvailability)) return false;
            }

            // Price filter
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
            'featured': () => { /* Keep original order */ },
            'newest': () => {
                this.filteredProducts.sort((a, b) => {
                    return b.getAttribute('data-product-id') - a.getAttribute('data-product-id');
                });
            },
            'price-asc': () => {
                this.filteredProducts.sort((a, b) => {
                    return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
                });
            },
            'price-desc': () => {
                this.filteredProducts.sort((a, b) => {
                    return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
                });
            },
            'name-asc': () => {
                this.filteredProducts.sort((a, b) => {
                    const nameA = a.querySelector('.product-card-name').textContent.trim();
                    const nameB = b.querySelector('.product-card-name').textContent.trim();
                    return nameA.localeCompare(nameB);
                });
            }
        };

        if (sortFunctions[this.currentSort]) {
            sortFunctions[this.currentSort]();
        }
    },

    updateResults: function() {
        this.applyFilters();

        const totalProducts = this.filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / this.productsPerPage);

        // Update results count
        if (this.resultsCount) {
            this.resultsCount.textContent = totalProducts;
        }

        // Handle empty state
        if (totalProducts === 0) {
            this.showEmptyState();
            return;
        } else {
            this.hideEmptyState();
        }

        // Calculate pagination range
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        // Show/hide products
        this.productCards.forEach(card => {
            card.style.display = 'none';
        });

        pageProducts.forEach(card => {
            card.style.display = '';
        });

        // Update pagination
        this.updatePagination(totalPages);
    },

    updatePagination: function(totalPages) {
        if (!this.pagination) return;

        const prevBtn = this.pagination.querySelector('.page-btn.prev');
        const nextBtn = this.pagination.querySelector('.page-btn.next');
        const pageNumbersContainer = this.pagination.querySelector('.page-numbers');

        // Update prev/next buttons
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;

        // Generate page numbers
        pageNumbersContainer.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-btn');
            pageBtn.setAttribute('data-page', i);
            pageBtn.textContent = i;
            
            if (i === this.currentPage) {
                pageBtn.classList.add('active');
            }

            pageNumbersContainer.appendChild(pageBtn);
        }
    },

    goToPage: function(page) {
        this.currentPage = page;
        this.updateResults();
        
        // Scroll to top of products
        this.productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    switchView: function(btn) {
        this.viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentView = btn.getAttribute('data-view');

        if (this.currentView === 'list') {
            this.productsGrid.classList.add('list-view');
        } else {
            this.productsGrid.classList.remove('list-view');
        }
    },

    showEmptyState: function() {
        if (this.emptyState) {
            this.emptyState.style.display = 'block';
        }
        if (this.pagination) {
            this.pagination.style.display = 'none';
        }
        this.productsGrid.style.display = 'none';
    },

    hideEmptyState: function() {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        if (this.pagination) {
            this.pagination.style.display = '';
        }
        this.productsGrid.style.display = '';
    },

    updateActiveFilterTags: function() {
        if (!this.activeFiltersContainer) return;

        this.activeFiltersContainer.innerHTML = '';

        const filterLabels = {
            'category': 'Category',
            'material': 'Material',
            'color': 'Color',
            'availability': 'Availability'
        };

        for (const [filterType, values] of Object.entries(this.activeFilters)) {
            if (filterType === 'price') {
                const range = values[0];
                const tag = document.createElement('span');
                tag.classList.add('active-filter-tag');
                tag.innerHTML = `
                    Price: $${range.min || 0} — $${range.max || '∞'}
                    <span class="remove-tag" data-filter="${filterType}">×</span>
                `;
                this.activeFiltersContainer.appendChild(tag);
                continue;
            }

            values.forEach(value => {
                const tag = document.createElement('span');
                tag.classList.add('active-filter-tag');
                const label = filterLabels[filterType] || filterType;
                const displayValue = value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                tag.innerHTML = `
                    ${label}: ${displayValue}
                    <span class="remove-tag" data-filter="${filterType}" data-value="${value}">×</span>
                `;
                this.activeFiltersContainer.appendChild(tag);
            });
        }

        // Bind remove events
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
            document.getElementById('price-min').value = '';
            document.getElementById('price-max').value = '';
        } else {
            // Uncheck corresponding checkbox
            const checkbox = this.sidebar.querySelector(
                `input[name="${filterType}"][value="${filterValue}"]`
            );
            if (checkbox) {
                checkbox.checked = false;
            }

            // Remove from active filters
            if (this.activeFilters[filterType]) {
                this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== filterValue);
                if (this.activeFilters[filterType].length === 0) {
                    delete this.activeFilters[filterType];
                }
            }
        }

        this.currentPage = 1;
        this.updateResults();
        this.updateActiveFilterTags();
        this.updateFilterCount();
    },

    clearAllFilters: function() {
        // Uncheck all checkboxes
        const allCheckboxes = this.sidebar.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.checked = false);

        // Clear price inputs
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        if (priceMin) priceMin.value = '';
        if (priceMax) priceMax.value = '';

        // Reset state
        this.activeFilters = {};
        this.currentPage = 1;
        this.currentSort = 'featured';
        
        if (this.sortSelect) {
            this.sortSelect.value = 'featured';
        }

        this.updateResults();
        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.closeSidebar();
    },

    updateFilterCount: function() {
        if (!this.filterCount) return;

        let count = 0;
        for (const values of Object.values(this.activeFilters)) {
            count += Array.isArray(values) ? values.length : 1;
        }

        this.filterCount.textContent = count;
        if (count > 0) {
            this.filterCount.classList.add('active');
        } else {
            this.filterCount.classList.remove('active');
        }
    },

    applyInitialFilters: function() {
        // Parse URL parameters for pre-filtered catalog links
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('category')) {
            const category = params.get('category');
            const checkbox = this.sidebar.querySelector(`input[name="category"][value="${category}"]`);
            if (checkbox) checkbox.checked = true;
            this.activeFilters['category'] = [category];
        }

        if (params.has('material')) {
            const material = params.get('material');
            const checkbox = this.sidebar.querySelector(`input[name="material"][value="${material}"]`);
            if (checkbox) checkbox.checked = true;
            this.activeFilters['material'] = [material];
        }

        if (params.has('collection')) {
            // Custom collection handling
        }

        this.updateActiveFilterTags();
        this.updateFilterCount();
        this.updateResults();
    },

    toggleSidebar: function() {
        if (this.sidebar.classList.contains('active')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },

    openSidebar: function() {
        this.sidebar.classList.add('active');
        this.sidebarOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    },

    closeSidebar: function() {
        this.sidebar.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
};

// Extend initialization
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#products-grid')) {
        SANDUKHAR.catalog.init();
    }
});