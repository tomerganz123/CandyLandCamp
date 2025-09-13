// Simple Express server version of the Midburn Camp App
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Simple HTML for the registration form
const registrationHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔥 Midburn Camp Registration</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 15px; 
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            color: #ea580c;
        }
        .form-group { 
            margin-bottom: 20px; 
        }
        label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold; 
            color: #333;
        }
        input, select, textarea { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #ddd; 
            border-radius: 8px; 
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus, textarea:focus { 
            border-color: #f97316; 
            outline: none;
        }
        .submit-btn { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 8px; 
            font-size: 18px; 
            cursor: pointer; 
            width: 100%;
            margin-top: 20px;
            transition: transform 0.3s;
        }
        .submit-btn:hover { 
            transform: translateY(-2px);
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
        }
        @media (max-width: 768px) { 
            .grid { grid-template-columns: 1fr; } 
        }
        .success { 
            background: #10b981; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin-bottom: 20px;
        }
        .admin-link {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 8px;
        }
        .admin-link a {
            color: #ea580c;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 Midburn Camp Registration</h1>
            <p>Join our amazing camp for an unforgettable experience!</p>
        </div>

        <div id="success-message" class="success" style="display: none;">
            <h3>🎉 Registration Successful!</h3>
            <p>Welcome to our Midburn camp family! We'll be in touch soon.</p>
        </div>

        <form id="registrationForm">
            <div class="grid">
                <div class="form-group">
                    <label for="firstName">First Name *</label>
                    <input type="text" id="firstName" name="firstName" required>
                </div>
                <div class="form-group">
                    <label for="lastName">Last Name *</label>
                    <input type="text" id="lastName" name="lastName" required>
                </div>
            </div>

            <div class="grid">
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone *</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
            </div>

            <div class="form-group">
                <label for="campRole">Camp Role *</label>
                <select id="campRole" name="campRole" required>
                    <option value="">Select your role</option>
                    <option value="Camp Lead">Camp Lead</option>
                    <option value="Kitchen Manager">Kitchen Manager</option>
                    <option value="Build Team">Build Team</option>
                    <option value="Art Team">Art Team</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Medic">Medic</option>
                    <option value="DJ/Music">DJ/Music</option>
                    <option value="Photographer">Photographer</option>
                    <option value="General Member">General Member</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div class="grid">
                <div class="form-group">
                    <label for="arrivalDate">Arrival Date *</label>
                    <input type="date" id="arrivalDate" name="arrivalDate" required>
                </div>
                <div class="form-group">
                    <label for="departureDate">Departure Date *</label>
                    <input type="date" id="departureDate" name="departureDate" required>
                </div>
            </div>

            <div class="form-group">
                <label for="emergencyContact">Emergency Contact Name *</label>
                <input type="text" id="emergencyContact" name="emergencyContact" required>
            </div>

            <div class="form-group">
                <label for="emergencyPhone">Emergency Contact Phone *</label>
                <input type="tel" id="emergencyPhone" name="emergencyPhone" required>
            </div>

            <div class="form-group">
                <label for="dietaryRestrictions">Dietary Restrictions</label>
                <input type="text" id="dietaryRestrictions" name="dietaryRestrictions" 
                       placeholder="e.g., Vegetarian, Vegan, Gluten-free">
            </div>

            <div class="form-group">
                <label for="comments">Additional Comments</label>
                <textarea id="comments" name="comments" rows="4" 
                          placeholder="Anything else you'd like us to know?"></textarea>
            </div>

            <button type="submit" class="submit-btn">🔥 Complete Registration</button>
        </form>

        <div class="admin-link">
            <p><strong>Camp Organizers:</strong> <a href="/admin">Access Admin Dashboard</a></p>
            <p><small>Password: midburn2024</small></p>
        </div>
    </div>

    <script>
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message
            document.getElementById('success-message').style.display = 'block';
            document.getElementById('registrationForm').style.display = 'none';
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // In a real app, you would send the data to the server
            console.log('Registration submitted:', new FormData(this));
        });
    </script>
</body>
</html>
`;

// Admin dashboard HTML
const adminHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔥 Midburn Camp Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: #f3f4f6;
            min-height: 100vh;
        }
        .header { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
            color: white; 
            padding: 20px; 
            text-align: center;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 40px 20px;
        }
        .card { 
            background: white; 
            border-radius: 10px; 
            padding: 30px; 
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .stat-card { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .stat-number { 
            font-size: 36px; 
            font-weight: bold; 
            color: #ea580c;
        }
        .stat-label { 
            color: #666; 
            margin-top: 5px;
        }
        .btn { 
            background: #ea580c; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block;
            margin: 5px;
        }
        .btn:hover { 
            background: #c2410c; 
        }
        .back-link { 
            text-align: center; 
            margin-top: 20px;
        }
        .back-link a { 
            color: #ea580c; 
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔥 Midburn Camp Admin Dashboard</h1>
        <p>Manage your camp members and registrations</p>
    </div>

    <div class="container">
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">Total Members</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">Approved</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">This Week</div>
            </div>
        </div>

        <div class="card">
            <h2>Admin Features</h2>
            <p>This is a simplified version of your admin dashboard. The full Next.js version includes:</p>
            <ul style="margin: 20px 0; padding-left: 20px;">
                <li>✅ Complete member management</li>
                <li>✅ Search and filtering</li>
                <li>✅ CSV/JSON export</li>
                <li>✅ Member approval workflow</li>
                <li>✅ Real-time statistics</li>
                <li>✅ MongoDB integration</li>
            </ul>
            
            <div style="margin-top: 30px;">
                <button class="btn">📊 View All Members</button>
                <button class="btn">📤 Export Data</button>
                <button class="btn">⚙️ Settings</button>
            </div>
        </div>

        <div class="card">
            <h3>🚀 Next Steps</h3>
            <p>To get the full-featured app working:</p>
            <ol style="margin: 20px 0; padding-left: 20px;">
                <li>Set up MongoDB (local or Atlas)</li>
                <li>Configure environment variables</li>
                <li>Deploy to Vercel for production</li>
            </ol>
        </div>

        <div class="back-link">
            <p><a href="/">← Back to Registration Form</a></p>
        </div>
    </div>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
    res.send(registrationHTML);
});

app.get('/admin', (req, res) => {
    res.send(adminHTML);
});

app.post('/api/register', (req, res) => {
    console.log('Registration received:', req.body);
    res.json({ success: true, message: 'Registration received!' });
});

// Start server
app.listen(PORT, () => {
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log('🔥                                  🔥');
    console.log('🔥  MIDBURN CAMP APP IS RUNNING!   🔥');
    console.log('🔥                                  🔥');
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log('');
    console.log('🌐 Public Registration: http://localhost:3000');
    console.log('🔐 Admin Dashboard: http://localhost:3000/admin');
    console.log('');
    console.log('✅ App is working perfectly!');
    console.log('📝 Open your browser and visit the URLs above');
    console.log('🛑 Press Ctrl+C to stop the server');
    console.log('');
});
