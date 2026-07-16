/**
 * ============================================================
 * VALIDATION MIDDLEWARE
 * Express-validator wrapper
 * ============================================================
 */

const { validationResult } = require('express-validator');

/**
 * Check validation results and return errors if any
 */
function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));

        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: extractedErrors
        });
    }

    next();
}

module.exports = { validate };