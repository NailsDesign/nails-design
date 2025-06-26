import 'dotenv/config';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Set up your SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.example.com", // Replace with your SMTP
  port: 587,
  secure: false,
  auth: { user: "your_email", pass: "your_password" }
});

// 1. Find all customers whose birthday is today
async function getTodaysBirthdays() {
  const result = await pool.query(`
    SELECT name, email
    FROM customers
    WHERE EXTRACT(MONTH FROM dob) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(DAY FROM dob) = EXTRACT(DAY FROM CURRENT_DATE)
  `);
  return result.rows;
}

// 2. Send them a birthday email
async function sendBirthdayEmail(customer) {
  await transporter.sendMail({
    from: '"Nails Design" <noreply@nailsdesign.co.uk>',
    to: customer.email,
    subject: "Happy Birthday! Enjoy a special treat at Nails Design 🎉",
    html: `
      <p>Hi <b>${customer.name}</b>,</p>
      <p>
        <span style="font-size:1.2em;">🎉 Happy Birthday from all of us at <b>Nails Design</b>!</span>
      </p>
      <p>
        As a special gift, we’d love to treat you to an exclusive <b>birthday discount</b>—just for you!
      </p>
      <ul>
        <li>
          <b>Come in on your birthday</b> and spend £30 or more on any service, and we’ll take extra off your bill!
        </li>
        <li>
          Simply mention this email when you visit. Valid only on your birthday.
        </li>
      </ul>
      <p>
        We hope you have a fabulous day and look forward to seeing you soon!<br />
        <b>With love,</b><br />
        The Nails Design Team 💅
      </p>
    `
  });
  console.log(`Birthday email sent to ${customer.email}`);
}

async function main() {
  const birthdays = await getTodaysBirthdays();
  if (!birthdays.length) {
    console.log("No birthdays today!");
    process.exit(0);
  }
  for (const customer of birthdays) {
    await sendBirthdayEmail(customer);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
