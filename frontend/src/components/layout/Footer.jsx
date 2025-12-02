import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mt-16 border-t border-gray-300 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Real-Time Market
            </h1>
            <p className="mt-3 text-sm leading-6">
              Buy, sell, and trade products instantly with real-time chat.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Quick Links
            </h2>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-blue-500">Home</Link></li>
              <li><Link to="/login" className="hover:text-blue-500">Login</Link></li>
              <li><Link to="/signup" className="hover:text-blue-500">Signup</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Categories
            </h2>
            <ul className="space-y-2">
              <li><span className="hover:text-blue-500 cursor-pointer">Electronics</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Fashion</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Home & Living</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Sports</span></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Support
            </h2>
            <ul className="space-y-2">
              <li><span className="hover:text-blue-500 cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Terms & Conditions</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-blue-500 cursor-pointer">Contact Us</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-10 pt-6 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Real-Time Market. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
