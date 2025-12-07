import mongoose, { Document, Schema } from 'mongoose';

export interface IProductImage {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  responsiveUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
}

export interface IProduct extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  categoryId: mongoose.Types.ObjectId;
  images: string[]; // Legacy field for backward compatibility
  cloudinaryImages: IProductImage[]; // New Cloudinary images
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  isNew: boolean;
  isLimitedEdition: boolean;
  isBestSeller: boolean;
  tags: string[];
  // SEO fields
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  // Additional product details
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  materials?: string[];
  careInstructions?: string;
  careInstructionsEn?: string;
  careInstructionsJa?: string;
  origin?: string; // Country/region of origin (e.g., "Japan", "Việt Nam")
  originEn?: string;
  originJa?: string;
  // Video support
  videos?: {
    publicId: string;
    secureUrl: string;
    duration?: number;
    format: string;
    bytes: number;
  }[];
  // Analytics
  views: number; // Total product views
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameEn: {
    type: String,
    trim: true
  },
  nameJa: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  descriptionEn: {
    type: String,
    trim: true
  },
  descriptionJa: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    type: String,
    trim: true
  }],
  cloudinaryImages: [{
    publicId: {
      type: String,
      required: true,
      trim: true
    },
    secureUrl: {
      type: String,
      required: true,
      trim: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    format: {
      type: String,
      required: true,
      trim: true
    },
    bytes: {
      type: Number,
      required: true
    },
    responsiveUrls: {
      thumbnail: {
        type: String,
        required: true,
        trim: true
      },
      medium: {
        type: String,
        required: true,
        trim: true
      },
      large: {
        type: String,
        required: true,
        trim: true
      },
      original: {
        type: String,
        required: true,
        trim: true
      }
    }
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  colors: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isLimitedEdition: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  // SEO fields
  slug: {
    type: String,
    trim: true,
    unique: false, // Remove unique from schema, use index instead
    sparse: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  // Additional product details
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: {
      type: Number,
      min: 0
    },
    width: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    }
  },
  materials: [{
    type: String,
    trim: true
  }],
  careInstructions: {
    type: String,
    trim: true
  },
  careInstructionsEn: {
    type: String,
    trim: true
  },
  careInstructionsJa: {
    type: String,
    trim: true
  },
  origin: {
    type: String,
    trim: true
  },
  originEn: {
    type: String,
    trim: true
  },
  originJa: {
    type: String,
    trim: true
  },
  // Video support
  videos: [{
    publicId: {
      type: String,
      required: true,
      trim: true
    },
    secureUrl: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      min: 0
    },
    format: {
      type: String,
      required: true,
      trim: true
    },
    bytes: {
      type: Number,
      required: true
    }
  }],
  // Analytics
  views: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes for better performance
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ isLimitedEdition: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ slug: 1 }, { unique: true, sparse: true });
productSchema.index({ weight: 1 });
productSchema.index({ materials: 1 });

// Search indexes for better performance
productSchema.index({ name: 1 });
productSchema.index({ nameEn: 1 });
productSchema.index({ nameJa: 1 });
productSchema.index({ description: 1 });
productSchema.index({ descriptionEn: 1 });
productSchema.index({ descriptionJa: 1 });
productSchema.index({ metaTitle: 1 });
productSchema.index({ metaDescription: 1 });

// Compound indexes for complex queries
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ tags: 1, isActive: 1 });
productSchema.index({ onSale: 1, isActive: 1 });
productSchema.index({ isNew: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ views: -1, isActive: 1 }); // For popular products
productSchema.index({ createdAt: -1, isActive: 1 }); // For newest products
productSchema.index({ price: 1, salePrice: 1, isActive: 1 }); // For price range queries

export const Product = mongoose.model<IProduct>('Product', productSchema); 