import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { useSocket } from './hooks/useSocket';

// Auth Pages
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { TechnicianLogin } from './pages/auth/TechnicianLogin';
import { TechnicianRegister } from './pages/auth/TechnicianRegister';
import { AdminLogin } from './pages/auth/AdminLogin';

// Customer Pages
import { CustomerDashboard } from './pages/customer/Dashboard';
import { CreateIssue } from './pages/customer/CreateIssue';
import { IssueDetails } from './pages/customer/IssueDetails';
import { Notifications } from './pages/customer/Notifications';

// Technician Pages
import { TechnicianDashboard } from './pages/technician/Dashboard';
import { JobDetails } from './pages/technician/JobDetails';
import { Shop } from './pages/technician/Shop';
import { Cart } from './pages/technician/Cart';
import { Orders } from './pages/technician/Orders';
import { Profile } from './pages/technician/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { Issues } from './pages/admin/Issues';
import { Technicians } from './pages/admin/Technicians';
import { Users } from './pages/admin/Users';
import { Inventory } from './pages/admin/Inventory';
import { FindTechnicians } from './pages/admin/FindTechnicians';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'technician' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    } else if (requiredRole === 'technician') {
      return <Navigate to="/technician/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, token, user } = useAuthStore();

  useSocket();

  useEffect(() => {
    if (token && !user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        useAuthStore.setState({ user: JSON.parse(storedUser) });
      }
    }
  }, [token, user]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'customer' ? '/customer' : '/technician'} replace />
            ) : (
              <CustomerLogin />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'customer' ? '/customer' : '/technician'} replace />
            ) : (
              <CustomerRegister />
            )
          }
        />
        <Route
          path="/technician/login"
          element={
            isAuthenticated ? (
              <Navigate to="/technician" replace />
            ) : (
              <TechnicianLogin />
            )
          }
        />
        <Route
          path="/technician/register"
          element={
            isAuthenticated ? (
              <Navigate to="/technician" replace />
            ) : (
              <TechnicianRegister />
            )
          }
        />
        <Route
          path="/admin/login"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin />
            )
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/create-issue"
          element={
            <ProtectedRoute requiredRole="customer">
              <CreateIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/issues/:id"
          element={
            <ProtectedRoute requiredRole="customer">
              <IssueDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute requiredRole="customer">
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute requiredRole="customer">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Technician Routes */}
        <Route
          path="/technician"
          element={
            <ProtectedRoute requiredRole="technician">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/jobs/:id"
          element={
            <ProtectedRoute requiredRole="technician">
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/shop"
          element={
            <ProtectedRoute requiredRole="technician">
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/cart"
          element={
            <ProtectedRoute requiredRole="technician">
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/orders"
          element={
            <ProtectedRoute requiredRole="technician">
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/profile"
          element={
            <ProtectedRoute requiredRole="technician">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/notifications"
          element={
            <ProtectedRoute requiredRole="technician">
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/issues"
          element={
            <ProtectedRoute requiredRole="admin">
              <Issues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/technicians"
          element={
            <ProtectedRoute requiredRole="admin">
              <Technicians />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute requiredRole="admin">
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/find-technicians"
          element={
            <ProtectedRoute requiredRole="admin">
              <FindTechnicians />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to={
                  user?.role === 'admin'
                    ? '/admin'
                    : user?.role === 'technician'
                    ? '/technician'
                    : '/customer'
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Unauthorized</h1>
                <p className="text-gray-600">
                  You don't have permission to access this page.
                </p>
              </div>
            </div>
          }
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600">Page not found.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
