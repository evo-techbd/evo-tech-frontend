# Vercel Deployment Quick Start

## 🚨 Fix Build Error

The build error you're seeing is because **environment variables are missing**.

### Required Steps:

#### 1. Add Environment Variables to Vercel

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these **REQUIRED** variables:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.evo-techbd.com/api/v1
NEXTAUTH_SECRET=<generate-32-char-secret>
AUTH_SECRET=<generate-32-char-secret>
NEXTAUTH_URL=https://evo-techbd.com
NODE_ENV=production
```

#### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

Copy the output and use it for both `NEXTAUTH_SECRET` and `AUTH_SECRET`.

#### 3. Redeploy

After adding all environment variables:
- Go to **Deployments** tab
- Click the three dots (...) on the latest deployment
- Click **Redeploy**

---

## 🌐 Add Custom Domain

### Quick Steps:

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Domains**
   - Click "Add Domain"
   - Enter: `evo-techbd.com`
   - Click "Add"

2. **Configure DNS (in your domain registrar):**

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

3. **Update Environment Variables:**
   
   After adding the domain, update these in Vercel:
   
   ```env
   NEXT_PUBLIC_FEND_URL=https://evo-techbd.com
   NEXT_PUBLIC_SITE_URL=https://evo-techbd.com
   NEXTAUTH_URL=https://evo-techbd.com
   ```

4. **Wait for DNS Propagation:**
   - Usually takes 5-60 minutes
   - Check status: https://dnschecker.org
   - Vercel will auto-issue SSL certificate

---

## ✅ Verify Setup

### Check these after deployment:

- [ ] Environment variables are all set in Vercel
- [ ] Build completes successfully
- [ ] Site loads at your Vercel URL
- [ ] Custom domain DNS is configured
- [ ] SSL certificate is active (🔒 in browser)
- [ ] Backend API is reachable
- [ ] Authentication works

---

## 🔧 Troubleshooting

### Build Fails with "Command exited with 1"
- **Cause:** Missing environment variables
- **Fix:** Add all required env vars in Vercel Settings → Environment Variables

### Domain Not Working
- **Cause:** DNS not propagated or configured incorrectly
- **Fix:** 
  - Check DNS records match Vercel's requirements
  - Wait 24-48 hours for full propagation
  - Use https://dnschecker.org to verify

### SSL Certificate Not Issued
- **Cause:** DNS not verified yet
- **Fix:** Wait for DNS propagation, Vercel auto-issues after verification

### API Connection Fails
- **Cause:** `NEXT_PUBLIC_BACKEND_URL` incorrect or backend not accessible
- **Fix:** Verify backend URL is correct and publicly accessible

---

## 📝 Current Configuration

- **Framework:** Next.js (auto-detected by Vercel)
- **Build Command:** `next build` (automatic)
- **Region:** Optimal (Vercel auto-selects)
- **Node Version:** 22.x (from package.json or Vercel default)

---

## 🔗 Helpful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs - Custom Domains: https://vercel.com/docs/concepts/projects/domains
- Vercel Docs - Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- DNS Checker: https://dnschecker.org
- SSL Check: https://www.ssllabs.com/ssltest/

---

## 💡 Tips

1. **Always redeploy after changing environment variables**
2. **Test on Vercel preview URL first** before configuring custom domain
3. **Use production branch** (main) for custom domain
4. **Environment variables are case-sensitive**
5. **Backend must be publicly accessible** (not localhost)
