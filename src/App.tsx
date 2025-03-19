import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MisaLinuxHomepage from './components/MisaLinuxHomepage';
import NotFound from './pages/NotFound';
import ErrorBoundary from './pages/ErrorBoundary';
import CGU from './pages/CGU';
import CGV from './pages/CGV';
import Privacy from './pages/Privacy';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MisaLinuxHomepage />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
