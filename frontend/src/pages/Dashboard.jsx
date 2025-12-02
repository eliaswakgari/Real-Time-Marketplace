import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Settings, Package, User } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);

  const stats = [
    { label: 'Orders', value: '0', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Wishlist', value: '0', icon: Heart, color: 'bg-pink-500' },
    { label: 'Products', value: '0', icon: Package, color: 'bg-green-500' },
  ];

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'Discover amazing products',
      icon: ShoppingBag,
      link: '/products',
      color: 'bg-blue-500'
    },
    {
      title: 'My Wishlist',
      description: 'View your saved items',
      icon: Heart,
      link: '/wishlist',
      color: 'bg-pink-500'
    },
    {
      title: 'Account Settings',
      description: 'Manage your profile',
      icon: Settings,
      link: '/settings',
      color: 'bg-gray-500'
    },
  ];

  if (user?.role === 'seller') {
    quickActions.push({
      title: 'Seller Dashboard',
      description: 'Manage your products',
      icon: Package,
      link: '/seller',
      color: 'bg-green-500'
    });
  }

  if (user?.role === 'admin') {
    quickActions.push({
      title: 'Admin Dashboard',
      description: 'Manage platform',
      icon: Settings,
      link: '/admin',
      color: 'bg-purple-500'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.email} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your account today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.link}
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 dark:hover:border-primary-500 transition-colors duration-200"
                >
                  <div className={`p-2 rounded-lg ${action.color} w-12 h-12 flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No recent activity yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Your activity will appear here
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;