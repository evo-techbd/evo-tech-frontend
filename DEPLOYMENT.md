# Evo-Tech Frontend Deployment Guide

## Vercel Deployment

### Prerequisites
- GitHub repository: `https://github.com/evo-techbd/evo-tech-frontend.git`
- Vercel account connected to your GitHub

### Environment Variables Required

Before deploying, configure these environment variables in your Vercel project settings:

#### Required Variables:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1

# Frontend URL (Vercel will auto-populate this, or set your custom domain)
NEXT_PUBLIC_FEND_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
AUTH_SECRET=your-super-secret-key-minimum-32-characters-long
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Node Environment
NODE_ENV=production
```

### Steps to Deploy:

1. **Import the repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository: `evo-techbd/evo-tech-frontend`

2. **Configure Build Settings:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as default)
   - Build Command: `node vercel-build.js` (already configured in vercel.json)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (already configured)

3. **Add Environment Variables:**
   - In Vercel project settings, go to "Settings" → "Environment Variables"
   - Add all the required variables listed above
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Troubleshooting:

#### Build Errors:
If you get build errors, check:
- All environment variables are set correctly
- `NEXT_PUBLIC_BACKEND_URL` points to a valid backend API
- `NEXTAUTH_SECRET` is at least 32 characters long

#### Generate NextAuth Secret:
```bash
# Generate a secure secret
openssl rand -base64 32
```

Or use this online: https://generate-secret.vercel.app/32

### Hostinger Deployment (Alternative)

If you prefer to deploy to Hostinger:

```bash
npm run build:hostinger
npm run pm2:start
```

Make sure to configure your `.env.production` file with the correct values before deployment.

## Post-Deployment

After successful deployment:
1. Test all features on the deployed URL
2. Verify API connectivity with the backend
3. Test authentication flows
4. Check that all environment-specific features work correctly

## Support

For issues or questions:
- Check Vercel deployment logs
- Review environment variable configuration
- Ensure backend API is accessible from Vercel
