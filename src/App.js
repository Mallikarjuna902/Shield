import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Dashboard from './Dashboard';
import UserActivity from './UserActivity';
import AlertDetails from './AlertDetails';
import ResponseCenter from './ResponseCenter';
import ThreatIntelligence from './pages/ThreatIntelligence';
import AlertNotifications from './pages/AlertNotifications';
import ThreatDetection from './pages/ThreatDetection';
import { AuthProvider } from './AuthContext';
import { ThreatProvider } from './contexts/ThreatContext';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <ThreatProvider>
        <div className="App">
          <Toaster position="top-right" richColors closeButton />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-activity"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserActivity />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alert/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AlertDetails />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alert-intelligence"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ResponseCenter />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/threat-intelligence"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ThreatIntelligence />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alert-notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AlertNotifications />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/threat-detection"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ThreatDetection />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </ThreatProvider>
    </AuthProvider>
  );
}

export default App;
