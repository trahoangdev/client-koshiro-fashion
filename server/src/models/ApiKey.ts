import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
  _id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: Date;
  usageCount: number;
  rateLimit: number;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  key: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  permissions: [{
    type: String,
    required: true,
    enum: [
      'products:read',
      'products:write',
      'products:delete',
      'categories:read',
      'categories:write',
      'categories:delete',
      'orders:read',
      'orders:write',
      'orders:delete',
      'users:read',
      'users:write',
      'users:delete',
      'analytics:read',
      'settings:read',
      'settings:write'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0
  },
  rateLimit: {
    type: Number,
    default: 1000, // requests per hour
    min: 1,
    max: 10000
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ isActive: 1 });
apiKeySchema.index({ createdBy: 1 });
apiKeySchema.index({ expiresAt: 1 });

// Pre-save middleware to generate key if not provided
apiKeySchema.pre('save', function(next) {
  if (!this.key) {
    // Generate a secure API key
    const crypto = require('crypto');
    this.key = 'kf_' + crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Method to check if key is expired
apiKeySchema.methods.isExpired = function(): boolean {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to check if key can be used
apiKeySchema.methods.canUse = function(): boolean {
  return this.isActive && !this.isExpired();
};

// Method to increment usage count
apiKeySchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

export default mongoose.model<IApiKey>('ApiKey', apiKeySchema);
