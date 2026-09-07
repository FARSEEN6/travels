import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import FlightResults from './pages/FlightResults';
import AirlinePortal from './pages/AirlinePortal';
import AdminDashboard from './pages/AdminDashboard';
import ImportPnr from './pages/ImportPnr';
import GroupRequest from './pages/GroupRequest';
import RegisterPage from './pages/RegisterPage';

// Protected Route — redirects to /register if not registered
const ProtectedRoute = ({ children }) => {
  const { isRegistered, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#072a34] via-[#0a3d4d] to-[#11A8CD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
          </div>
          <p className="text-cyan-200/70 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return <Navigate to="/register" replace />;
  }

  return children;
};

// Admin Route — only allows admin users, redirects others to /
const AdminRoute = ({ children }) => {
  const { isRegistered, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#072a34] via-[#0a3d4d] to-[#11A8CD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
          </div>
          <p className="text-cyan-200/70 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return <Navigate to="/register" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Register Route — redirects to / if already registered
const RegisterRoute = () => {
  const { isRegistered, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#072a34] via-[#0a3d4d] to-[#11A8CD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
          </div>
          <p className="text-cyan-200/70 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return <Navigate to="/" replace />;
  }

  return <RegisterPage />;
};

function AppContent() {
  return (
    <Routes>
      {/* Public — Register */}
      <Route path="/register" element={<RegisterRoute />} />

      {/* Protected — All other routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-surface dark:bg-on-primary-fixed text-on-surface dark:text-inverse-on-surface font-body-md transition-colors duration-300">
              <Navbar />
              <div className="flex-grow flex flex-col">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/airline" element={<AirlinePortal />} />
                  <Route path="/search-results" element={<SearchResults />} />
                  <Route path="/flight-results" element={<FlightResults />} />
                  <Route path="/import-pnr" element={<ImportPnr />} />
                  <Route path="/group-request" element={<GroupRequest />} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                </Routes>
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [contentRevealed, setContentRevealed] = useState(false);

  return (
    <Router>
      <AuthProvider>
        {showPreloader && (
          <Preloader
            onStartFadeOut={() => setContentRevealed(true)}
            onComplete={() => {
              setShowPreloader(false);
              setContentRevealed(true);
            }}
          />
        )}
        <div
          className={`transition-all duration-[1200ms] ease-out transform ${
            contentRevealed || !showPreloader
              ? 'opacity-100 scale-100 translate-y-0 filter blur-0'
              : 'opacity-0 scale-95 translate-y-3 filter blur-sm'
          }`}
        >
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
