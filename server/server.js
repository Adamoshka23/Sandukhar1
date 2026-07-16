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
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: environment.CORS_ORIGIN,
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