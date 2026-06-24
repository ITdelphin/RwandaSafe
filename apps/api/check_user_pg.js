const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log('Connected!');
        const res = await client.query("SELECT id, email, role, (password_hash IS NOT NULL) as has_password FROM users WHERE email = 'delphinngarambe@gmail.com'");
        if (res.rows.length === 0) {
            console.log('User NOT found!');
        } else {
            console.log('User found:', res.rows[0]);
        }
        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
