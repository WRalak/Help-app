import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import MoodTracker from './pages/mood/MoodTracker';
import Journal from './pages/journal/Journal';
import AIChat from './pages/ai-chat/AIChat';
import Crisis from './pages/crisis/Crisis';
import Profile from './pages/profile/Profile';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            
            <Routes>
              {/* PUBLIC ROUTES - Accessible to everyone */}
              <Route path="/" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/crisis" element={<Crisis />} />
              
              {/* PROTECTED ROUTES - Require authentication */}
              <Route path="/mood" element={
                <PrivateRoute>
                  <Layout>
                    <MoodTracker />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/journal" element={
                <PrivateRoute>
                  <Layout>
                    <Journal />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/ai-chat" element={
                <PrivateRoute>
                  <Layout>
                    <AIChat />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              } />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;