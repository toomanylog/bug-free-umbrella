import React, { useEffect } from 'react';
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
import CertificationDetail from './pages/CertificationDetail';
import ExamPage from './pages/exam/ExamPage';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider, useNotification, setNotificationUtils } from './components/common/NotificationSystem';

// Composant pour initialiser les utilitaires de notification
const NotificationInitializer: React.FC = () => {
  const notificationUtils = useNotification();
  
  useEffect(() => {
    setNotificationUtils(notificationUtils);
  }, [notificationUtils]);
  
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <NotificationInitializer />
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<MisaLinuxHomepage />} />
                <Route path="/cgu" element={<CGU />} />
                <Route path="/cgv" element={<CGV />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/formation/:formationId" element={<FormationDetail />} />
                <Route path="/certification/:certificationId" element={<CertificationDetail />} />
                <Route path="/exam/:certificationId" element={<ExamPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
