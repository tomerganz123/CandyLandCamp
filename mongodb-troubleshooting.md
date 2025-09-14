# MongoDB Atlas Troubleshooting Guide

## 1. Check Cluster Status
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Look at your cluster dashboard
4. If you see "Paused" or a sleeping icon, click "Resume" to wake it up
5. Free tier clusters (M0) pause after 60 days of inactivity

## 2. Verify IP Whitelist / Network Access
1. In MongoDB Atlas, go to "Security" → "Network Access"
2. Make sure you have these entries:
   - `0.0.0.0/0` (allows access from anywhere - needed for Vercel)
   - OR your specific IP addresses
3. If missing, click "Add IP Address" → "Allow Access from Anywhere" → "0.0.0.0/0"

## 3. Check Database User Permissions
1. Go to "Security" → "Database Access"
2. Find user: `tomerganz_db_user`
3. Make sure it has:
   - Password authentication
   - "Read and write to any database" OR specific database permissions
   - Status: Active (not disabled)

## 4. Test Connection String
Your connection string should be:
```
mongodb+srv://tomerganz_db_user:RhEqhWorpJ6zCAAx@cluster0.dxihaof.mongodb.net/midburn-camp?retryWrites=true&w=majority&appName=Cluster0
```

## 5. Quick Connection Test
You can test the connection using MongoDB Compass or the Atlas web interface:
1. In Atlas, click "Connect" on your cluster
2. Choose "Connect with MongoDB Compass"
3. Copy the connection string and test it

## 6. Check Vercel Function Logs
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Functions" tab
4. Click on the API function that's failing
5. Check the logs for specific error messages
