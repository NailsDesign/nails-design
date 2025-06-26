import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import stripeRoutes from '../stripe.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret_here";
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
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
    const { rows } = await pool.query(
      `SELECT booking_date 
       FROM bookings 
       WHERE DATE(booking_date) = $1 AND staff_id = $2`,
      [date, staff_id]
    );
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

app.get('/', (req, res) => {
  res.send('Nail Salon API is running!');
});

app.listen(4000, () => console.log('API server running on port 4000'));
