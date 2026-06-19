// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WeatherProvider } from './context/WeatherContext';
import { HistoryProvider } from './context/HistoryContext';
import { ChatProvider } from './context/ChatContext';
import { AlertProvider } from './context/AlertContext';
import SharedRoute from './pages/SharedRoute';

import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import WeatherDetails from './pages/WeatherDetails';
import RoutePlannerPage from './pages/RoutePlannerPage';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import SearchHistory from './pages/SearchHistory';
import RouteHistory from './pages/RouteHistory';
import PreferencesPanel from './components/user/PreferencesPanel';
import CalendarView from './components/calendar/CalendarView';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ChatBot from './components/chatbot/ChatBot';

import { JarvisProvider } from './context/JarvisContext';
import JarvisButton from './components/jarvis/JarvisButton';
import JarvisIndicator from './components/jarvis/JarvisIndicator';

// ✅ NEW: Inner component that has access to AuthContext
function AppContent() {
  const { user } = useAuth();  // ✅ Now it's inside AuthProvider

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-100">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/weather/:city" element={<WeatherDetails />} />
            <Route path="/route-planner" element={<RoutePlannerPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/search-history" element={<SearchHistory />} />
            <Route path="/route-history" element={<RouteHistory />} />
            <Route path="/share/:shareToken" element={<SharedRoute />} />
            <Route path="/calendar" element={<CalendarView />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      
      {/* ✅ Only render if user is logged in */}
      {user && <PreferencesPanel />}
      
      <ChatBot />
      <JarvisButton />
      <JarvisIndicator />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

// ✅ Main App - Wraps everything with providers
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <HistoryProvider>
            <WeatherProvider>
              <ChatProvider>
                <AlertProvider>
                  <JarvisProvider>
                    <AppContent />  {/* ✅ All hooks are inside providers */}
                  </JarvisProvider>
                </AlertProvider>
              </ChatProvider>
            </WeatherProvider>
          </HistoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;