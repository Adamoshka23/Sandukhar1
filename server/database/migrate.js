/**
 * ============================================================
 * DATABASE MIGRATION RUNNER
 * Applies schema.sql against the configured database
 * ============================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const environment = require('../config/environment');

async function migrate() {
    const pool = new Pool({
        host: environment.DB_HOST,
        port: environment.DB_PORT,
        database: environment.DB_NAME,
        user: environment.DB_USER,
        password: environment.DB_PASSWORD
    });

    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('Migration complete: schema applied to', environment.DB_NAME);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
