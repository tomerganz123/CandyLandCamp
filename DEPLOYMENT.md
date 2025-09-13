# 🚀 Deployment Guide - Midburn Camp Management App

This guide provides step-by-step instructions for deploying your camp management app to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB database setup (Atlas recommended for production)
- [ ] Environment variables configured
- [ ] Admin password set (secure password)
- [ ] JWT secret generated (32+ random characters)
- [ ] Domain name ready (optional)
- [ ] Git repository created

## 🌟 Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with zero-config deployment.

### Step 1: Prepare Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Midburn camp management app"

# Push to GitHub (create repo first on GitHub)
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel
1. Visit [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js - no build configuration needed!

### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Your MongoDB connection string |
| `ADMIN_PASSWORD` | `your-secure-password-123!` | Choose a strong password |
| `JWT_SECRET` | `your-random-32-char-secret-key-here` | Generate random string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your app's URL |

### Step 4: Deploy
- Vercel automatically deploys on every push to main branch
- First deployment takes 2-3 minutes
- You'll get a URL like `https://your-app-name.vercel.app`

### Step 5: Custom Domain (Optional)
1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `camp.midburn.org`)
3. Configure DNS as instructed
4. Update `NEXTAUTH_URL` environment variable

## 🔧 MongoDB Atlas Setup

### Create Database
1. Visit [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster (M0 Sandbox)
3. Create database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for Vercel)
5. Get connection string

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## 🔐 Security Configuration

### Generate Secure JWT Secret
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-random.org/api-key-generator
```

### Admin Password Best Practices
- Minimum 12 characters
- Include uppercase, lowercase, numbers, symbols
- Don't use common passwords
- Store securely (password manager recommended)

## 🌐 Alternative Deployment Options

### Railway
1. Connect GitHub repo to Railway
2. Set environment variables in dashboard
3. Automatic deployment with zero config

### Netlify (Static Export)
```bash
# Add to package.json scripts
"export": "next export"

# Build and export
npm run build
npm run export

# Deploy the 'out' folder to Netlify
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings (auto-detected)
3. Set environment variables
4. Deploy

### AWS Amplify
1. Connect repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

## 🔍 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database connection fails
- Check MongoDB URI format
- Verify database user permissions
- Confirm IP whitelist includes 0.0.0.0/0
- Test connection string locally

#### Environment variables not working
- Ensure no spaces around = in .env files
- Restart development server after changes
- Check variable names match exactly
- Verify all required variables are set

#### Build failures
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Test build locally
npm run build
```

### Performance Optimization

#### Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Database Optimization
- Add indexes for frequently queried fields
- Use MongoDB aggregation for complex queries
- Implement pagination for large datasets
- Consider read replicas for high traffic

## 📊 Monitoring & Maintenance

### Health Checks
Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
```

### Logging
- Use Vercel's built-in logging
- Consider external services like LogRocket or Sentry
- Monitor API response times and error rates

### Backup Strategy
- MongoDB Atlas automatic backups (enabled by default)
- Export data regularly using admin dashboard
- Keep environment variables backed up securely

## 🎯 Go-Live Checklist

- [ ] Production database configured
- [ ] All environment variables set
- [ ] Admin password is secure
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (if applicable)
- [ ] Test registration flow end-to-end
- [ ] Test admin dashboard functionality
- [ ] Verify email notifications work (if implemented)
- [ ] Performance testing completed
- [ ] Backup procedures in place
- [ ] Monitoring configured

## 🆘 Emergency Procedures

### App Down
1. Check Vercel status page
2. Verify MongoDB Atlas connectivity
3. Check recent deployments for issues
4. Rollback to previous version if needed

### Data Recovery
1. Access MongoDB Atlas backups
2. Use admin dashboard export feature
3. Contact MongoDB support if needed

### Security Incident
1. Immediately change admin password
2. Rotate JWT secret
3. Check access logs
4. Update environment variables
5. Force re-authentication of all admin users

---

**Need help? Contact the development team or create an issue on GitHub!** 🚀
