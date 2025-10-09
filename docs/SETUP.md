# Laverapp Setup Guide

## Port Configuration

**IMPORTANT:** Port conflict has been resolved!

- **Backend:** Port 8080
- **Frontend:** Port 5173

Both can run simultaneously without conflicts.

---

## Initial Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# The .env file is already configured with Firebase credentials
# Verify it exists:
ls -la .env

# Start the backend
npm run dev
```

Backend will be available at: `http://localhost:8080`

**Backend .env contains:**
- Port configuration (8080)
- JWT secrets
- Firebase Admin SDK credentials

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# The .env file is already configured with backend URL
# Verify it exists:
ls -la .env

# Start the frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

**Frontend .env contains:**
- Backend API URL: `http://localhost:8080/api/v1`

---

## Running Both Services

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

You should see:
```
Servidor escuchando en el puerto 8080
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.4.19  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## Verification

1. **Backend Health Check:**
   - Visit: `http://localhost:8080/api/v1/servicios` (should return services data)

2. **Frontend:**
   - Visit: `http://localhost:5173` (should show landing page)
   - Try registering a new account
   - Try logging in
   - Navigate between pages

---

## Environment Files Security

✅ Both `.env` files are **gitignored** and will NOT be committed to version control.

**Backend `.gitignore`** already includes:
```
.env
```

**Frontend `.gitignore`** now includes:
```
.env
.env.local
.env.*.local
```

---

## Troubleshooting

### Port Already in Use

**Backend (8080):**
```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process if needed
kill -9 <PID>
```

**Frontend (5173):**
```bash
# Check what's using port 5173
lsof -i :5173

# Kill the process if needed
kill -9 <PID>
```

### Backend Won't Start

1. Verify Node.js is installed: `node --version`
2. Check if dependencies are installed: `ls backend/node_modules`
3. If not, run: `cd backend && npm install`
4. Check `.env` file exists: `ls backend/.env`

### Frontend Won't Start

1. Verify Node.js is installed: `node --version`
2. Check if dependencies are installed: `ls frontend/node_modules`
3. If not, run: `cd frontend && npm install`
4. Check `.env` file exists: `ls frontend/.env`

### Firebase Errors

If you see Firebase authentication errors:
1. Verify `FIREBASE_PROJECT_ID` in backend `.env`
2. Verify `FIREBASE_PRIVATE_KEY` is properly formatted (with newlines as `\n`)
3. Verify `FIREBASE_CLIENT_EMAIL` is correct

---

## Production Deployment

### Backend (Render)

1. Push code to repository
2. In Render, add environment variables from `backend/.env`
3. Set build command: `npm install`
4. Set start command: `npm start`

### Frontend (Vercel)

1. Push code to repository
2. In Vercel, set environment variable:
   - `VITE_API_URL=https://your-backend-url.render.com/api/v1`
3. Build command: `npm run build`
4. Output directory: `dist`

---

## Quick Reference

| Service  | Port | URL                        | Command        |
|----------|------|----------------------------|----------------|
| Backend  | 8080 | http://localhost:8080      | `npm run dev`  |
| Frontend | 5173 | http://localhost:5173      | `npm run dev`  |

**API Base URL:** `http://localhost:8080/api/v1`

---

## Next Steps

1. ✅ Ports configured (no conflicts)
2. ✅ Environment files created
3. ✅ Both .gitignore files updated
4. ⏳ Install backend dependencies: `cd backend && npm install`
5. ⏳ Test backend startup
6. ⏳ Test frontend connects to backend
7. ⏳ Test authentication flow end-to-end
