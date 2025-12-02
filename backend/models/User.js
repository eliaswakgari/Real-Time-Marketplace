const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  refreshTokens: [{
    tokenHash: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
  }],
}, {
  timestamps: true,
});

// Virtual for user ID
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Transform output to include virtuals and remove sensitive fields
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.refreshTokens;
    return ret;
  },
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error) {
    throw error; // Mongoose will handle this
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Generate random avatar (optional)
userSchema.methods.generateAvatar = function() {
  const colors = ['FFADAD', 'FFD6A5', 'FDFFB6', 'CAFFBF', '9BF6FF', 'A0C4FF', 'BDB2FF', 'FFC6FF'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=${randomColor}&color=fff&bold=true`;
};

module.exports = mongoose.model('User', userSchema);
