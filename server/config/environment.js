require('dotenv').config();

const environment = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3000,

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    DB_NAME: process.env.DB_NAME || 'sandukhar',
    DB_USER: process.env.DB_USER || 'sandukhar_admin',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,

    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5500',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@sandukhar.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin123!Secure'
};

module.exports = environment;