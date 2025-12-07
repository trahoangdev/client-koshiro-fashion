import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'blocked';
  role: mongoose.Types.ObjectId; // Reference to Role model
  totalOrders: number;
  totalSpent: number;
  lastActive?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  loginAttempts?: number;
  loginAttemptsResetAt?: Date;
  lockedUntil?: Date;
  addresses?: Array<{
    type: 'shipping' | 'billing';
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    language: string;
    currency: string;
    notificationPreferences?: {
      email?: {
        orderUpdates?: boolean;
        promotions?: boolean;
        newsletters?: boolean;
        productRecommendations?: boolean;
      };
      push?: {
        orderUpdates?: boolean;
        promotions?: boolean;
        backInStock?: boolean;
        priceDrops?: boolean;
      };
      sms?: {
        orderUpdates?: boolean;
        promotions?: boolean;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: false, // Remove unique from schema, use index instead
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  loginAttemptsResetAt: {
    type: Date
  },
  lockedUntil: {
    type: Date
  },
  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing'],
      default: 'shipping'
    },
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    // Basic preferences
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    // Detailed notification preferences
    notificationPreferences: {
      email: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        newsletters: { type: Boolean, default: false },
        productRecommendations: { type: Boolean, default: true }
      },
      push: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        backInStock: { type: Boolean, default: true },
        priceDrops: { type: Boolean, default: true }
      },
      sms: {
        orderUpdates: { type: Boolean, default: false },
        promotions: { type: Boolean, default: false }
      }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true }); // Already unique, but explicit index
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
// Compound indexes for common queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ status: 1, createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema); 