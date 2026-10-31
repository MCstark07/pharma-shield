import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CommandCenter } from './pages/CommandCenter';
import { ResourceExchange } from './pages/ResourceExchange';
import { AuditLedger } from './pages/AuditLedger';
import { api } from './services/api';

export const App: React.FC = () => {
  const [hasCriticalAlert, setHasCriticalAlert] = useState<boolean>(true);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const forecasts = await api.getForecasts();
        const hasCritical = forecasts.some((f) => f.alert_level === 'CRITICAL');
        setHasCriticalAlert(hasCritical);
      } catch (err) {
        // Keep default true during initial load
      }
    };
    checkAlerts();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar hasCriticalAlert={hasCriticalAlert} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/exchange" element={<ResourceExchange />} />
            <Route path="/security" element={<AuditLedger />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

