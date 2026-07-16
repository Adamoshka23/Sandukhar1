/**
 * ============================================================
 * FILE UPLOAD MIDDLEWARE
 * Multer Configuration
 * ============================================================
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const environment = require('../config/environment');

// Allowed file types
const ALLOWED_MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/avif': '.avif'
};

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * Create multer storage configuration
 */
function createStorage(destination) {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(environment.UPLOAD_DIR, destination));
        },
        filename: (req, file, cb) => {
            const ext = ALLOWED_MIME_TYPES[file.mimetype] || path.extname(file.originalname).toLowerCase();
            const filename = `${uuidv4()}${ext}`;
            cb(null, filename);
        }
    });
}

/**
 * File filter — only images
 */
function imageFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }
}

/**
 * Create upload middleware
 * @param {string} destination - Subfolder in uploads directory
 * @param {number} maxFiles - Maximum number of files
 */
function createUpload(destination, maxFiles = 10) {
    return multer({
        storage: createStorage(destination),
        fileFilter: imageFilter,
        limits: {
            fileSize: environment.MAX_FILE_SIZE,
            files: maxFiles
        }
    });
}

// Pre-configured uploads
const productUpload = createUpload('products', 10);
const categoryUpload = createUpload('categories', 5);
const galleryUpload = createUpload('gallery', 20);
const materialUpload = createUpload('materials', 5);
const bannerUpload = createUpload('banners', 5);

module.exports = {
    productUpload,
    categoryUpload,
    galleryUpload,
    materialUpload,
    bannerUpload,
    createUpload
};