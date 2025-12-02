const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Fashion',
      'Home & Garden',
      'Sports',
      'Vehicles',
      'Books',
      'Beauty & Health',
      'Toys & Games',
      'Other'
    ],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    width: Number,
    height: Number,
    thumbUrl: String,
  }],
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
productSchema.index({ sellerId: 1, createdAt: -1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ avgRating: -1 });
productSchema.index({ price: 1 });

// Virtual for product ID
productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Transform output
productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Update average rating method
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const result = await Review.aggregate([
    { $match: { productId: this._id } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (result.length > 0) {
    this.avgRating = Math.round(result[0].avgRating * 10) / 10;
    this.reviewsCount = result[0].count;
  } else {
    this.avgRating = 0;
    this.reviewsCount = 0;
  }

  await this.save();
};

module.exports = mongoose.model('Product', productSchema);