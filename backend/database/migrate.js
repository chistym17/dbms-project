require('dotenv').config();
const pool = require('../config/db');

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting database migration...\n');

        console.log('Adding duration_minutes field to sessions table...');
        await client.query(`
            ALTER TABLE sessions 
            ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
        `);
        console.log('✓ duration_minutes field added\n');

        console.log('✓ Migration completed successfully!');

    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

