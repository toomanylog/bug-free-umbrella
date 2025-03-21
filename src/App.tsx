import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MisaLinuxHomepage from './components/MisaLinuxHomepage';
import NotFound from './pages/NotFound';
import ErrorBoundary from './pages/ErrorBoundary';
import CGU from './pages/CGU';
import CGV from './pages/CGV';
import Privacy from './pages/Privacy';
import AdminDashboard from './components/admin/AdminDashboard';
import FormationDetail from './pages/FormationDetail';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<MisaLinuxHomepage />} />
              <Route path="/cgu" element={<CGU />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/formation/:formationId" element={<FormationDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
