# 🎨 Customization Guide - Midburn Camp Management App

This guide helps you customize the app for your specific camp needs.

## 🎯 Quick Customizations

### 1. Camp Information
Edit `src/app/page.tsx` to update:
- Camp name and description
- Event dates
- Location details
- Contact information

```tsx
// Update the hero section
<h1 className="text-4xl md:text-6xl font-bold mb-6">
  Join [Your Camp Name]!
</h1>

<p className="text-xl md:text-2xl mb-8 opacity-90">
  [Your custom description and event details]
</p>
```

### 2. Color Scheme
Edit `tailwind.config.js` to change colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Replace orange with your camp colors
          50: '#your-color-50',
          500: '#your-color-500',
          600: '#your-color-600',
          // ... etc
        },
      },
    },
  },
};
```

### 3. Logo and Branding
- Replace `public/favicon.ico` with your camp logo
- Add logo to header in `src/app/layout.tsx`
- Update meta tags and SEO information

## 📝 Form Customization

### Adding New Form Fields

#### Step 1: Update Database Schema
Edit `src/models/Member.ts`:

```typescript
const MemberSchema = new Schema<IMember>({
  // ... existing fields ...
  
  // Add your new field
  customField: { 
    type: String, 
    required: false, // or true if mandatory
    trim: true 
  },
  
  // For arrays/multiple selections
  customArray: [{ type: String }],
  
  // For numbers
  customNumber: { type: Number, default: 0 },
  
  // For booleans
  customBoolean: { type: Boolean, default: false },
});
```

#### Step 2: Update TypeScript Types
Edit `src/lib/types.ts`:

```typescript
export interface MemberFormData {
  // ... existing fields ...
  customField: string;
  customArray: string[];
  customNumber: number;
  customBoolean: boolean;
}
```

#### Step 3: Update Validation
Edit `src/lib/validations.ts`:

```typescript
export const memberRegistrationSchema = z.object({
  // ... existing validations ...
  
  customField: z.string().min(1, 'Custom field is required').max(100),
  customArray: z.array(z.string()).default([]),
  customNumber: z.number().min(0).max(100),
  customBoolean: z.boolean().default(false),
});
```

#### Step 4: Add to Registration Form
Edit `src/components/RegistrationForm.tsx`:

```tsx
// Add form section
<div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
  <h2 className="text-xl font-semibold text-gray-800 mb-6">Custom Section</h2>
  
  {/* Text Input */}
  <div className="form-field">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Custom Field *
    </label>
    <input
      {...register('customField')}
      type="text"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="Enter value"
    />
    {errors.customField && (
      <p className="mt-1 text-sm text-red-600">{errors.customField.message}</p>
    )}
  </div>
  
  {/* Checkbox Array */}
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Custom Options
    </label>
    <div className="grid grid-cols-2 gap-3">
      {['Option 1', 'Option 2', 'Option 3'].map((option) => (
        <label key={option} className="flex items-center space-x-2">
          <input
            {...register('customArray')}
            type="checkbox"
            value={option}
            className="rounded border-gray-300 text-orange-600"
          />
          <span className="text-sm text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
  
  {/* Number Input */}
  <div className="form-field mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Custom Number
    </label>
    <input
      {...register('customNumber', { valueAsNumber: true })}
      type="number"
      min="0"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
    />
  </div>
  
  {/* Boolean Toggle */}
  <div className="mt-6">
    <label className="flex items-center space-x-3">
      <input
        {...register('customBoolean')}
        type="checkbox"
        className="rounded border-gray-300 text-orange-600"
      />
      <span className="text-sm font-medium text-gray-700">
        Custom Boolean Option
      </span>
    </label>
  </div>
</div>
```

#### Step 5: Update Admin Dashboard
Edit `src/components/AdminDashboard.tsx` to display new fields:

```tsx
// Add to member detail modal
{selectedMember.customField && (
  <div>
    <h4 className="font-medium text-gray-900 mb-2">Custom Field</h4>
    <p className="text-sm text-gray-600">{selectedMember.customField}</p>
  </div>
)}
```

### Modifying Existing Fields

#### Camp Roles
Edit `src/components/RegistrationForm.tsx`:

```tsx
const CAMP_ROLES = [
  'Camp Lead',
  'Kitchen Manager',
  'Your Custom Role',
  'Another Custom Role',
  // Remove or modify existing roles
];
```

Also update the enum in `src/models/Member.ts`.

#### Dietary Restrictions
```tsx
const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Your Custom Diet',
  // Add/remove options as needed
];
```

#### Date Ranges
For event-specific dates, you can add validation:

```typescript
// In validations.ts
arrivalDate: z.string().refine((date) => {
  const arrival = new Date(date);
  const eventStart = new Date('2024-06-15');
  const eventEnd = new Date('2024-06-20');
  return arrival >= eventStart && arrival <= eventEnd;
}, 'Arrival date must be during the event period'),
```

## 🎨 Styling Customization

### Theme Colors
Create your own color palette in `tailwind.config.js`:

```javascript
colors: {
  // Your camp theme
  camp: {
    primary: '#your-primary-color',
    secondary: '#your-secondary-color',
    accent: '#your-accent-color',
  },
  
  // Status colors
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
}
```

### Typography
Add custom fonts:

```javascript
// tailwind.config.js
fontFamily: {
  'camp': ['Your Custom Font', 'sans-serif'],
  'display': ['Your Display Font', 'serif'],
}
```

### Custom Components
Create reusable components in `src/components/`:

```tsx
// src/components/CampCard.tsx
export default function CampCard({ title, children, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-camp-primary/20">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}
```

## 🔧 Advanced Customizations

### Email Notifications
Add email sending functionality:

```bash
npm install nodemailer @types/nodemailer
```

Create `src/lib/email.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  // Your email service configuration
});

export async function sendWelcomeEmail(member: IMember) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: member.email,
    subject: 'Welcome to [Your Camp Name]!',
    html: `
      <h1>Welcome ${member.firstName}!</h1>
      <p>Your registration has been received...</p>
    `,
  });
}
```

### WhatsApp Integration
Add WhatsApp webhook support:

```typescript
// src/lib/whatsapp.ts
export async function sendWhatsAppNotification(message: string) {
  const response = await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}
```

### File Upload Support
Add file upload for documents:

```bash
npm install multer @types/multer
```

### Multi-language Support
Add internationalization:

```bash
npm install next-intl
```

### Payment Integration
Add Stripe for camp fees:

```bash
npm install stripe @stripe/stripe-js
```

## 📊 Analytics and Tracking

### Google Analytics
```bash
npm install @next/third-parties
```

Add to `src/app/layout.tsx`:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
      </body>
    </html>
  );
}
```

### Custom Event Tracking
```typescript
// Track form submissions
gtag('event', 'registration_complete', {
  event_category: 'engagement',
  event_label: 'camp_registration'
});
```

## 🔐 Advanced Security

### reCAPTCHA Integration
```bash
npm install react-google-recaptcha @types/react-google-recaptcha
```

Add to registration form:

```tsx
import ReCAPTCHA from 'react-google-recaptcha';

// In component
const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

<ReCAPTCHA
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
  onChange={setRecaptchaValue}
/>
```

### Rate Limiting
Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimiter = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const limit = 10; // requests per minute
  const windowMs = 60 * 1000; // 1 minute

  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, { count: 0, resetTime: Date.now() + windowMs });
  }

  const record = rateLimiter.get(ip);

  if (Date.now() > record.resetTime) {
    record.count = 0;
    record.resetTime = Date.now() + windowMs;
  }

  if (record.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## 🚀 Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/camp-photo.jpg"
  alt="Camp photo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Database Optimization
Add indexes to frequently queried fields:

```typescript
// In Member model
MemberSchema.index({ email: 1 });
MemberSchema.index({ campRole: 1 });
MemberSchema.index({ isApproved: 1 });
MemberSchema.index({ createdAt: -1 });
```

### Caching
Implement Redis caching:

```bash
npm install redis
```

```typescript
// src/lib/cache.ts
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

export async function getCachedStats() {
  const cached = await client.get('member-stats');
  if (cached) return JSON.parse(cached);
  
  // Generate stats and cache for 5 minutes
  const stats = await generateStats();
  await client.setEx('member-stats', 300, JSON.stringify(stats));
  return stats;
}
```

## 📱 Mobile App Integration

### Progressive Web App (PWA)
```bash
npm install next-pwa
```

Add to `next.config.ts`:

```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // your next config
});
```

### Push Notifications
Implement web push notifications for admin alerts:

```typescript
// Service worker for push notifications
self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('New Registration', options)
  );
});
```

---

**Need help with customization? Check the main README or create an issue on GitHub!** 🎨
