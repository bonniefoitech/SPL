import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { JoinContestProvider } from './contexts/JoinContestContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Stocks from './pages/Stocks';
import Contests from './pages/Contests';
import CreateTeam from './pages/CreateTeam';
import ContestDetails from './pages/ContestDetails';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import LiveContest from './pages/LiveContest';
import Portfolio from './pages/Portfolio';
import Help from './pages/Help';
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Zap, 
  ChevronRight, 
  Star,
  Play,
  CheckCircle,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <JoinContestProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stocks"
                element={
                  <ProtectedRoute>
                    <Stocks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contests"
                element={
                  <ProtectedRoute>
                    <Contests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-team"
                element={
                  <ProtectedRoute>
                    <CreateTeam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contests/:id"
                element={
                  <ProtectedRoute>
                    <ContestDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-contest/:id"
                element={
                  <ProtectedRoute>
                    <LiveContest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={<Help />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(15, 23, 42, 0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </JoinContestProvider>
    </AuthProvider>
  );
};

export default App;