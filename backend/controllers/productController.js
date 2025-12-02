const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');

// Get all products with filtering, sorting, and pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      minRating,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'approved'
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (minRating) {
      filter.avgRating = { $gte: parseFloat(minRating) };
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('sellerId', 'name avatarUrl')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name avatarUrl rating createdAt')
      .exec();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      status: 'approved',
      _id: { $ne: product._id },
    })
      .populate('sellerId', 'name avatarUrl')
      .limit(4)
      .exec();

    // Get reviews
    const reviews = await Review.find({ productId: product._id })
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .exec();

    res.json({
      success: true,
      product: {
        ...product.toJSON(),
        reviews,
        relatedProducts,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      quantity,
      tags,
      specifications,
    } = req.body;

    const product = new Product({
      sellerId: req.user.id,
      title,
      description,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      tags: tags || [],
      specifications: specifications || {},
      images: req.files || [], // Assuming multer handles file uploads
    });

    await product.save();
    await product.populate('sellerId', 'name avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Product created successfully and pending approval',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check ownership or admin role
    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    const updates = { ...req.body };
    
    // Reset status to pending if significant changes are made (admin only)
    if (req.user.role !== 'admin' && product.status === 'approved') {
      updates.status = 'pending';
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('sellerId', 'name avatarUrl');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check ownership or admin role
    if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
    });
  }
};

// Add review
exports.addReview = async (req, res) => {
  try {
    const { rating, title, comment, images = [] } = req.body;
    const productId = req.params.id;

    // Check if product exists and is approved
    const product = await Product.findById(productId);
    if (!product || product.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not approved',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const review = new Review({
      productId,
      userId: req.user.id,
      rating: parseInt(rating),
      title,
      comment,
      images,
      isVerifiedPurchase: true, // In real app, check if user purchased the product
    });

    await review.save();
    await product.updateRating();

    // Populate user info for response
    await review.populate('userId', 'name avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
    });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({ productId: req.params.id })
      .populate('userId', 'name avatarUrl')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Review.countDocuments({ productId: req.params.id });

    res.json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
    });
  }
};