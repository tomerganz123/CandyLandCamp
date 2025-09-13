// Simple startup script for the Midburn Camp App
const { spawn } = require('child_process');
const path = require('path');

console.log('🔥 Starting Midburn Camp Management App...');
console.log('📁 Project directory:', __dirname);

// Check if .env.local exists
const fs = require('fs');
if (!fs.existsSync('.env.local')) {
    console.log('⚠️  Creating .env.local file...');
    const envContent = `MONGODB_URI=mongodb://localhost:27017/midburn-camp
ADMIN_PASSWORD=midburn2024
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3023`;
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Created .env.local file');
}

console.log('🚀 Starting Next.js development server...');
console.log('🌐 App will be available at: http://localhost:3023');
console.log('🔐 Admin dashboard: http://localhost:3023/admin (password: midburn2024)');
console.log('');

const nextDev = spawn('npx', ['next', 'dev', '--port', '3023'], {
    stdio: 'inherit',
    shell: true
});

nextDev.on('error', (err) => {
    console.error('❌ Error starting server:', err);
});

nextDev.on('close', (code) => {
    console.log(`🛑 Server stopped with code ${code}`);
});
