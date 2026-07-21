/**
 * ============================================================
 * DATABASE SEED RUNNER
 * Applies seed.sql against the configured database
 * ============================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const environment = require('../config/environment');

async function seed() {
    const pool = new Pool({
        host: environment.DB_HOST,
        port: environment.DB_PORT,
        database: environment.DB_NAME,
        user: environment.DB_USER,
        password: environment.DB_PASSWORD
    });

    try {
        const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        await pool.query(sql);
        console.log('Seed complete:', environment.DB_NAME);
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

seed();
