// frontend/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Map, Heart, LayoutDashboard, LogOut, User, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

const navLinks = [
  { to: '/', label: 'Home', icon: null },
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, auth: true },
  { to: '/route-planner', label: 'Route Planner', icon: <Map className="w-4 h-4" />, auth: true },
  { to: '/favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" />, auth: true },
  { to: '/calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" />, auth: true }  // ← ADD THIS
];

  return (
    <nav className="bg-white dark:bg-dark-200 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">🌤️</div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              WeatherRoute
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30">
                  <User className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium dark:text-white">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-dark-300"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-dark-300">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                if (link.auth && !isAuthenticated) return null;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 flex items-center gap-2"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
              
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 flex items-center gap-2"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Logged in as {user?.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center px-4 py-2 text-primary-500 border border-primary-500 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center px-4 py-2 bg-primary-500 text-white rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;