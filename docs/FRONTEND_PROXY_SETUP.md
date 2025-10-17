# Frontend Vite Proxy Setup (Temporary CORS Workaround)

## Overview

This is a **temporary development solution** to bypass CORS issues while the backend team adds CORS support.

⚠️ **Important:** This is NOT a permanent solution. The backend still needs CORS configured for production.

---

## How Vite Proxy Works

```
Frontend (Browser)     Vite Dev Server        Backend
localhost:5173    →    localhost:5173    →   localhost:8080
                       (proxies /api)
```

Instead of the browser making requests directly to `http://localhost:8080`, it sends them to the Vite dev server, which proxies them to the backend. This avoids CORS because the browser thinks it's talking to the same origin.

---

## Setup Instructions

### Step 1: Update `vite.config.ts`

**File:** `frontend/vite.config.ts`

Replace the entire file with:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    // ADD PROXY CONFIGURATION
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Optional: Add logging to see proxy in action
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

### Step 2: Update `.env`

**File:** `frontend/.env`

Change from:
```bash
VITE_API_URL=http://localhost:8080/api/v1
```

To:
```bash
# Use relative path to leverage Vite proxy
VITE_API_URL=/api/v1
```

### Step 3: Restart Dev Server

```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

---

## What This Does

### Before (Direct Request - CORS Error):
```
Browser → http://localhost:8080/api/v1/auth/login
❌ CORS Error: Different origins
```

### After (Proxied Request - No CORS):
```
Browser → http://localhost:5173/api/v1/auth/login
         ↓ (Vite proxy forwards to)
       http://localhost:8080/api/v1/auth/login
✅ Same origin to browser, no CORS error
```

---

## Verification

### 1. Check Vite Console

After starting `npm run dev`, you should see:

```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 2. Test API Call

Open DevTools → Network tab, then try to login or fetch services.

You should see:
- Request URL: `http://localhost:5173/api/v1/auth/login` (not 8080!)
- Status: 200 OK (not CORS error)

### 3. Check Proxy Logs

With the logging configuration above, you'll see in the Vite console:

```
Sending Request to the Target: POST /api/v1/auth/login
Received Response from the Target: 200 /api/v1/auth/login
```

---

## Common Issues

### Issue 1: "Proxy error"

**Symptom:**
```
proxy error Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Cause:** Backend is not running

**Solution:** Start backend first:
```bash
cd backend && npm run dev
```

---

### Issue 2: 404 Not Found

**Symptom:** Requests to `/api/...` return 404

**Cause:** Proxy not configured correctly

**Solution:** Check that:
1. `vite.config.ts` has proxy configuration
2. `.env` uses `/api/v1` (not `http://localhost:8080/api/v1`)
3. Dev server was restarted after changes

---

### Issue 3: Still seeing CORS errors

**Symptom:** CORS errors persist

**Cause:** Browser cached the old configuration OR wrong env variable

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check `.env` file is correct
4. Restart Vite dev server
5. Check `VITE_API_URL` doesn't have `http://` prefix

---

## Limitations

### ❌ Does NOT Work:

1. **Production builds** - `npm run build` doesn't include proxy
2. **Preview mode** - `npm run preview` doesn't use proxy
3. **Different machines** - Proxy only works on localhost

### ✅ DOES Work:

1. **Development** - `npm run dev` only
2. **Localhost** - Frontend and backend on same machine
3. **All HTTP methods** - GET, POST, PUT, DELETE, etc.

---

## For Production

This proxy solution **will NOT work in production**. For production, you MUST:

1. ✅ Backend implements CORS (see CORS_SETUP_REQUIRED.md)
2. ✅ Update `.env.production` with full backend URL:
   ```bash
   VITE_API_URL=https://api.your-domain.com/api/v1
   ```

---

## Alternative: Advanced Proxy Configuration

If you need more control:

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket support
      },
      // Different route, different backend
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, '/api/v1/auth')
      }
    }
  }
}));
```

---

## Rollback Instructions

If you want to revert to direct requests (after backend adds CORS):

### Step 1: Revert `vite.config.ts`

Remove the `proxy` section:

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    // REMOVE proxy: { ... }
  },
  // ... rest stays the same
}));
```

### Step 2: Revert `.env`

Change back to full URL:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

### Step 3: Restart

```bash
npm run dev
```

---

## Testing Checklist

After proxy setup:

- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 5173
- [ ] `.env` uses `/api/v1` (relative path)
- [ ] `vite.config.ts` has proxy configuration
- [ ] Dev server restarted after changes
- [ ] Can register new user (no CORS error)
- [ ] Can login (no CORS error)
- [ ] Can fetch services (no CORS error)
- [ ] Can create orders (no CORS error)
- [ ] Network tab shows requests to `localhost:5173/api/...`

---

## When to Use This

✅ **Use Vite Proxy when:**
- Backend doesn't have CORS yet
- You need to test immediately
- Working in development mode
- Frontend and backend on same machine

❌ **Don't Use Vite Proxy when:**
- Building for production
- Backend has proper CORS
- Frontend and backend on different machines
- Running preview mode

---

## Summary

### Pros of Vite Proxy:
- ✅ Works immediately (no backend changes)
- ✅ No CORS errors
- ✅ Easy to configure
- ✅ Good for development

### Cons of Vite Proxy:
- ❌ Development only
- ❌ Doesn't work in production
- ❌ Requires local backend
- ❌ Not a real fix

### Recommendation:

Use Vite proxy as a **temporary workaround** while waiting for backend CORS. Once backend has CORS configured, remove the proxy and use direct requests.

---

**Created:** 2025-10-16
**Purpose:** Temporary CORS workaround for development
**Status:** Optional - Use if backend CORS not ready
**See also:** CORS_SETUP_REQUIRED.md (for backend team)