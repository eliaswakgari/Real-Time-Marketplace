import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProduct, 
  addReview,
  clearCurrentProduct 
} from '../store/slices/productSlice';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  MessageCircle,
  Truck,
  Shield,
  ArrowLeft
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, loading, error } = useSelector(state => state.products);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    dispatch(fetchProduct(id));
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const handleAddToCart = () => {
    // Cart functionality will be implemented in next milestone
    console.log('Add to cart:', { productId: id, quantity });
  };

  const handleBuyNow = () => {
    // Checkout functionality will be implemented in next milestone
    console.log('Buy now:', { productId: id, quantity });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const result = await dispatch(addReview({ productId: id, reviewData }));
    if (addReview.fulfilled.match(result)) {
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', comment: '' });
    }
  };

  const nextImage = () => {
    setSelectedImage(prev => 
      prev === currentProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage(prev => 
      prev === 0 ? currentProduct.images.length - 1 : prev - 1
    );
  };

  const renderStars = (rating, size = 'h-5 w-5') => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link
            to="/products"
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-gray-900 dark:hover:text-white">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">{currentProduct.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <img
                src={currentProduct.images[selectedImage]?.url || '/api/placeholder/600/600'}
                alt={currentProduct.title}
                className="w-full h-96 object-cover"
              />
              
              {currentProduct.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Favorite Button */}
              <button className="absolute top-4 right-4 p-3 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors">
                <Heart className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-red-500" />
              </button>
            </div>

            {/* Thumbnail Images */}
            {currentProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? 'border-primary-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${currentProduct.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentProduct.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(currentProduct.avgRating)}
                  <span className="text-gray-600 dark:text-gray-400">
                    ({currentProduct.reviewsCount} reviews)
                  </span>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentProduct.status === 'approved' && currentProduct.quantity > 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : currentProduct.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {currentProduct.status === 'approved' && currentProduct.quantity > 0
                    ? 'In Stock'
                    : currentProduct.status === 'pending'
                    ? 'Pending Approval'
                    : 'Out of Stock'}
                </span>
              </div>

              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${currentProduct.price}
              </p>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {currentProduct.sellerId?.avatarUrl && (
                <img
                  src={currentProduct.sellerId.avatarUrl}
                  alt={currentProduct.sellerId.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentProduct.sellerId?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Seller since {new Date(currentProduct.sellerId?.createdAt).getFullYear()}
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <MessageCircle className="h-4 w-4" />
                Message Seller
              </button>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(currentProduct.quantity, prev + 1))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentProduct.quantity} available
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={currentProduct.status !== 'approved' || currentProduct.quantity === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={currentProduct.status !== 'approved' || currentProduct.quantity === 0}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Heart className="h-5 w-5" />
                  Add to Wishlist
                </button>
                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Truck className="h-5 w-5 text-green-500" />
                Free shipping on orders over $50
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="h-5 w-5 text-blue-500" />
                30-day money-back guarantee
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-8 px-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${currentProduct.reviewsCount})` },
                { id: 'shipping', label: 'Shipping & Returns' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose dark:prose-invert max-w-none"
              >
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {currentProduct.description}
                </p>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {currentProduct.specifications && Object.entries(currentProduct.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{value}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Review Summary */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      {currentProduct.avgRating}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(currentProduct.avgRating)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentProduct.reviewsCount} reviews
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    {/* Rating distribution would go here */}
                  </div>
                </div>

                {/* Add Review Button */}
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Write a Review
                  </button>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleReviewSubmit}
                    className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Write a Review
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewData(prev => ({ ...prev, rating }))}
                            className="text-2xl"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                rating <= reviewData.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={reviewData.title}
                        onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Summary of your experience"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Review
                      </label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Share your experience with this product"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {currentProduct.reviews?.map(review => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {review.userId?.avatarUrl && (
                            <img
                              src={review.userId.avatarUrl}
                              alt={review.userId.name}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {review.userId?.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating, 'h-4 w-4')}
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {review.title && (
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {review.title}
                        </h5>
                      )}
                      
                      <p className="text-gray-600 dark:text-gray-300">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping</h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Free standard shipping on orders over $50</li>
                    <li>Express shipping available for $9.99</li>
                    <li>Estimated delivery: 3-7 business days</li>
                    <li>International shipping available</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Returns</h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    <li>30-day money-back guarantee</li>
                    <li>Free returns within 30 days of delivery</li>
                    <li>Items must be in original condition</li>
                    <li>Contact customer service for return authorization</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {currentProduct.relatedProducts && currentProduct.relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProduct.relatedProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <img
                    src={product.images?.[0]?.url || '/api/placeholder/400/400'}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;