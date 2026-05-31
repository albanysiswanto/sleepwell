import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ConsultPage from './pages/ConsultPage';
import ChatPage from './pages/ChatPage';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null;
  if (token) return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container">
          {/* Main App Container */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />

              {/* Protected Pages */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consult" 
                element={
                  <ProtectedRoute>
                    <ConsultPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
