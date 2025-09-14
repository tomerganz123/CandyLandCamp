// Test MongoDB connection locally
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://tomerganz_db_user:RhEqhWorpJ6zCAAx@cluster0.dxihaof.mongodb.net/midburn-camp?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // 10 second timeout
})
.then(() => {
  console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
  console.log('Database name:', mongoose.connection.name);
  console.log('Connection state:', mongoose.connection.readyState);
  process.exit(0);
})
.catch((error) => {
  console.log('❌ ERROR: Failed to connect to MongoDB');
  console.log('Error details:', error.message);
  
  if (error.message.includes('Authentication failed')) {
    console.log('🔑 Check your username/password in the connection string');
  }
  if (error.message.includes('not allowed')) {
    console.log('🌐 Check your IP whitelist in MongoDB Atlas Network Access');
  }
  if (error.message.includes('timeout')) {
    console.log('⏰ Connection timeout - check if cluster is paused');
  }
  
  process.exit(1);
});
