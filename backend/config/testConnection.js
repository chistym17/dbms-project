require('dotenv').config();
const pool = require('./db');

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Database connection successful!');

        const result = await client.query('SELECT NOW()');
        console.log('Current database time:', result.rows[0].now);

        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();

