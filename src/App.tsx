import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MisaLinuxHomepage from './components/MisaLinuxHomepage';
import NotFound from './pages/NotFound';
import ErrorBoundary from './pages/ErrorBoundary';
import CGU from './pages/CGU';
import CGV from './pages/CGV';
import Privacy from './pages/Privacy';
import Home from './components/Home';
import Formations from './components/Formations';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import RegisterPage from './components/RegisterPage';
import AdminCheck from './components/AdminCheck';
import ForgotPassword from './components/ForgotPassword';
import { AuthProvider } from './contexts/AuthContext';
import Formation from './components/Formation';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import { UserRole } from './firebase/auth';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Navbar />
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/admin-check"
                element={
                  <PrivateRoute>
                    <AdminCheck />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole={UserRole.ADMIN}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/formations"
                element={
                  <PrivateRoute>
                    <Formations />
                  </PrivateRoute>
                }
              />
              <Route
                path="/formation/:id"
                element={
                  <PrivateRoute>
                    <Formation />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
