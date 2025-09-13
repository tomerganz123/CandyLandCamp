# 🔥 Midburn Camp Member Management App

A modern, full-stack web application for managing camp member registration and logistics for Midburn (Israel's Burning Man festival). Built with Next.js, TypeScript, MongoDB, and Tailwind CSS.

## ✨ Features

### 🔐 Public Registration Form
- ✅ Responsive, mobile-friendly design
- ✅ Comprehensive form validation with Zod
- ✅ Real-time form validation and error handling
- ✅ Support for dietary restrictions, medical conditions, and special skills
- ✅ Emergency contact information collection
- ✅ Arrival/departure date management
- ✅ Transportation coordination features

### 📊 Admin Dashboard
- ✅ Secure password-based authentication
- ✅ Complete member management (view, edit, approve, delete)
- ✅ Advanced search and filtering capabilities
- ✅ Real-time statistics and analytics
- ✅ CSV and JSON data export functionality
- ✅ Responsive table with pagination
- ✅ Member approval workflow

### 📁 Backend & Database
- ✅ MongoDB integration with Mongoose ODM
- ✅ RESTful API with comprehensive error handling
- ✅ JWT-based admin authentication
- ✅ Input validation and sanitization
- ✅ Scalable database schema design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd camp-management
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection - Replace with your actual MongoDB URI
MONGODB_URI=mongodb://localhost:27017/midburn-camp
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/midburn-camp

# Admin Authentication - Change this password!
ADMIN_PASSWORD=your-secure-admin-password

# JWT Secret - Generate a random string for production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js URL
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

Visit:
- **Public Form**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and configure build settings

3. **Set Environment Variables**:
   In your Vercel dashboard, go to Settings → Environment Variables and add:
   
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `MONGODB_URI` | Your MongoDB connection string | All |
   | `ADMIN_PASSWORD` | Your secure admin password | All |
   | `JWT_SECRET` | A random 32+ character string | All |
   | `NEXTAUTH_URL` | Your production URL | Production |

4. **Deploy**: Vercel will automatically deploy on every push to main branch.

### Custom Domain Setup

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain (e.g., `campname.midburn.org`)
3. Configure DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` environment variable to your custom domain

### Alternative Deployment Options

<details>
<summary>Deploy to Netlify</summary>

1. Build the static export:
   ```bash
   npm run build
   npm run export
   ```

2. Deploy the `out/` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set up redirects for API routes (requires Netlify Functions)
</details>

<details>
<summary>Deploy to Railway</summary>

1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy with zero configuration
</details>

## 🛠️ Customization Guide

### Adding New Form Fields

1. **Update the Mongoose Schema** (`src/models/Member.ts`):
   ```typescript
   // Add new field to the schema
   newField: { type: String, required: false, trim: true },
   ```

2. **Update Validation Schema** (`src/lib/validations.ts`):
   ```typescript
   // Add validation for new field
   newField: z.string().optional(),
   ```

3. **Update Form Component** (`src/components/RegistrationForm.tsx`):
   ```tsx
   // Add form input
   <input {...register('newField')} type="text" />
   ```

4. **Update TypeScript Types** (`src/lib/types.ts`):
   ```typescript
   // Add to MemberFormData interface
   newField?: string;
   ```

### Modifying Camp Roles

Edit the `CAMP_ROLES` array in `src/components/RegistrationForm.tsx`:

```typescript
const CAMP_ROLES = [
  'Your Custom Role',
  'Another Role',
  // ... existing roles
];
```

Also update the enum in `src/models/Member.ts` to match.

### Changing Admin Password

1. **Development**: Update `.env.local`
2. **Production**: Update environment variable in your hosting platform
3. **Enhanced Security**: Consider implementing bcrypt hashing in `src/lib/auth.ts`

### Styling Customization

The app uses Tailwind CSS. Key customization points:

- **Colors**: Edit `tailwind.config.js` to change the color scheme
- **Components**: Modify component styles in their respective files
- **Global Styles**: Update `src/app/globals.css`

## 📋 API Documentation

### Public Endpoints

#### POST `/api/members`
Register a new camp member.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+972-50-123-4567",
  "campRole": "General Member",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+972-50-765-4321",
    "relationship": "Spouse"
  },
  "dietaryRestrictions": ["Vegetarian"],
  "arrivalDate": "2024-06-15",
  "departureDate": "2024-06-20",
  "needsTransport": false,
  "hasVehicle": true
}
```

### Admin Endpoints (Require Authorization Header)

#### POST `/api/auth/login`
Authenticate admin user.

#### GET `/api/members`
Get paginated list of members with filtering options.

#### GET `/api/members/[id]`
Get specific member details.

#### PUT `/api/members/[id]`
Update member information.

#### DELETE `/api/members/[id]`
Delete a member.

#### GET `/api/admin/stats`
Get dashboard statistics.

#### GET `/api/admin/export`
Export members data (CSV or JSON).

## 🔒 Security Features

- ✅ Input validation and sanitization
- ✅ JWT-based authentication for admin
- ✅ CORS protection
- ✅ Rate limiting ready (can be added via middleware)
- ✅ Environment variable protection
- ✅ SQL injection prevention (NoSQL)

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 📱 Mobile Responsiveness

The app is fully responsive and optimized for:
- ✅ Mobile phones (320px+)
- ✅ Tablets (768px+)  
- ✅ Desktop (1024px+)
- ✅ Large screens (1440px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:

- **Technical Issues**: Create a GitHub issue
- **Camp Questions**: Contact camp organizers
- **General Support**: camp@midburn.org

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for the amazing Midburn community
- Inspired by the principles of Burning Man
- Made with ❤️ for burners, by burners

---

**Ready to burn? Let's make this happen! 🔥**
