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

        // Create Enum if not exists
        try {
            await client.query(`
        CREATE TYPE "DashboardType" AS ENUM ('POLICE', 'HOSPITAL', 'FIRE', 'RIB', 'ADMIN');
      `);
            console.log('Enum DashboardType created.');
        } catch (e) {
            console.log('Enum DashboardType might already exist or error:', e.message);
        }

        // Create the table manually
        await client.query(`
      CREATE TABLE IF NOT EXISTS "public"."dashboard_access" (
          "id" TEXT NOT NULL,
          "user_id" TEXT NOT NULL,
          "dashboard" "DashboardType" NOT NULL,
          "granted_by_id" TEXT NOT NULL,
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "revoked_at" TIMESTAMP(3),

          CONSTRAINT "dashboard_access_pkey" PRIMARY KEY ("id")
      );
    `);

        await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "dashboard_access_user_id_dashboard_key" ON "public"."dashboard_access"("user_id", "dashboard");
    `);

        // Check if constraint exists before adding
        const constraintCheck = await client.query(`
      SELECT constraint_name FROM information_schema.key_column_usage 
      WHERE constraint_name = 'dashboard_access_user_id_fkey'
    `);

        if (constraintCheck.rows.length === 0) {
            await client.query(`
        ALTER TABLE "public"."dashboard_access" ADD CONSTRAINT "dashboard_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
        }

        console.log('Table and constraints created successfully!');
        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
