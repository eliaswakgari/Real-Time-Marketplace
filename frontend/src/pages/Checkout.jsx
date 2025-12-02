import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Checkout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Checkout functionality will be implemented in the next milestone with Stripe integration.
          </p>
          <Link
            to="/cart"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            Back to Cart
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;