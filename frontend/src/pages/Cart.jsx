import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateQuantity, 
  removeFromCart, 
  clearCart 
} from '../store/slices/cartSlice';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  ShoppingBag,
  Heart
} from 'lucide-react';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total, itemCount } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold"
              >
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cart Items
                </h2>
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </button>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
                      >
                        <img
                          src={item.product.images?.[0]?.url || '/api/placeholder/400/400'}
                          alt={item.product.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="block"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors duration-200 line-clamp-2">
                            {item.product.title}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Seller: {item.product.sellerId?.name || 'Unknown Seller'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.product.quantity}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors duration-200 font-semibold"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{total > 50 ? 'Free' : '$5.99'}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>
                      ${(total + (total > 50 ? 0 : 5.99) + (total * 0.08)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200">
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/checkout"
                      className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    
                    <button className="w-full border-2 border-primary-500 text-primary-500 py-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 font-semibold flex items-center justify-center gap-2">
                      <Heart className="h-5 w-5" />
                      Save for Later
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      Sign In to Checkout
                    </Link>
                    
                    <Link
                      to="/signup"
                      className="w-full border-2 border-primary-500 text-primary-500 py-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200 font-semibold text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure checkout
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '🚚', text: 'Free Shipping\nOver $50' },
                { icon: '↩️', text: '30-Day\nReturns' },
                { icon: '🔒', text: 'Secure\nPayment' },
              ].map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Viewed / Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for recommended products */}
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 text-center"
              >
                <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;