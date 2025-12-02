const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  attachments: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'file'],
      default: 'image',
    },
    filename: String,
    size: Number,
  }],
  read: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
}, {
  timestamps: true,
});

// Index for efficient querying
messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ to: 1, read: 1, createdAt: -1 });
messageSchema.index({ productId: 1 });

// Virtual for message ID
messageSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

messageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Message', messageSchema);