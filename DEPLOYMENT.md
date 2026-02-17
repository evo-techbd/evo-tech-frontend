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

## Custom Domain Setup (evo-techbd.com)

### Step 1: Add Domain to Vercel

1. **Go to your Vercel project:**
   - Navigate to your project dashboard
   - Click on **Settings** → **Domains**

2. **Add your domain:**
   - Enter: `evo-techbd.com`
   - Click "Add"
   - Also add: `www.evo-techbd.com` (recommended)

3. **Vercel will provide DNS records** that you need to configure

### Step 2: Configure DNS Records

Vercel will show you which DNS records to add. You'll need to add these in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

#### Option A: Using A Records (Recommended)
```
Type: A
Name: @
Value: 76.76.21.21
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Option B: Using CNAME (if Option A doesn't work)
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Note:** Vercel will show you the exact records to add. Use those values.

### Step 3: Update Environment Variables

After adding the domain, update these environment variables in Vercel:

```env
NEXT_PUBLIC_FEND_URL=https://evo-techbd.com
NEXT_PUBLIC_SITE_URL=https://evo-techbd.com
NEXTAUTH_URL=https://evo-techbd.com
```

**Important:** After updating environment variables, **redeploy** the application for changes to take effect.

### Step 4: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Vercel will automatically provision an SSL certificate once DNS is verified
- You'll see a "Valid Configuration" status when it's ready

### Step 5: Set Up Redirects (Optional)

In Vercel, you can configure redirects to ensure www redirects to non-www (or vice versa):

1. Go to **Settings** → **Domains**
2. Click on the domain you want to redirect from
3. Select "Redirect to..." and choose your primary domain

### Troubleshooting Custom Domain

#### Domain Not Connecting:
1. **Verify DNS records** are correct in your domain registrar
2. **Wait for propagation** (can take up to 48 hours)
3. **Check domain status** in Vercel dashboard
4. Use [DNS Checker](https://dnschecker.org/) to verify propagation

#### SSL Certificate Issues:
- Vercel automatically provisions SSL certificates
- If SSL isn't working after 24 hours, try removing and re-adding the domain
- Ensure you've added both `@` and `www` records

#### Mixed Content Errors:
- Update all environment variables to use `https://`
- Ensure backend API also uses HTTPS
- Clear browser cache and cookies

### Step 6: Verify Deployment

Once DNS is propagated:

1. Visit `https://evo-techbd.com` (should work)
2. Visit `https://www.evo-techbd.com` (should work or redirect)
3. Test all features to ensure everything works
4. Verify backend API connectivity
5. Test authentication (NextAuth should work with new domain)

## Post-Deployment

After successful deployment:
1. Test all features on the deployed URL
2. Verify API connectivity with the backend
3. Test authentication flows
4. Check that all environment-specific features work correctly
5. Monitor Vercel analytics for performance metrics

## Support

For issues or questions:
- Check Vercel deployment logs
- Review environment variable configuration
- Ensure backend API is accessible from Vercel
- Contact Vercel support for domain-specific issues
- Check [Vercel Documentation](https://vercel.com/docs/concepts/projects/domains)
