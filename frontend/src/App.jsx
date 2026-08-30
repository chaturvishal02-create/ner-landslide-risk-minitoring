import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ToastProvider, useToast } from './components/Toast';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RiskMapPage from './pages/RiskMapPage';
import AIPredictionPage from './pages/AIPredictionPage';
import RainfallMonitoringPage from './pages/RainfallMonitoringPage';
import HistoricalAnalysisPage from './pages/HistoricalAnalysisPage';
import InfrastructurePage from './pages/InfrastructurePage';
import AlertCenterPage from './pages/AlertCenterPage';
import { alertsAPI } from './services/api';

const routeTitles = {
  '/dashboard': 'Command Dashboard',
  '/map': 'GIS Risk Map — North Eastern Region',
  '/prediction': 'AI Landslide Risk Prediction',
  '/rainfall': 'Rainfall Monitoring Station',
  '/historical': 'Historical Landslide & Weather Analytics',
  '/infrastructure': 'Infrastructure Vulnerability Assessment',
  '/alerts': 'Early Warning & Alert Center',
};

function MainLayout({ user, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const currentTitle = routeTitles[location.pathname] || 'Command Center';

  useEffect(() => {
    async function checkAlerts() {
      try {
        const res = await alertsAPI({ status: 'ACTIVE' });
        setAlertCount(res.data.alerts?.length || 0);
      } catch (err) {
        // silent catch
      }
    }
    checkAlerts();
    const interval = setInterval(checkAlerts, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className="main-content">
        <TopBar
          title={currentTitle}
          alertCount={alertCount}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="page-content">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<RiskMapPage />} />
            <Route path="/prediction" element={<AIPredictionPage />} />
            <Route path="/rainfall" element={<RainfallMonitoringPage />} />
            <Route path="/historical" element={<HistoricalAnalysisPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/alerts" element={<AlertCenterPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('landslide_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('landslide_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('landslide_user');
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        {user ? (
          <MainLayout user={user} onLogout={handleLogout} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </BrowserRouter>
    </ToastProvider>
  );
}
