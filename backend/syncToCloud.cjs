require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const LOCAL_DB_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const nodemailer = require('nodemailer');

async function sendFailureEmail(subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL_FROM,
      pass: process.env.ALERT_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.ALERT_EMAIL_FROM,
    to: process.env.ALERT_EMAIL_TO,
    subject: subject || process.env.ALERT_EMAIL_SUBJECT,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('🔔 Alert email sent.');
  } catch (emailErr) {
    console.error('❌ Failed to send alert email:', emailErr);
  }
}

const TABLES = [
    { name: 'customers', timestampColumn: 'updated_at', primaryKey: 'customer_id' },
    { name: 'staff', timestampColumn: null, primaryKey: 'staff_id' },
    { name: 'services', timestampColumn: null, primaryKey: 'service_id' },
    { name: 'bookings', timestampColumn: 'updated_at', primaryKey: 'booking_id' },
    { name: 'booking_services', timestampColumn: 'updated_at', primaryKey: 'booking_service_id' },
    { name: 'payments', timestampColumn: null, primaryKey: 'payment_id' },
    { name: 'customer_preferences', timestampColumn: 'updated_at', primaryKey: 'preference_id' },
    { name: 'customer_visits', timestampColumn: null, primaryKey: 'visit_id' },
    { name: 'discounts', timestampColumn: 'updated_at', primaryKey: 'discount_id' },
    { name: 'gift_cards', timestampColumn: null, primaryKey: 'gift_card_id' },
    { name: 'loyalty_points', timestampColumn: 'last_updated', primaryKey: 'point_id' },
    { name: 'reviews', timestampColumn: 'updated_at', primaryKey: 'review_id' },
    { name: 'staff_availability', timestampColumn: 'updated_at', primaryKey: 'availability_id' },
    { name: 'business_hours', timestampColumn: null, primaryKey: 'hours_id' },
    { name: 'special_hours', timestampColumn: null, primaryKey: 'special_hours_id' },
    { name: 'communication_templates', timestampColumn: null, primaryKey: 'template_id' }
  ];

const LAST_SYNC_FILE = path.join(__dirname, 'lastSync.json');
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

function getLastSyncTime() {
  if (fs.existsSync(LAST_SYNC_FILE)) {
    const data = JSON.parse(fs.readFileSync(LAST_SYNC_FILE, 'utf8'));
    return data.lastSync || '1970-01-01T00:00:00Z';
  }
  return '1970-01-01T00:00:00Z';
}

function setLastSyncTime(time) {
  fs.writeFileSync(LAST_SYNC_FILE, JSON.stringify({ lastSync: time }));
}

async function syncTable(localClient, { name, timestampColumn, primaryKey }, lastSync) {
  let rows;
  if (timestampColumn) {
    const result = await localClient.query(
      `SELECT * FROM ${name} WHERE ${timestampColumn} > $1 ORDER BY ${timestampColumn} ASC`,
      [lastSync]
    );
    rows = result.rows;
  } else {
    const result = await localClient.query(`SELECT * FROM ${name}`);
    rows = result.rows;
  }

  if (!rows.length) return null;

  for (const row of rows) {
    const { error } = await supabase.from(name)
      .upsert(row, { onConflict: primaryKey });

    if (error) {
      console.error(`[${name}] Upsert error:`, error);
    }
  }

  return timestampColumn ? rows[rows.length - 1][timestampColumn] : null;
}

async function main() {
  const localClient = new Client({ connectionString: LOCAL_DB_URL });
  await localClient.connect();

  try {
    let lastSync = getLastSyncTime();

    for (const table of TABLES) {
      try {
        const latest = await syncTable(localClient, table, lastSync);
        if (latest && latest > lastSync) lastSync = latest;
        console.log(`[${table.name}] synced.`);
      } catch (err) {
        console.error(`Error syncing ${table.name}:`, err);
      }
    }

    setLastSyncTime(lastSync);
    console.log(`[${new Date().toISOString()}] Sync complete.`);
  } catch (err) {
    console.error('Global sync error:', err);
  } finally {
    await localClient.end();
  }
}

setInterval(main, SYNC_INTERVAL_MS);
main();
