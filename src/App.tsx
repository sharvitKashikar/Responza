import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResourceProvider } from './contexts/ResourceContext';
import { IncidentProvider } from './contexts/IncidentContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ResourceManagement } from './pages/ResourceManagement';
import { IncidentManagement } from './pages/IncidentManagement';
import { MapView } from './pages/MapView';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ResourceProvider>
          <IncidentProvider>
            <Routes>
              <Route path="/" element={<Layout><Outlet /></Layout>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="resources" element={
                  <ProtectedRoute>
                    <ResourceManagement />
                  </ProtectedRoute>
                } />
                <Route path="incidents" element={
                  <ProtectedRoute>
                    <IncidentManagement />
                  </ProtectedRoute>
                } />
                <Route path="map" element={
                  <ProtectedRoute>
                    <MapView />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </IncidentProvider>
        </ResourceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
