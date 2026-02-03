require('dotenv').config();
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    const client = await pool.connect();

    try {
        console.log('Starting database initialization...\n');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schema);

        console.log('✓ Tables created successfully:');
        console.log('  - teachers');
        console.log('  - students');
        console.log('  - courses');
        console.log('  - sessions');
        console.log('  - attendance');
        console.log('\n✓ Indexes created successfully');
        console.log('\n✓ Database initialization complete!');

    } catch (error) {
        console.error('✗ Database initialization failed:');
        console.error('Error:', error.message);
        console.error('Details:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

