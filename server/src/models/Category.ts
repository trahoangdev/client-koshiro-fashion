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

export interface ICategory extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  slug: string;
  image?: string; // Legacy field for backward compatibility
  cloudinaryImages?: CloudinaryImage[]; // New Cloudinary images
  bannerImage?: string; // Legacy field for backward compatibility
  cloudinaryBannerImages?: CloudinaryImage[]; // New Cloudinary banner images
  isActive: boolean;
  parentId?: mongoose.Types.ObjectId;
  productCount: number;
  // Additional fields
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  displayType: 'grid' | 'list' | 'carousel';
  color?: string;
  icon?: string;
  seoUrl?: string;
  canonicalUrl?: string;
  schemaMarkup?: string;
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

const categorySchema = new Schema<ICategory>({
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
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: false // Remove unique from schema, use index instead
  },
  // Legacy image fields
  image: {
    type: String,
    trim: true
  },
  bannerImage: {
    type: String,
    trim: true
  },
  // Cloudinary image fields
  cloudinaryImages: {
    type: [cloudinaryImageSchema],
    default: []
  },
  cloudinaryBannerImages: {
    type: [cloudinaryImageSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  productCount: {
    type: Number,
    default: 0
  },
  // Additional fields
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  metaKeywords: {
    type: String,
    trim: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  displayType: {
    type: String,
    enum: ['grid', 'list', 'carousel'],
    default: 'grid'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  icon: {
    type: String,
    trim: true
  },
  seoUrl: {
    type: String,
    trim: true
  },
  canonicalUrl: {
    type: String,
    trim: true
  },
  schemaMarkup: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better performance
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ isVisible: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ sortOrder: 1 });
// Compound indexes for common queries
categorySchema.index({ isActive: 1, parentId: 1 });
categorySchema.index({ isVisible: 1, isActive: 1 });
categorySchema.index({ status: 1, isActive: 1 });
categorySchema.index({ isFeatured: 1, isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema); 