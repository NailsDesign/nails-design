#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Environment Variables Generator');
console.log('=====================================\n');

// Generate secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('📝 Frontend Environment Variables (.env.local):');
console.log('NEXT_PUBLIC_API_URL=https://your-backend-domain.com');
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here\n');

console.log('📝 Backend Environment Variables (.env):');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('DATABASE_URL=postgresql://username:password@host:port/database');
console.log('STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here');
console.log('FRONTEND_URL=https://your-frontend-domain.vercel.app');
console.log('NODE_ENV=production');
console.log('PORT=4000\n');

console.log('⚠️  Important Notes:');
console.log('- Replace placeholder values with your actual credentials');
console.log('- Never commit .env files to version control');
console.log('- Use different JWT secrets for development and production');
console.log('- Use test Stripe keys for development, live keys for production');
console.log('- Ensure your database URL is secure and accessible'); 