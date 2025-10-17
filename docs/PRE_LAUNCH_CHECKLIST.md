# Pre-Launch Checklist

Quick checklist to verify the frontend-backend integration is ready for testing.

## ✅ Backend Checklist

### Environment
- [ ] Backend `.env` file exists and is configured
- [ ] `JWT_SECRET` is set (not empty)
- [ ] `JWT_EXPIRES_IN` is set (recommend: 1d for testing, 7d for production)
- [ ] Firebase credentials are valid
- [ ] PORT is set to 8080

### Database
- [ ] Firebase project is created
- [ ] Firestore database is initialized
- [ ] Collections exist: `clientes`, `servicios`, `pedidos`
- [ ] At least one service exists in `servicios` collection (for testing)

### Backend Running
```bash
cd backend
npm run dev
```
- [ ] Server starts without errors
- [ ] Console shows: "Servidor escuchando en el puerto 8080"
- [ ] Console shows: "Firebase conectado correctamente"
- [ ] No error stack traces in console

### API Endpoints Accessible
Test with curl or Postman:

```bash
# Test public endpoint (should return services or empty array)
curl http://localhost:8080/api/v1/servicios

# Expected: {"message":"Se encontraron X servicios.","data":[...]}
```

---

## ✅ Frontend Checklist

### Environment
- [ ] Frontend `.env` file exists
- [ ] `VITE_API_URL=http://localhost:8080/api/v1` is set
- [ ] No typos in URL (common: missing /api/v1)

### Dependencies
```bash
cd frontend
npm install
```
- [ ] All dependencies installed without errors
- [ ] No peer dependency warnings (can ignore if minor)

### Build
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Only warnings are CSS-related (acceptable)

### Development Server
```bash
npm run dev
```
- [ ] Server starts on http://localhost:5173
- [ ] No errors in terminal
- [ ] Browser opens automatically or can navigate manually

---

## ✅ Integration Checklist

### Network Communication
- [ ] Backend and Frontend on same network (localhost for development)
- [ ] No firewall blocking ports 8080 or 5173
- [ ] CORS configured in backend (if needed)

### Browser DevTools
Open http://localhost:5173 and check:

**Console Tab:**
- [ ] No CORS errors
- [ ] No "Failed to fetch" errors
- [ ] No TypeScript errors
- [ ] No uncaught exceptions

**Network Tab:**
- [ ] Can see requests to http://localhost:8080/api/v1/*
- [ ] Requests complete (not pending/cancelled)
- [ ] Status codes are 200, 201, 401, etc. (not 404, 500)

**Application Tab → localStorage:**
- [ ] After login, `laverapp_token` exists
- [ ] After login, `laverapp_user` exists
- [ ] Both can be parsed as valid JSON

---

## ✅ Critical Paths Test

### Path 1: Guest → Register → Create Order
1. [ ] Open http://localhost:5173
2. [ ] Click "Registrate acá"
3. [ ] Fill form and submit
4. [ ] Auto-login successful (see welcome toast)
5. [ ] Navigate to "Services"
6. [ ] Click "Crear un pedido ahora"
7. [ ] Select service, enter quantity, submit
8. [ ] Order created successfully
9. [ ] Redirected to "Mis Pedidos"
10. [ ] New order appears in list

**If any step fails:** Check INTEGRATION_TESTING_GUIDE.md for detailed troubleshooting

### Path 2: Login → View Orders
1. [ ] Navigate to http://localhost:5173/login
2. [ ] Enter existing credentials
3. [ ] Login successful (welcome toast)
4. [ ] Navigate to "Mis Pedidos"
5. [ ] Orders load and display
6. [ ] Status badges show correctly
7. [ ] Dates format properly

### Path 3: Logout → Login Again
1. [ ] Click user name in navbar
2. [ ] Click "Logout"
3. [ ] localStorage cleared
4. [ ] UI updates (shows "Login" button)
5. [ ] Navigate to /order/new → Redirects to /login
6. [ ] Login again
7. [ ] Redirected back to /order/new

---

## ✅ UI/UX Checks

### Loading States
- [ ] Services page shows skeleton while loading
- [ ] Track Orders page shows skeleton while loading
- [ ] Create Order form shows skeleton for service dropdown
- [ ] Buttons show spinner during async operations
- [ ] Buttons disable during async operations

### Error States
- [ ] Network errors show user-friendly alerts
- [ ] Validation errors display in forms
- [ ] 401 errors show "please login" message
- [ ] 403 errors show "permission denied" message
- [ ] Error messages are in Spanish (app language)

### Empty States
- [ ] Services: Shows "No hay servicios disponibles"
- [ ] Track Orders: Shows "No tenés pedidos aún" with CTA
- [ ] Both empty states have appropriate icons

### Success Feedback
- [ ] Login shows toast: "¡Bienvenido, [nombre]!"
- [ ] Register shows toast: "¡Cuenta creada exitosamente!"
- [ ] Create Order shows toast: "¡Pedido creado exitosamente!"
- [ ] Logout shows toast: "Sesión cerrada"

---

## ✅ Data Validation

### Registration Form
- [ ] Name required (min 2 chars per backend)
- [ ] Email required and validated
- [ ] Email lowercase conversion
- [ ] Password required (min 6 chars)
- [ ] Password confirmation must match
- [ ] Form shows errors before submitting

### Login Form
- [ ] Email required
- [ ] Password required
- [ ] Invalid credentials show error (not "user not found")

### Create Order Form
- [ ] Service selection required
- [ ] Quantity required and must be > 0
- [ ] Price calculates correctly for all pricing models
- [ ] Observaciones are optional

---

## ✅ Security Checks

### Token Handling
- [ ] Token stored in localStorage (not sessionStorage)
- [ ] Token sent in Authorization header (Bearer format)
- [ ] Token not in URL parameters
- [ ] Token not logged to console in production

### Password Security
- [ ] Passwords never visible in network requests
- [ ] Passwords hashed by backend (bcrypt)
- [ ] Password inputs use type="password"

### API Security
- [ ] Protected endpoints require valid token
- [ ] Invalid tokens return 401
- [ ] Expired tokens return 401
- [ ] Missing tokens return 401

---

## ✅ Responsiveness

### Desktop (1920x1080)
- [ ] Layout looks good
- [ ] All elements visible
- [ ] No horizontal scroll

### Tablet (768x1024)
- [ ] Cards stack properly
- [ ] Navigation accessible
- [ ] Forms usable

### Mobile (375x667)
- [ ] Text readable
- [ ] Buttons tappable (min 44x44px)
- [ ] Forms functional
- [ ] No content cut off

---

## ✅ Browser Compatibility

### Chrome/Edge (Chromium)
- [ ] All features work
- [ ] No console errors
- [ ] localStorage works

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] localStorage works

### Safari (Mac/iOS)
- [ ] All features work
- [ ] Date formatting works (date-fns with es locale)
- [ ] localStorage works

---

## ✅ Performance

### Initial Load
- [ ] Home page loads < 2 seconds
- [ ] No blocking scripts
- [ ] Fonts load properly

### API Calls
- [ ] Services fetch < 500ms (local network)
- [ ] Orders fetch < 500ms (local network)
- [ ] Order creation < 1s (local network)

### UI Responsiveness
- [ ] No lag when typing in forms
- [ ] Smooth transitions and animations
- [ ] Toast notifications appear instantly

---

## ⚠️ Known Limitations (Acceptable for Now)

1. ✅ Admin pages not yet integrated (using mock data)
2. ✅ No real-time order updates (need manual refresh)
3. ✅ No pagination on orders list
4. ✅ No search/filter functionality
5. ✅ Only supports 3 pricing models in CreateOrder (paqueteConAdicional, porCanasto, porUnidad)
6. ✅ No image uploads for services
7. ✅ No email verification
8. ✅ No password reset functionality

---

## 🚨 Blockers (Must Fix Before Launch)

### Critical Issues (App won't work)
- [ ] Backend not starting
- [ ] Firebase credentials invalid
- [ ] CORS errors preventing API calls
- [ ] TypeScript compilation errors
- [ ] Runtime errors on page load

### High Priority (Core features broken)
- [ ] Cannot register users
- [ ] Cannot login
- [ ] Cannot create orders
- [ ] Cannot view orders
- [ ] Token not persisting

### Medium Priority (UX issues)
- [ ] Loading states not showing
- [ ] Error messages not clear
- [ ] Validation not working
- [ ] Prices calculating incorrectly

### Low Priority (Nice to have)
- [ ] Empty states missing
- [ ] Toast notifications missing
- [ ] Skeleton loaders not animated
- [ ] Icons not matching service type

---

## 📋 Final Verification

Before declaring "Ready for Testing":

1. **Run Full Build:**
   ```bash
   cd frontend
   npm run build
   # Should complete without errors
   ```

2. **Start Both Servers:**
   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

3. **Complete Critical Path 1:**
   - Register → Create Order → View Orders
   - All steps must work

4. **Check DevTools:**
   - No red errors in Console
   - Network requests succeed
   - localStorage contains token after login

5. **Review Documentation:**
   - [ ] README.md is up to date
   - [ ] API_DOCUMENTATION.md is complete
   - [ ] INTEGRATION_TESTING_GUIDE.md is ready
   - [ ] QUICK_REFERENCE.md is helpful

---

## ✅ Sign-Off

**Backend Developer:** _____________________ Date: _______
- [ ] Backend is running correctly
- [ ] All endpoints tested
- [ ] Firebase configured

**Frontend Developer:** _____________________ Date: _______
- [ ] Frontend builds successfully
- [ ] All integrations complete
- [ ] No critical bugs

**QA Tester:** _____________________ Date: _______
- [ ] Completed INTEGRATION_TESTING_GUIDE.md
- [ ] All critical paths work
- [ ] Documented any issues

---

## 🎯 Ready for Testing?

If ALL items above are checked:

✅ **YES - Ready for comprehensive testing**

Proceed with INTEGRATION_TESTING_GUIDE.md for full test suite.

If ANY critical items are unchecked:

❌ **NO - Fix blockers first**

Review unchecked items and resolve before testing.

---

**Last Updated:** 2025-10-16
**Next Review:** Before production deployment