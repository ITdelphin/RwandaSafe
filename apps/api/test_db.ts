import { Client } from 'pg';

async function testConnection(url: string, name: string) {
    console.log(`\nTesting: ${name}`);
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log(`Success! Time: ${res.rows[0].now}`);
        await client.end();
        return true;
    } catch (err: any) {
        console.error(`Failed: ${err.message}`);
        return false;
    }
}

async function main() {
    const current = 'postgresql://postgres.azbfgpwqvbejeziquwyk:RwandaSafe2026@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true';
    const noBouncer = 'postgresql://postgres.azbfgpwqvbejeziquwyk:RwandaSafe2026@aws-0-eu-west-3.pooler.supabase.com:6543/postgres';
    const directOld = 'postgresql://postgres:RwandaSafe2026@db.azbfgpwqvbejeziquwyk.supabase.co:5432/postgres';
    const directPooler = 'postgresql://postgres.azbfgpwqvbejeziquwyk:RwandaSafe2026@aws-0-eu-west-3.pooler.supabase.com:5432/postgres';

    await testConnection(current, 'Current Pooler');
    await testConnection(noBouncer, 'Pooler without pgbouncer param');
    await testConnection(directOld, 'Classic Direct connection (db.supabase.co)');
    await testConnection(directPooler, 'Direct IPv4 via Pooler host (port 5432)');
}

main().catch(console.error);
