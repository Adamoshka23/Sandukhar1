/**
 * ============================================================
 * GLOBAL ERROR HANDLER
 * ============================================================
 */

const environment = require('../config/environment');

function errorHandler(err, req, res, next) {
    console.error('Error:', {
        message: err.message,
        stack: environment.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.originalUrl,
        method: req.method
    });

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
        });
    }

    // Multer file count error
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(413).json({
            success: false,
            message: 'Too many files uploaded.'
        });
    }

    // Multer invalid file type
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(415).json({
            success: false,
            message: err.message
        });
    }

    // PostgreSQL errors
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry. This record already exists.'
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Referenced record does not exist.'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = environment.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(environment.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;