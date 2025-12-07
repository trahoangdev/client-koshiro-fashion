import mongoose, { Document, Schema } from 'mongoose';

// Cloudinary image interface
interface CloudinaryImage {
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

// Cloudinary video interface
interface CloudinaryVideo {
  publicId: string;
  secureUrl: string;
  duration?: number;
  format: string;
  bytes: number;
}

export interface IProduct extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  categoryId: mongoose.Types.ObjectId;
  // Legacy image fields for backward compatibility
  images?: string[];
  // Cloudinary image fields
  cloudinaryImages?: CloudinaryImage[];
  galleryImages?: CloudinaryImage[];
  videos?: CloudinaryVideo[];
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
  // SEO and metadata
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  // Product details
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  materials?: string[];
  careInstructions?: string;
  sku?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cloudinary image sub-schema
const cloudinaryImageSchema = new Schema({
  publicId: { type: String, required: true },
  secureUrl: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  format: { type: String, required: true },
  bytes: { type: Number, required: true },
  responsiveUrls: {
    thumbnail: { type: String, required: true },
    medium: { type: String, required: true },
    large: { type: String, required: true },
    original: { type: String, required: true }
  }
}, { _id: false });

// Cloudinary video sub-schema
const cloudinaryVideoSchema = new Schema({
  publicId: { type: String, required: true },
  secureUrl: { type: String, required: true },
  duration: { type: Number },
  format: { type: String, required: true },
  bytes: { type: Number, required: true }
}, { _id: false });

// Dimensions sub-schema
const dimensionsSchema = new Schema({
  length: { type: Number, required: true, min: 0 },
  width: { type: Number, required: true, min: 0 },
  height: { type: Number, required: true, min: 0 }
}, { _id: false });

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
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
    min: 0,
    index: true
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  // Legacy image fields for backward compatibility
  images: {
    type: [String],
    default: []
  },
  // Cloudinary image fields
  cloudinaryImages: {
    type: [cloudinaryImageSchema],
    default: []
  },
  galleryImages: {
    type: [cloudinaryImageSchema],
    default: []
  },
  videos: {
    type: [cloudinaryVideoSchema],
    default: []
  },
  sizes: {
    type: [String],
    default: [],
    index: true
  },
  colors: {
    type: [String],
    default: [],
    index: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  onSale: {
    type: Boolean,
    default: false,
    index: true
  },
  // @ts-expect-error - isNew conflicts with Mongoose Document.isNew, but we need this field
  isNew: {
    type: Boolean,
    default: false,
    index: true
  },
  isLimitedEdition: {
    type: Boolean,
    default: false,
    index: true
  },
  isBestSeller: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  // SEO and metadata
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  // Product details
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    type: dimensionsSchema
  },
  materials: {
    type: [String],
    default: []
  },
  careInstructions: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true, // Allow multiple nulls but unique when set
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ onSale: 1, isActive: 1 });
productSchema.index({ isNew: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ isLimitedEdition: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ stock: 1, isActive: 1 });
productSchema.index({ name: 'text', nameEn: 'text', nameJa: 'text', description: 'text', tags: 'text' });

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function() {
  const doc = this as unknown as IProduct;
  return doc.stock > 0;
});

// Virtual for getting the display price (sale price if on sale, otherwise price)
productSchema.virtual('displayPrice').get(function() {
  const doc = this as unknown as IProduct;
  if (doc.onSale && doc.salePrice) {
    return doc.salePrice;
  }
  return doc.price;
});

// Virtual for calculating discount percentage
productSchema.virtual('discountPercentage').get(function() {
  const doc = this as unknown as IProduct;
  if (doc.onSale && doc.salePrice && doc.price) {
    return Math.round(((doc.price - doc.salePrice) / doc.price) * 100);
  }
  return 0;
});

// Method to update stock
productSchema.methods.updateStock = function(quantity: number): void {
  const doc = this as unknown as IProduct;
  doc.stock = Math.max(0, doc.stock + quantity);
};

// Method to check if product has available stock
productSchema.methods.hasStock = function(quantity: number = 1): boolean {
  const doc = this as unknown as IProduct;
  return doc.stock >= quantity;
};

// Pre-save hook to generate slug if not provided
productSchema.pre('save', function(next) {
  const doc = this as unknown as IProduct;
  if (!doc.slug && doc.name) {
    doc.slug = doc.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate salePrice from originalPrice if onSale
  if (doc.onSale && doc.originalPrice && !doc.salePrice) {
    // Default sale price is 20% off
    doc.salePrice = Math.round(doc.originalPrice * 0.8);
  }
  
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);

