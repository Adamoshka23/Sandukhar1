/**
 * ============================================================
 * SAN DUKHAR — MAIN SERVER
 * Luxury Exotic Leather Atelier API
 * ============================================================
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const environment = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes/index');

const app = express();

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    // The frontend is served from a different origin/port than this API
    // (Live Server, python http.server, Vite, ...). Helmet's default
    // same-origin resource policy would block <img> tags from loading
    // uploaded product photos from /uploads, so relax it for cross-origin use.
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Allow the configured origin plus any local dev server (Live Server, python
// http.server, Vite, etc. all pick arbitrary localhost ports) so the API
// doesn't silently reject the frontend just because its port changed.
const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // curl, server-to-server, etc.
        if (origin === environment.CORS_ORIGIN) return callback(null, true);
        if (LOCAL_ORIGIN_PATTERN.test(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));

// ============================================================
// PARSING MIDDLEWARE
// ============================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// LOGGING
// ============================================================
if (environment.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ============================================================
// STATIC FILES
// ============================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// API ROUTES
// ============================================================
app.use('/api', routes);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: environment.NODE_ENV,
        version: '1.0.0'
    });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================
const PORT = environment.PORT;

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║         SAN DUKHAR API SERVER           ║
║         Luxury Atelier Backend          ║
╠══════════════════════════════════════════╣
║  Environment : ${environment.NODE_ENV.padEnd(24)}║
║  Port        : ${String(PORT).padEnd(24)}║
║  Database    : ${environment.DB_NAME.padEnd(24)}║
║  URL         : http://localhost:${PORT}    ║
╚══════════════════════════════════════════╝
    `);
});

module.exports = app;