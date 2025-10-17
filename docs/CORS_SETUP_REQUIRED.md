# 🚨 CORS Setup Required - Backend Configuration

## ⚠️ Critical Issue

The backend currently **does NOT have CORS configured**, which will block all requests from the frontend running on `http://localhost:5173`.

**Status:** 🔴 **BLOCKER** - Must be fixed before testing

---

## What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a security feature in browsers that blocks requests from one domain (origin) to another unless explicitly allowed by the server.

### The Problem

- **Frontend:** http://localhost:**5173** (Vite dev server)
- **Backend:** http://localhost:**8080** (Express API)

These are **different origins** (different ports), so the browser will block requests by default.

### What You'll See

When the frontend tries to call the backend, you'll see this error in the browser console:

```
Access to fetch at 'http://localhost:8080/api/v1/auth/login'
from origin 'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🔧 Solution for Backend Team

### Step 1: Install CORS Package

```bash
cd backend
npm install cors
```

### Step 2: Configure CORS in Backend

**File:** `backend/src/app.js`

**Add this code:**

```javascript
// At the top with other requires
const express = require('express');
const cors = require('cors');  // ← ADD THIS
require('./config/firebase.config.js');

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const serviceRoutes = require('./api/routes/service.routes');
const orderRoutes = require('./api/routes/order.routes');

const app = express();

// CORS Configuration - ADD THIS SECTION
// Development: Allow all origins
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
} else {
  // Production: Restrict to specific origins
  const allowedOrigins = [
    'https://your-production-frontend.com',
    'https://www.your-production-frontend.com'
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
}

// Existing middleware
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/servicios', serviceRoutes);
app.use('/api/v1/orders', orderRoutes);

module.exports = app;
```

### Step 3: Restart Backend

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## ✅ Verification

After adding CORS, verify it's working:

### Using curl:

```bash
curl -i http://localhost:8080/api/v1/servicios
```

You should see in the response headers:

```
Access-Control-Allow-Origin: *
```

### Using Browser:

1. Open http://localhost:5173
2. Open DevTools → Network tab
3. Try to login or fetch services
4. Check the response headers for `Access-Control-Allow-Origin`

---

## 🛠️ Alternative CORS Configurations

### Option 1: Allow All (Development Only)

```javascript
const cors = require('cors');
app.use(cors()); // Simplest - allows all origins
```

✅ **Pros:** Easy, works immediately
❌ **Cons:** Not secure for production

---

### Option 2: Allow Specific Origin

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

✅ **Pros:** More secure
❌ **Cons:** Need to update for production URL

---

### Option 3: Environment-Based (Recommended)

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

Then add to `.env`:

```bash
# Development
FRONTEND_URL=http://localhost:5173

# Production
# FRONTEND_URL=https://your-production-frontend.com
```

✅ **Pros:** Flexible, secure, easy to configure
✅ **Best practice**

---

### Option 4: Multiple Origins (Recommended for Production)

```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',           // Development
  'http://localhost:3000',           // Alternative dev port
  'https://laverapp.com',            // Production
  'https://www.laverapp.com'         // Production with www
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
```

✅ **Pros:** Most secure, production-ready
✅ **Recommended for deployment**

---

## 🔄 Frontend Workarounds (Temporary)

While waiting for backend CORS fix, here are **temporary development-only** solutions:

### Option A: Vite Proxy (Recommended for Development)

**File:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

Then update `frontend/.env`:

```bash
# Use relative path instead of full URL
VITE_API_URL=/api/v1
```

**How it works:** Vite dev server proxies API requests to backend, avoiding CORS.

✅ **Pros:** No CORS issues in development
❌ **Cons:** Only works in development, different from production

---

### Option B: Browser Extension (Quick Fix)

Install a CORS unblocking extension:

**Chrome/Edge:**
- CORS Unblock
- Allow CORS: Access-Control-Allow-Origin

**Firefox:**
- CORS Everywhere

⚠️ **WARNING:**
- **ONLY for development testing**
- **NEVER use in production**
- **Remember to disable after testing**

---

### Option C: Chrome with Disabled Security (Not Recommended)

```bash
# macOS
open -na Google\ Chrome --args --disable-web-security --user-data-dir=/tmp/chrome-dev

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=C:\tmp\chrome-dev

# Linux
google-chrome --disable-web-security --user-data-dir=/tmp/chrome-dev
```

⚠️ **WARNING:**
- **Very insecure**
- **Only for emergency testing**
- **Use a separate Chrome instance**

---

## 📋 Testing Checklist

After CORS is configured:

- [ ] Backend has `cors` package installed
- [ ] `app.use(cors())` or similar is added to `app.js`
- [ ] Backend restarted
- [ ] Browser DevTools shows no CORS errors
- [ ] Response headers include `Access-Control-Allow-Origin`
- [ ] Login works from frontend
- [ ] Service fetching works
- [ ] Order creation works

---

## 🚨 Common CORS Errors & Solutions

### Error 1: "No 'Access-Control-Allow-Origin' header"

**Cause:** CORS not configured at all

**Solution:** Add `app.use(cors())` to backend

---

### Error 2: "Origin not allowed by CORS"

**Cause:** Frontend origin not in allowed list

**Solution:** Add `http://localhost:5173` to allowed origins

---

### Error 3: "Credentials not supported"

**Cause:** Trying to send cookies/auth without credentials: true

**Solution:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true  // ← ADD THIS
}));
```

---

### Error 4: Preflight Request Failed

**Cause:** Browser sends OPTIONS request first, not handled

**Solution:** CORS middleware handles this automatically if configured correctly

---

## 📊 CORS Request Flow

```
1. Browser (localhost:5173) → Preflight OPTIONS request
   ↓
2. Backend (localhost:8080) → Responds with CORS headers
   ↓
3. Browser checks headers → Allow/Block
   ↓
4. Browser sends actual request (GET/POST) → If allowed
   ↓
5. Backend responds with data + CORS headers
   ↓
6. Browser delivers data to frontend → If allowed
```

Without CORS configured, step 3 blocks the request.

---

## 🎯 Recommended Implementation

For LaverApp, we recommend **Option 3 (Environment-Based)**:

### 1. Install:
```bash
npm install cors
```

### 2. Update `backend/src/app.js`:
```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 3. Update `backend/.env`:
```bash
FRONTEND_URL=http://localhost:5173
```

### 4. For production `.env`:
```bash
FRONTEND_URL=https://your-production-domain.com
```

---

## 📞 Need Help?

### Still seeing CORS errors?

1. **Check backend console** - Look for CORS-related errors
2. **Check browser DevTools Network tab** - Look at request/response headers
3. **Verify origin** - Make sure frontend URL matches allowed origin
4. **Restart backend** - Changes require restart
5. **Clear browser cache** - Old CORS policies might be cached

### Debugging Commands:

```bash
# Check if cors is installed
npm list cors

# Check backend is running
curl http://localhost:8080/api/v1/servicios

# Check with origin header
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/v1/auth/login -v
```

---

## 📚 Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [Understanding CORS](https://javascript.info/fetch-crossorigin)

---

## ✅ Summary

### What Backend Needs to Do:

1. Run: `npm install cors`
2. Add to `app.js`: `const cors = require('cors');`
3. Add: `app.use(cors());` (or use environment-based config)
4. Restart backend server
5. Test with frontend

### Frontend Temporary Workaround:

Use Vite proxy (see Option A above) until backend CORS is fixed.

---

**Status:** 🔴 **BLOCKING ISSUE**
**Priority:** 🔥 **HIGH**
**Estimated Fix Time:** 5 minutes
**Impact:** Frontend cannot communicate with backend

---

**Created:** 2025-10-16
**For:** Backend Team (Victor Teo Risso)
**From:** Frontend Team (Gina Grosso)