# Integration Testing Guide

This guide provides step-by-step instructions for testing the frontend-backend integration.

## ✅ Pre-requisites

### 1. Backend Setup

```bash
cd backend
npm install

# Ensure .env file is configured:
cat > .env << 'EOF'
PORT=8080
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
EOF

# Start backend
npm run dev
```

**Expected output:**
```
Servidor escuchando en el puerto 8080
Firebase conectado correctamente.
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Verify .env file exists with correct API URL:
cat .env
# Should show: VITE_API_URL=http://localhost:8080/api/v1

# Start frontend
npm run dev
```

**Expected output:**
```
VITE v5.4.19 ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

## 🧪 Test Scenarios

### Test 1: User Registration Flow

**Steps:**
1. Open browser to http://localhost:5173
2. Click "Registrate acá" or navigate to http://localhost:5173/register
3. Fill in the registration form:
   - **Nombre completo**: Juan Pérez
   - **Email**: juan@test.com
   - **Teléfono**: 3514567890 (optional)
   - **Contraseña**: test123456
   - **Confirmar contraseña**: test123456
4. Click "Registrarse"

**Expected Results:**
- ✅ Toast notification: "¡Cuenta creada exitosamente! Bienvenido, Juan Pérez!"
- ✅ Immediate login after registration
- ✅ Second toast: "¡Bienvenido, Juan Pérez!"
- ✅ Redirect to home page (/)
- ✅ Navbar shows "Juan Pérez" and logout button
- ✅ localStorage contains `laverapp_token` and `laverapp_user`

**Verify localStorage:**
```javascript
// Open DevTools Console
localStorage.getItem('laverapp_token') // Should return JWT token
JSON.parse(localStorage.getItem('laverapp_user')) // Should return user object
```

**Backend Console Should Show:**
```
// No errors, successful registration and login
```

**Potential Issues:**
- ❌ "Error al crear la cuenta" → Check backend is running
- ❌ "El correo electrónico ya está registrado" → Use different email or clear Firestore
- ❌ Validation error → Check password is at least 6 characters

---

### Test 2: Login Flow

**Steps:**
1. If logged in, click logout
2. Navigate to http://localhost:5173/login
3. Enter credentials:
   - **Email**: juan@test.com
   - **Password**: test123456
4. Click "Ingresar"

**Expected Results:**
- ✅ Toast notification: "¡Bienvenido, Juan Pérez!"
- ✅ Redirect to home page (/)
- ✅ Navbar shows user name
- ✅ localStorage updated with token and user

**Potential Issues:**
- ❌ "Error al iniciar sesión. Verificá tus credenciales." → Check email/password
- ❌ Network error → Check backend is running on port 8080
- ❌ CORS error → Backend should allow localhost:5173

---

### Test 3: Token Persistence & Auto-Login

**Steps:**
1. Login successfully (see Test 2)
2. Refresh the page (F5 or Ctrl+R)
3. Navigate to different pages

**Expected Results:**
- ✅ User remains logged in after refresh
- ✅ No redirect to login page
- ✅ Navbar still shows user name
- ✅ Can access protected routes (/order/new, /order/track)

**Verify:**
```javascript
// Check localStorage persists
localStorage.getItem('laverapp_token') // Still exists
JSON.parse(localStorage.getItem('laverapp_user')) // Still valid
```

---

### Test 4: Logout Flow

**Steps:**
1. While logged in, click on user name in navbar
2. Click "Logout" or "Cerrar sesión"

**Expected Results:**
- ✅ Toast notification: "Sesión cerrada"
- ✅ localStorage cleared
- ✅ Navbar shows "Login" button
- ✅ Redirected to public page
- ✅ Accessing /order/new redirects to /login

**Verify:**
```javascript
localStorage.getItem('laverapp_token') // null
localStorage.getItem('laverapp_user') // null
```

---

### Test 5: Fetch Services (Public)

**Steps:**
1. Navigate to http://localhost:5173/services
2. Observe the loading state
3. Wait for services to load

**Expected Results:**
- ✅ Skeleton loaders appear briefly
- ✅ Services display in grid layout
- ✅ Each service shows:
  - Icon
  - Name
  - Description
  - Pricing model badge
  - Price information
- ✅ "Crear un pedido ahora" button visible

**If No Services:**
- ✅ Shows empty state: "No hay servicios disponibles"
- ✅ No error message (just empty)

**Potential Issues:**
- ❌ Error alert appears → Check backend is running
- ❌ Services don't load → Check Firestore has services in `servicios` collection
- ❌ Infinite loading → Check network tab for failed requests

**Backend Check:**
```bash
# Add a test service via backend if Firestore is empty
# You can use Postman or curl to create a service (requires admin token)
```

---

### Test 6: Create Order Flow

**Steps:**
1. Login as a user (see Test 2)
2. Navigate to http://localhost:5173/order/new
3. Select a service from dropdown
4. Enter quantity (e.g., 2)
5. Check "Incluir planchado" if available
6. Add observaciones (optional): "Por favor entregar mañana"
7. Verify price estimate updates
8. Click "Confirmar pedido"

**Expected Results:**
- ✅ Services dropdown populated from backend
- ✅ Price estimate calculated in real-time
- ✅ Loading spinner appears on button
- ✅ Toast notification: "¡Pedido creado exitosamente!" with order ID
- ✅ Auto-redirect to /order/track after 1.5 seconds
- ✅ New order appears in list with status "Recibido"

**Network Tab:**
```
POST http://localhost:8080/api/v1/orders
Request Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Request Body:
  {
    "servicioId": "service-id",
    "detalle": { "cantidad": 2, "incluyePlanchado": true },
    "observaciones": "Por favor entregar mañana"
  }
Response: 201 Created
  {
    "message": "Pedido creado exitosamente...",
    "data": { "id": "...", "precioEstimado": 300, ... }
  }
```

**Potential Issues:**
- ❌ "Necesitás iniciar sesión" → User not authenticated
- ❌ "Por favor seleccioná un servicio" → No service selected
- ❌ Backend validation error → Check service exists and detalle format
- ❌ 401 Unauthorized → Token expired or invalid

---

### Test 7: Track Orders

**Steps:**
1. Login as a user who has created orders
2. Navigate to http://localhost:5173/order/track

**Expected Results:**
- ✅ Skeleton loaders appear briefly
- ✅ Orders displayed newest first
- ✅ Each order shows:
  - Order ID
  - Service name
  - Status badge with color (Recibido = blue)
  - Estimated price
  - Creation date in Spanish format
  - Observaciones (if any)
  - Progress bar (25% for Recibido)
  - Timeline visualization
- ✅ Orders sorted by fechaCreacion descending

**If No Orders:**
- ✅ Shows empty state: "No tenés pedidos aún"
- ✅ "Crear pedido" button visible

**Network Tab:**
```
GET http://localhost:8080/api/v1/orders
Request Headers:
  Authorization: Bearer <token>
Response: 200 OK
  {
    "message": "Se encontraron 2 pedidos.",
    "data": [ {...}, {...} ]
  }
```

**Potential Issues:**
- ❌ Error alert appears → Check backend is running
- ❌ 401 Unauthorized → Token missing or invalid
- ❌ Infinite loading → Check network for failed requests

---

### Test 8: Protected Route Access

**Test 8a: Unauthenticated Access**

**Steps:**
1. Logout if logged in
2. Try to access http://localhost:5173/order/new

**Expected Results:**
- ✅ Redirected to /login
- ✅ After login, redirected back to /order/new

**Test 8b: Admin Routes (Future)**

**Steps:**
1. Login as regular user (Cliente role)
2. Try to access http://localhost:5173/admin/dashboard

**Expected Results:**
- ✅ Access denied message (if admin check implemented)
- ✅ OR redirected if role check in ProtectedRoute

---

### Test 9: Error Handling

**Test 9a: Network Error**

**Steps:**
1. Stop the backend server
2. Try to login or fetch services

**Expected Results:**
- ✅ Error alert appears: "No pudimos cargar..."
- ✅ User-friendly error message
- ✅ No crash or blank screen

**Test 9b: Invalid Credentials**

**Steps:**
1. Navigate to /login
2. Enter wrong email or password
3. Click login

**Expected Results:**
- ✅ Toast error: "Error al iniciar sesión. Verificá tus credenciales."
- ✅ Form still usable
- ✅ No redirect

**Test 9c: Validation Error**

**Steps:**
1. Navigate to /register
2. Enter password less than 6 characters
3. Try to submit

**Expected Results:**
- ✅ Error message: "La contraseña debe tener al menos 6 caracteres"
- ✅ Form not submitted

**Test 9d: Token Expiration (JWT_EXPIRES_IN)**

**Steps:**
1. Set backend JWT_EXPIRES_IN=10s (10 seconds)
2. Login
3. Wait 15 seconds
4. Try to create an order

**Expected Results:**
- ✅ 401 Unauthorized from backend
- ✅ Error toast appears
- ✅ May need to add auto-logout on 401 (future enhancement)

---

## 🔍 DevTools Checks

### Network Tab Checklist

**Successful Login:**
```
POST /api/v1/auth/login
Status: 200 OK
Response: { message: "...", data: { usuario: {...}, token: "..." } }
```

**Successful Registration:**
```
POST /api/v1/auth/register
Status: 201 Created
Response: { message: "...", usuario: {...} }

Followed by automatic login:
POST /api/v1/auth/login
Status: 200 OK
```

**Fetch Services:**
```
GET /api/v1/servicios
Status: 200 OK
Response: { message: "...", data: [...] }
```

**Create Order:**
```
POST /api/v1/orders
Headers: Authorization: Bearer <token>
Status: 201 Created
Response: { message: "...", data: {...} }
```

**Fetch My Orders:**
```
GET /api/v1/orders
Headers: Authorization: Bearer <token>
Status: 200 OK
Response: { message: "...", data: [...] }
```

### Console Tab

**Should NOT show:**
- ❌ CORS errors
- ❌ Uncaught TypeErrors
- ❌ Failed to fetch errors (unless backend is down)

**May show:**
- ⚠️ Warning about inline styles (acceptable for dynamic width)
- ℹ️ Development mode messages

### localStorage

**After Login:**
```javascript
laverapp_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
laverapp_user: '{"id":"xxx","nombre":"Juan Pérez","email":"juan@test.com","rol":"cliente"}'
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error

**Error:**
```
Access to fetch at 'http://localhost:8080/api/v1/auth/login'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
Backend needs CORS middleware. Check if backend has:
```javascript
// backend/src/app.js
const cors = require('cors');
app.use(cors());
```

If not, this needs to be added to backend (but we can't modify backend in this task).

### Issue 2: 404 Not Found

**Error:**
```
GET http://localhost:8080/api/v1/servicios 404 (Not Found)
```

**Solution:**
- Check backend is running
- Verify route exists in backend/src/api/routes/
- Check API base URL in frontend/.env

### Issue 3: Token Not Sent

**Error:**
```
401 Unauthorized when accessing protected routes
```

**Solution:**
- Verify token exists in localStorage
- Check Authorization header is being sent
- Verify AuthContext is providing token

**Debug:**
```javascript
// In DevTools Console
localStorage.getItem('laverapp_token')
// Should return a token

// Check if AuthContext has token
// Look at React DevTools → AuthProvider
```

### Issue 4: Infinite Loading

**Symptom:**
Loading skeleton never disappears

**Solution:**
- Check network tab for failed request
- Verify backend is returning data
- Check for JavaScript errors in console

### Issue 5: Price Not Calculating

**Symptom:**
Price shows $0 in CreateOrder form

**Solution:**
- Verify service is selected
- Check selectedService has required fields (precioBase, etc.)
- Verify pricing model logic in calculateEstimatedPrice()

---

## ✅ Acceptance Criteria

The integration is successful when:

### Authentication
- [ ] User can register and is auto-logged in
- [ ] User can login with credentials
- [ ] Token persists in localStorage
- [ ] User stays logged in on page refresh
- [ ] Logout clears localStorage and updates UI

### Services
- [ ] Public services page loads without auth
- [ ] Services display with correct pricing info
- [ ] All 5 pricing models display correctly
- [ ] Loading and empty states work

### Orders
- [ ] Authenticated users can create orders
- [ ] Order creation shows real-time price estimate
- [ ] Success toast and redirect after creation
- [ ] User can view their orders
- [ ] Orders display with correct status and timeline

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Validation errors display in UI
- [ ] 401 errors handled gracefully
- [ ] No crashes or blank screens on errors

### Protected Routes
- [ ] Unauthenticated users redirected to login
- [ ] Protected pages require valid token
- [ ] Redirect back to requested page after login

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

Tester: [Name]
Backend Version: [commit/version]
Frontend Version: [commit/version]

### Test 1: Registration ✅ / ❌
- [ ] Form validation works
- [ ] Auto-login after registration
- [ ] Toast notifications appear
- [ ] localStorage updated
Notes:

### Test 2: Login ✅ / ❌
- [ ] Successful login with valid credentials
- [ ] Error with invalid credentials
- [ ] Token stored correctly
Notes:

### Test 3: Token Persistence ✅ / ❌
- [ ] Page refresh maintains login
- [ ] localStorage persists
Notes:

### Test 4: Logout ✅ / ❌
- [ ] localStorage cleared
- [ ] UI updated
Notes:

### Test 5: Services ✅ / ❌
- [ ] Services load from backend
- [ ] Pricing displays correctly
- [ ] Loading state works
Notes:

### Test 6: Create Order ✅ / ❌
- [ ] Services dropdown populated
- [ ] Price calculates correctly
- [ ] Order creation successful
- [ ] Redirect to track orders
Notes:

### Test 7: Track Orders ✅ / ❌
- [ ] Orders load from backend
- [ ] Status displays correctly
- [ ] Timeline visualization works
Notes:

### Test 8: Protected Routes ✅ / ❌
- [ ] Redirects work correctly
- [ ] Auth check functions properly
Notes:

### Test 9: Error Handling ✅ / ❌
- [ ] Network errors handled
- [ ] Validation errors shown
- [ ] No crashes on errors
Notes:

### Overall Result: ✅ PASS / ❌ FAIL
Issues Found:
1.
2.

Recommendations:
1.
2.
```

---

## 🚀 Performance Checks

### Load Times
- Initial page load: < 2s
- Service fetch: < 500ms
- Order creation: < 1s
- Orders list load: < 500ms

### UI Responsiveness
- Loading skeletons appear immediately
- Buttons disabled during async operations
- Toast notifications appear within 200ms
- Redirects happen smoothly

---

## 🔐 Security Checks

- [ ] Passwords not visible in network requests (hashed)
- [ ] Token not exposed in URL
- [ ] Token sent in Authorization header, not query params
- [ ] localStorage used correctly for token storage
- [ ] No sensitive data in console.log() in production

---

## 📝 Additional Notes

### Environment Variables
- Frontend: VITE_API_URL must point to backend
- Backend: JWT_SECRET must be set for token generation
- Backend: Firebase credentials must be valid

### Data Requirements
- Firestore must have at least one service for testing
- User accounts created during testing can be reused
- Orders accumulate during testing

### Browser Compatibility
- Tested in: Chrome, Firefox, Safari, Edge
- Mobile testing: iOS Safari, Chrome Android

---

**For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**
**For frontend integration guide, see [FRONTEND_API_INTEGRATION.md](FRONTEND_API_INTEGRATION.md)**