// backend/routes/stripe.js (or similar)
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // use env variable

router.post('/create-setup-intent', async (req, res) => {
  // You should use your real customer ID here, or create a new customer if needed
  const { customerId } = req.body;
  const setupIntent = await stripe.setupIntents.create({ customer: customerId });
  res.json({ clientSecret: setupIntent.client_secret });
});

export default router;