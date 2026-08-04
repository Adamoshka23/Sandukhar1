/**
 * Single place to point the frontend at the API.
 *
 * Local dev (localhost/127.0.0.1): talks to the API on port 3000.
 * Everywhere else: assumes the API is reverse-proxied under the same
 * domain at /api (e.g. nginx routing /api and /uploads to the Node
 * process). If you deploy the API on a different domain/subdomain
 * instead, override API_BASE_URL below — this is the only file that
 * needs to change.
 */
window.SD_CONFIG = (function () {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    return {
        API_BASE_URL: isLocal
            ? 'http://localhost:3000/api'
            : `${window.location.protocol}//${window.location.hostname}/api`
    };
})();
