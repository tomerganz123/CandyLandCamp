// Simple test server to verify everything works
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Midburn Camp App - Test</title></head>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h1>🔥 Midburn Camp Management App</h1>
        <h2>✅ Server is Working!</h2>
        <p>Your environment is set up correctly.</p>
        <p>Now let's get the full Next.js app running...</p>
        <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Next Steps:</h3>
          <p>1. Stop this test server (Ctrl+C)</p>
          <p>2. Run: npm run dev</p>
          <p>3. Visit: http://localhost:3000</p>
        </div>
      </body>
    </html>
  `);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🔥 Test server running at http://localhost:${PORT}`);
  console.log('✅ Your environment is working correctly!');
  console.log('📝 Open http://localhost:3000 in your browser to see this page');
  console.log('🛑 Press Ctrl+C to stop this test server');
});
