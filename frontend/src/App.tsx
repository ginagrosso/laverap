import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Customer Pages
import Home from "./pages/customer/Home";
import Services from "./pages/customer/Services";
import Pricing from "./pages/customer/Pricing";
import CreateOrder from "./pages/customer/CreateOrder";
import TrackOrder from "./pages/customer/TrackOrder";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Statistics from "./pages/admin/Statistics";

// Fallback
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Customer Routes */}
            <Route
              path="/order/new"
              element={
                <ProtectedRoute>
                  <CreateOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/track"
              element={
                <ProtectedRoute>
                  <TrackOrder />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Empleado", "Dueño"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Empleado", "Dueño"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <ProtectedRoute allowedRoles={["Administrador", "Dueño"]}>
                  <Statistics />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
