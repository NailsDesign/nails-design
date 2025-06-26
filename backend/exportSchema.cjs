const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function getCreateStatements() {
  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);

  for (const row of res.rows) {
    const table = row.table_name;
    const { rows } = await client.query(`SELECT pg_get_tabledef('${table}')`);
    const ddl = rows?.[0]?.pg_get_tabledef;
    if (ddl) {
      console.log(`\n--- ${table} ---\n`);
      console.log(ddl);
      fs.appendFileSync('full_schema.sql', `\n-- ${table} --\n${ddl}\n`);
    }
  }
}

(async () => {
  try {
    await client.connect();
    await getCreateStatements();
    await client.end();
    console.log('✅ Schema exported to full_schema.sql');
  } catch (err) {
    console.error('❌ Failed to export schema:', err.message);
  }
})();
