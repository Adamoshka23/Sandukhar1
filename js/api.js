/**
 * ============================================================
 * SAN DUKHAR — API CLIENT
 * Frontend API service — replaces localStorage data
 * ============================================================
 */

const SD_API = {
    baseURL: 'http://localhost:3000/api',
    token: null,

    /**
     * Initialize API client
     */
    init() {
        this.token = localStorage.getItem('sandukhar_token');
    },

    /**
     * Set auth token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('sandukhar_token', token);
        } else {
            localStorage.removeItem('sandukhar_token');
        }
    },

    /**
     * Get auth headers
     */
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const locale = localStorage.getItem('sandukhar_locale') || 'en';
        headers['Accept-Language'] = locale;
        return headers;
    },

    /**
     * Generic request method
     */
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error.message);
            throw error;
        }
    },

    // ============================================================
    // PRODUCTS
    // ============================================================
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/products?${query}`);
    },

    async getProduct(slug, locale = 'en') {
        return this.request(`/products/${slug}?locale=${locale}`);
    },

    // ============================================================
    // CATEGORIES
    // ============================================================
    async getCategories(locale = 'en') {
        return this.request(`/categories?locale=${locale}`);
    },

    // ============================================================
    // MATERIALS
    // ============================================================
    async getMaterials(locale = 'en') {
        return this.request(`/materials?locale=${locale}`);
    },

    // ============================================================
    // TRANSLATIONS
    // ============================================================
    async getTranslations(locale = 'en') {
        return this.request(`/translations?locale=${locale}`);
    },

    async getAllTranslations() {
        return this.request('/translations/all');
    },

    // ============================================================
    // AUTH
    // ============================================================
    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (data.success && data.data.accessToken) {
            this.setToken(data.data.accessToken);
        }
        return data;
    },

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.success && data.data.accessToken) {
            this.setToken(data.data.accessToken);
        }
        return data;
    },

    async logout() {
        this.setToken(null);
    },

    async getMe() {
        return this.request('/auth/me');
    },

    // ============================================================
    // USERS
    // ============================================================
    async updateProfile(data) {
        return this.request('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
    },

    async changePassword(currentPassword, newPassword) {
        return this.request('/users/me/password', {
            method: 'PATCH',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    },

    // ============================================================
    // ADDRESSES
    // ============================================================
    async getAddresses() {
        return this.request('/addresses');
    },

    async createAddress(address) {
        return this.request('/addresses', { method: 'POST', body: JSON.stringify(address) });
    },

    async updateAddress(id, address) {
        return this.request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(address) });
    },

    async deleteAddress(id) {
        return this.request(`/addresses/${id}`, { method: 'DELETE' });
    },

    // ============================================================
    // TAILORING
    // ============================================================
    async submitTailoringRequest(data) {
        return this.request('/tailoring', { method: 'POST', body: JSON.stringify(data) });
    },

    // ============================================================
    // WISHLIST
    // ============================================================
    async getWishlist() {
        return this.request('/wishlist');
    },

    async toggleWishlist(productId) {
        return this.request('/wishlist/toggle', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
    },

    // ============================================================
    // ORDERS
    // ============================================================
    async getOrders() {
        return this.request('/orders');
    },

    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // ============================================================
    // REVIEWS
    // ============================================================
    async getReviews(productId) {
        return this.request(`/reviews?productId=${productId}`);
    },

    async createReview(reviewData) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    // ============================================================
    // CONTACTS
    // ============================================================
    async sendContact(contactData) {
        return this.request('/contacts', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    },

    // ============================================================
    // NEWSLETTER
    // ============================================================
    async subscribe(email) {
        return this.request('/newsletter', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }
};

// Initialize on load
SD_API.init();

// Expose globally
window.SD_API = SD_API;