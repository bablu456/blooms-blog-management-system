import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateBlog from './pages/CreateBlog';
import BlogDetails from './pages/BlogDetails';
import ProfileSettings from './pages/ProfileSettings';
import AuthorProfile from './pages/AuthorProfile';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen text-slate-900 antialiased">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-blog"
              element={
                <ProtectedRoute>
                  <CreateBlog />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />

            <Route path="/author/:id" element={<AuthorProfile />} />
            <Route path="/blog/:id" element={<BlogDetails />} />
          </Routes>

          <ChatbotWidget />

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '14px',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(10px)',
                color: '#0f172a',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
