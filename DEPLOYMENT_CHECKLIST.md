# Deployment Checklist

## Pre-Deployment Tasks

### ✅ Code Cleanup
- [x] Remove hardcoded localhost URLs
- [x] Centralize API configuration
- [x] Update environment variable handling
- [x] Remove hardcoded JWT secrets
- [x] Configure CORS for production

### ✅ Frontend (Next.js)
- [x] Create API configuration file (`frontend/config/api.js`)
- [x] Update all API calls to use centralized config
- [x] Create Vercel configuration (`frontend/vercel.json`)
- [x] Ensure all dependencies are in `package.json`
- [x] Test build locally: `npm run build`

### ✅ Backend (Express.js)
- [x] Update port configuration to use environment variables
- [x] Remove hardcoded JWT secret
- [x] Configure CORS for production domains
- [x] Ensure all dependencies are in `package.json`
- [x] Test server startup locally

### ✅ Environment Variables
- [ ] Create `.env.example` files (blocked by gitignore)
- [ ] Document all required environment variables
- [ ] Generate secure JWT secret
- [ ] Set up Stripe keys
- [ ] Configure database connection string

## Deployment Steps

### Frontend (Vercel)
1. [ ] Push code to GitHub repository
2. [ ] Connect repository to Vercel
3. [ ] Set root directory to `frontend`
4. [ ] Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. [ ] Deploy and test

### Backend (Railway/Render/Heroku)
1. [ ] Choose hosting platform
2. [ ] Connect GitHub repository
3. [ ] Set root directory to `backend`
4. [ ] Configure environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
   - `PORT`
5. [ ] Deploy and test

### Database
1. [ ] Set up PostgreSQL database (local or cloud)
2. [ ] Run database migrations/schema
3. [ ] Test database connection
4. [ ] Backup existing data if migrating

## Post-Deployment Testing

### Frontend
- [ ] Test user registration
- [ ] Test user login
- [ ] Test booking system
- [ ] Test admin dashboard
- [ ] Test responsive design
- [ ] Test payment integration

### Backend
- [ ] Test API endpoints
- [ ] Test database connections
- [ ] Test email functionality
- [ ] Test Stripe integration
- [ ] Test CORS configuration

### Integration
- [ ] Test frontend-backend communication
- [ ] Test payment flow end-to-end
- [ ] Test booking flow end-to-end
- [ ] Test admin functionality

## Security Checklist

- [ ] All environment variables are set
- [ ] JWT secret is secure and unique
- [ ] CORS is properly configured
- [ ] HTTPS is enabled
- [ ] No sensitive data in code
- [ ] Database credentials are secure
- [ ] Stripe keys are correct (test/live)

## Performance Checklist

- [ ] Images are optimized
- [ ] Bundle size is reasonable
- [ ] Database queries are efficient
- [ ] API responses are cached where appropriate
- [ ] CDN is configured (if applicable)

## Monitoring

- [ ] Set up error logging
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alerts for critical issues

## Documentation

- [ ] Update README with deployment instructions
- [ ] Document environment variables
- [ ] Document API endpoints
- [ ] Create troubleshooting guide 