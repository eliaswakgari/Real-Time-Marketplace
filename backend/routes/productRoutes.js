const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getProductReviews,
} = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/reviews', getProductReviews);

// Protected routes
router.post('/', authenticateToken, authorizeRoles('seller', 'admin'), upload.array('images', 5), createProduct);
router.put('/:id', authenticateToken, upload.array('images', 5), updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);
router.post('/:id/reviews', authenticateToken, addReview);

module.exports = router;