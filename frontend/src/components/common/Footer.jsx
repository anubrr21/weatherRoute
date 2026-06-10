// frontend/src/components/common/Footer.jsx

import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-300 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌤️</span>
              <span className="text-lg font-bold">
                WeatherRoute
              </span>
            </div>

            <p className="text-gray-600 text-sm">
              Your intelligent weather companion for smarter travel planning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <a href="/">Home</a>
              </li>

              <li>
                <a href="/dashboard">Dashboard</a>
              </li>

              <li>
                <a href="/route-planner">Route Planner</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">
              Resources
            </h3>

            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">API Documentation</a>
              </li>

              <li>
                <a href="#">Terms of Service</a>
              </li>

              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-3">
              Connect
            </h3>

            <div className="flex gap-4">
              <a href="#">GitHub</a>
              <a href="#">Twitter</a>
              <a href="#">Email</a>
            </div>
          </div>

        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>
            Made with ❤️ for weather enthusiasts
          </p>

          <p>
            © {currentYear} WeatherRoute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;