import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import stripeRoutes from '../stripe.js';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret_here";
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


const allowedOrigins = [
  'https://nails-design.vercel.app', // production domain
  'http://localhost:3000' // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow localhost, production, and all Vercel preview deployments
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/nails-design-[a-z0-9]+-nails-design\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Import your Stripe route
app.use('/api', stripeRoutes);

// JWT auth middleware
function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    req.admin = user;
    next();
  });
}


// Register
app.post('/customers/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, birth_date, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO customers (first_name, last_name, email, phone, birth_date, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING customer_id, first_name, last_name, email, phone, birth_date, join_date`,
      [first_name, last_name, email, phone, birth_date, password_hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Email already exists." });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login (returns JWT)
app.post('/customers/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query(`SELECT * FROM customers WHERE email = $1`, [email]);
  const user = result.rows[0];
  if (!user) return res.status(400).json({ error: "Invalid email or password." });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ error: "Invalid email or password." });
  const token = jwt.sign({ 
    id: user.customer_id, 
    first_name: user.first_name, 
    last_name: user.last_name, 
    email: user.email 
  }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ 
    token, 
    user: { 
      id: user.customer_id, 
      first_name: user.first_name, 
      last_name: user.last_name, 
      email: user.email, 
      phone: user.phone 
    } 
  });
});

// Password reset request
app.post('/customers/forgot-password', async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const result = await pool.query(
    `UPDATE customers SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3 RETURNING *`,
    [token, expiry, email]
  );
  if (result.rowCount === 0) return res.status(400).json({ error: "Email not found" });

  // Demo email sending (replace with real SMTP details in production)
  const transporter = nodemailer.createTransport({
    host: "smtp.example.com", port: 587, secure: false,
    auth: { user: "your_email", pass: "your_password" }
  });
  await transporter.sendMail({
    from: '"Nail Salon" <noreply@nailsalon.com>',
    to: email,
    subject: "Reset your password",
    text: `To reset your password, click: https://yourdomain.com/reset-password?token=${token}`
  });
  res.json({ success: true });
});

// Password reset with token
app.post('/customers/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const userRes = await pool.query(
    `SELECT * FROM customers WHERE reset_token=$1 AND reset_token_expiry > NOW()`, [token]
  );
  const user = userRes.rows[0];
  if (!user) return res.status(400).json({ error: "Invalid or expired token" });
  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    `UPDATE customers SET password_hash=$1, reset_token=NULL, reset_token_expiry=NULL WHERE customer_id=$2`,
    [password_hash, user.customer_id]
  );
  res.json({ success: true });
});

// Get bookings for logged-in customer
app.get('/my-bookings', authenticateToken, async (req, res) => {
  const customer_id = req.user.id;
  const { rows } = await pool.query(
    `SELECT b.*, s.name AS service_name, 
            CONCAT(st.first_name, ' ', st.last_name) AS staff_name
     FROM bookings b
     LEFT JOIN booking_services bs ON b.booking_id = bs.booking_id
     LEFT JOIN services s ON bs.service_id = s.service_id
     LEFT JOIN staff st ON b.staff_id = st.staff_id
     WHERE b.customer_id = $1
     ORDER BY b.booking_date DESC`,
    [customer_id]
  );
  res.json(rows);
});

app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM staff WHERE email=$1 AND role=$2', [email, 'admin']);
  const admin = result.rows[0];
  if (!admin) return res.status(400).json({ error: "Invalid email or password." });
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return res.status(400).json({ error: "Invalid email or password." });
  const token = jwt.sign({ 
    id: admin.staff_id, 
    email: admin.email, 
    role: "admin" 
  }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ 
    token, 
    admin: { 
      id: admin.staff_id, 
      email: admin.email, 
      name: `${admin.first_name} ${admin.last_name}` 
    } 
  });
});

app.get('/appointments', authenticateAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT b.*, 
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
            s.name AS service_name
     FROM bookings b
     LEFT JOIN customers c ON b.customer_id = c.customer_id
     LEFT JOIN staff st ON b.staff_id = st.staff_id
     LEFT JOIN booking_services bs ON b.booking_id = bs.booking_id
     LEFT JOIN services s ON bs.service_id = s.service_id
     ORDER BY b.booking_date DESC`
  );
  res.json(rows);
});

// Get all services
app.get('/services', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT service_id as id, name, description, duration_minutes, price, category 
       FROM services 
       WHERE is_active = true 
       ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all staff
app.get('/staff', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT staff_id as id, 
              CONCAT(first_name, ' ', last_name) as name,
              first_name, last_name, email, phone, role, specialization
       FROM staff 
       WHERE is_active = true 
       ORDER BY first_name, last_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get booked appointments by day and staff
app.get('/appointments/by-day', async (req, res) => {
  try {
    const { date, staff_id } = req.query;
    let rows;
    if (staff_id === "any") {
      // Get all bookings for the date, regardless of staff
      const result = await pool.query(
        `SELECT booking_date FROM bookings WHERE DATE(booking_date) = $1`,
        [date]
      );
      rows = result.rows;
    } else {
      // Get bookings for the date and specific staff
      const result = await pool.query(
        `SELECT booking_date FROM bookings WHERE DATE(booking_date) = $1 AND staff_id = $2`,
        [date, staff_id]
      );
      rows = result.rows;
    }
    res.json(rows.map(row => row.booking_date));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new booking
app.post('/appointments', async (req, res) => {
  try {
    const { name, email, phone, service_ids, staff_id, appointment_datetime } = req.body;
    
    // First, create or get customer
    let customerResult = await pool.query(
      `SELECT customer_id FROM customers WHERE email = $1`,
      [email]
    );
    
    let customer_id;
    if (customerResult.rows.length === 0) {
      // Create new customer
      const newCustomer = await pool.query(
        `INSERT INTO customers (first_name, last_name, email, phone) 
         VALUES ($1, $2, $3, $4) 
         RETURNING customer_id`,
        [name.split(' ')[0] || name, name.split(' ').slice(1).join(' ') || '', email, phone]
      );
      customer_id = newCustomer.rows[0].customer_id;
    } else {
      customer_id = customerResult.rows[0].customer_id;
    }
    
    // Create booking
    const bookingResult = await pool.query(
      `INSERT INTO bookings (customer_id, staff_id, booking_date, duration_minutes, status) 
       VALUES ($1, $2, $3, 60, 'confirmed') 
       RETURNING booking_id`,
      [customer_id, staff_id, appointment_datetime]
    );
    
    const booking_id = bookingResult.rows[0].booking_id;
    
    // Add each selected service to booking
    for (const service_id of service_ids) {
      await pool.query(
        `INSERT INTO booking_services (booking_id, service_id, price_at_booking) 
         VALUES ($1, $2, (SELECT price FROM services WHERE service_id = $2))`,
        [booking_id, service_id]
      );
    }
    
    res.json({ success: true, booking_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Finalize booking (no payment for now)
app.post('/api/bookings/finalize', async (req, res) => {
  const { customer_id, staff_id, service_ids, appointment_datetime, promo_code } = req.body;

  // 1. Validate input
  if (!customer_id || !staff_id || !service_ids || !appointment_datetime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 2. Handle "Any professional" staff selection
  let final_staff_id = staff_id;
  if (staff_id === "any") {
    // Find available staff for the appointment time
    const availableStaffRes = await pool.query(
      `SELECT st.staff_id 
       FROM staff st
       WHERE st.is_active = true 
       AND st.staff_id NOT IN (
         SELECT DISTINCT b.staff_id 
         FROM bookings b 
         WHERE b.booking_date = $1 
         AND b.status != 'cancelled'
       )
       ORDER BY st.first_name, st.last_name
       LIMIT 1`,
      [appointment_datetime]
    );

    if (availableStaffRes.rows.length === 0) {
      return res.status(409).json({ error: "No staff available for this time slot" });
    }

    final_staff_id = availableStaffRes.rows[0].staff_id;
  }

  // 3. Check if time slot is still available for the selected staff
  const slotCheck = await pool.query(
    `SELECT 1 FROM bookings WHERE staff_id = $1 AND booking_date = $2 AND status != 'cancelled'`,
    [final_staff_id, appointment_datetime]
  );
  if (slotCheck.rowCount > 0) {
    return res.status(409).json({ error: "Time slot already booked" });
  }

  // 4. Validate promo code (if provided)
  let discount = 0;
  if (promo_code) {
    const promoRes = await pool.query(
      `SELECT * FROM discounts WHERE code = $1 AND valid_from <= CURRENT_DATE AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)`,
      [promo_code]
    );
    const promo = promoRes.rows[0];
    if (!promo) {
      return res.status(400).json({ error: "Invalid or expired promo code" });
    }
    discount = Number(promo.value);
    // Optionally: mark promo as used for this customer (not implemented here)
  }

  // 5. Calculate total price and duration
  const serviceRes = await pool.query(
    `SELECT price, duration_minutes FROM services WHERE service_id = ANY($1::uuid[])`,
    [service_ids]
  );
  const total = serviceRes.rows.reduce((sum, s) => sum + Number(s.price), 0) - discount;
  const duration = serviceRes.rows.reduce((sum, s) => sum + Number(s.duration_minutes), 0);

  // Validation: duration must be > 0 and services must be valid
  if (!duration || serviceRes.rows.length === 0) {
    return res.status(400).json({ error: "Invalid service selection: duration is zero or services not found." });
  }

  // 6. Create booking record (no payment for now)
  const booking_id = uuidv4();
  await pool.query(
    `INSERT INTO bookings (booking_id, customer_id, staff_id, booking_date, total, promo_code, discount, duration_minutes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed')`,
    [booking_id, customer_id, final_staff_id, appointment_datetime, total, promo_code, discount, duration]
  );
  
  // Link services to booking
  for (const service_id of service_ids) {
    await pool.query(
      `INSERT INTO booking_services (booking_id, service_id) VALUES ($1, $2)`,
      [booking_id, service_id]
    );
  }

  // 7. Get staff name for response
  const staffRes = await pool.query(
    `SELECT CONCAT(first_name, ' ', last_name) as staff_name FROM staff WHERE staff_id = $1`,
    [final_staff_id]
  );
  const staff_name = staffRes.rows[0]?.staff_name || 'Unknown';

  // 8. Respond with booking ID and assigned staff
  res.json({ 
    success: true, 
    booking_id,
    assigned_staff_id: final_staff_id,
    assigned_staff_name: staff_name
  });
});

app.get('/', (req, res) => {
  res.send('Nail Salon API is running!');
});

app.listen(4000, () => console.log('API server running on port 4000'));
