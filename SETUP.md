# 🚀 Quick Setup Guide - Midburn Camp Management App

Get your camp management app running in minutes!

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env.local` file:
```env
# MongoDB (use your own connection string)
MONGODB_URI=mongodb://localhost:27017/midburn-camp

# Admin access (change this password!)
ADMIN_PASSWORD=midburn2024

# Security key (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# App URL
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start the App
```bash
npm run dev
```

Visit:
- **Public Registration**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## 🗄️ Database Setup Options

### Option A: Local MongoDB
1. Install MongoDB locally
2. Use: `MONGODB_URI=mongodb://localhost:27017/midburn-camp`

### Option B: MongoDB Atlas (Recommended)
1. Create free account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create cluster → Get connection string
3. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname`

### Option C: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
```

## 🔐 Admin Access

**Default Admin Password**: `midburn2024`

⚠️ **IMPORTANT**: Change this password before deployment!

To access admin dashboard:
1. Go to http://localhost:3000/admin
2. Enter admin password
3. Manage registrations, export data, view stats

## 🌟 Key Features Working

✅ **Public Registration Form**
- Mobile responsive design
- Form validation
- Real-time error handling
- Comprehensive member data collection

✅ **Admin Dashboard** 
- Secure login
- Member management (approve/edit/delete)
- Search and filtering
- CSV/JSON export
- Real-time statistics

✅ **Database Integration**
- MongoDB with Mongoose
- Automatic data validation
- Scalable schema design

## 🚀 Deploy to Production

### Vercel (Recommended - 2 minutes)
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically!

See `DEPLOYMENT.md` for detailed instructions.

## 🛠️ Customization

Want to customize for your camp?

- **Change camp name**: Edit `src/app/page.tsx`
- **Add form fields**: See `CUSTOMIZATION.md`
- **Modify colors**: Edit `tailwind.config.js`
- **Update roles**: Edit `src/components/RegistrationForm.tsx`

## ❓ Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
- Check MongoDB URI format
- Verify database is running
- Test connection locally first

### Environment Variables Not Working
- Restart dev server after changes
- Check for typos in variable names
- Ensure no spaces around = signs

## 📞 Need Help?

1. Check the detailed `README.md`
2. Review `DEPLOYMENT.md` for production setup
3. See `CUSTOMIZATION.md` for modifications
4. Create GitHub issue for bugs

## 🎯 What's Included

This is a complete, production-ready application with:

- ✅ Modern Next.js 15 with TypeScript
- ✅ Tailwind CSS for beautiful UI
- ✅ MongoDB integration
- ✅ Form validation with Zod
- ✅ Admin authentication
- ✅ Data export functionality
- ✅ Mobile responsive design
- ✅ Deployment ready for Vercel/Netlify
- ✅ Comprehensive documentation

**Ready to manage your Midburn camp? Let's burn! 🔥**

---

*Built with ❤️ for the Midburn community*
