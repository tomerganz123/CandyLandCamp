# 🏠 Local Development Setup - BABA ZMAN

This branch is configured for local desktop development on port **3030**.

## 🚀 Quick Start

### 1. **Environment Setup**
```bash
# Copy the environment example
copy env-local-example.txt .env.local
# Edit .env.local with your local settings
```

### 2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

### 3. **Start Development Server**
```bash
# Standard development (port 3030)
npm run dev

# Turbo mode (faster, experimental)
npm run dev:turbo

# Local network access (accessible from other devices)
npm run local
```

### 4. **Access the Application**
- **Registration Form**: http://localhost:3030/
- **Public Website**: http://localhost:3030/home
- **Admin Dashboard**: http://localhost:3030/admin
- **Reports**: http://localhost:3030/admin/reports

## 🛠️ Development Scripts

| Command | Description | Port |
|---------|-------------|------|
| `npm run dev` | Standard development server | 3030 |
| `npm run dev:turbo` | Turbo mode (faster builds) | 3030 |
| `npm run local` | Network accessible server | 3030 |
| `npm run build` | Production build | - |
| `npm run start` | Production server | 3030 |

## 🗄️ Database Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# Start MongoDB service
net start MongoDB

# Set in .env.local:
MONGODB_URI=mongodb://localhost:27017/baba-zman-local
```

### Option 2: MongoDB Atlas (Cloud)
```bash
# Create free cluster at https://cloud.mongodb.com
# Get connection string and set in .env.local:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baba-zman?retryWrites=true&w=majority
```

## 🔧 Local Development Features

### Enhanced Development Experience
- **Hot Reload**: Instant updates on file changes
- **Error Overlay**: Detailed error information in browser
- **Source Maps**: Easy debugging with original source code
- **Network Access**: Access from mobile devices on same network

### Available Routes
```
Public Routes:
├── / (Registration Form)
├── /home (Public Homepage)
├── /event (Event Information)
├── /camp (Camp Details)
├── /gift (Gift Descriptions)
└── /contact (Contact Form)

Admin Routes:
├── /admin (Dashboard)
├── /admin/reports (Analytics)
└── /api/admin/* (Admin APIs)

Public APIs:
├── /api/public-stats (Community Stats)
├── /api/contact (Contact Form)
└── /api/members (Registration)
```

## 🎨 Development Tools

### Browser Extensions (Recommended)
- **React Developer Tools**: Debug React components
- **Redux DevTools**: If you add state management later
- **Axe DevTools**: Accessibility testing

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3030
netstat -ano | findstr :3030
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
net start MongoDB
# or check MongoDB Atlas connection string
```

### Node.js Version Issues
```bash
# Check Node.js version (should be 18+ for best performance)
node --version
# Update if needed from https://nodejs.org/
```

### Clear Cache Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📱 Mobile Testing

Access from mobile devices on same network:
```bash
# Start with network access
npm run local

# Access from mobile browser:
http://YOUR_LOCAL_IP:3030
```

## 🔄 Branch Management

```bash
# Switch back to main development
git checkout new-website

# Switch to production branch
git checkout master

# Switch back to local development
git checkout local-desktop
```

## 📝 Development Notes

- **Port 3030**: Configured to avoid conflicts with other local services
- **Hot Reload**: Enabled for all file types
- **TypeScript**: Full type checking in development
- **Linting**: ESLint configured for code quality
- **Formatting**: Prettier recommended for code formatting

## 🚀 Ready to Code!

Your local development environment is now configured and ready. Happy coding! 🎉

For questions or issues, check the main README.md or create an issue in the repository.
