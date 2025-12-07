import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Cloudinary Configuration
 * Handles image and video upload, transformation, and management
 */
export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
};

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

/**
 * Cloudinary Upload Options
 */
export const uploadOptions = {
  // Default folder for all uploads
  folder: 'koshiro-fashion',
  
  // Image optimization settings
  quality: 'auto',
  fetch_format: 'auto',
  
  // Transformation settings
  transformation: [
    { quality: 'auto', fetch_format: 'auto' }
  ],
  
  // Resource type
  resource_type: 'auto' as const,
  
  // Allowed formats
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'],
  
  // Max file size (10MB)
  max_file_size: 10485760,
  
  // Tags for organization
  tags: ['koshiro-fashion', 'product-media'],
};

/**
 * Product-specific upload options
 */
export const productUploadOptions = {
  ...uploadOptions,
  folder: 'koshiro-fashion/products',
  tags: ['koshiro-fashion', 'product-media', 'products'],
};

/**
 * Category-specific upload options
 */
export const categoryUploadOptions = {
  ...uploadOptions,
  folder: 'koshiro-fashion/categories',
  tags: ['koshiro-fashion', 'category-media', 'categories'],
};

/**
 * User avatar upload options
 */
export const avatarUploadOptions = {
  ...uploadOptions,
  folder: 'koshiro-fashion/avatars',
  tags: ['koshiro-fashion', 'user-avatars', 'avatars'],
  transformation: [
    { width: 300, height: 300, crop: 'fill', gravity: 'face' }
  ],
};

/**
 * Banner/hero image upload options
 */
export const bannerUploadOptions = {
  ...uploadOptions,
  folder: 'koshiro-fashion/banners',
  tags: ['koshiro-fashion', 'banners', 'hero-images'],
  transformation: [
    { width: 1920, height: 1080, crop: 'fill', quality: 'auto' }
  ],
};

/**
 * Thumbnail generation options
 */
export const thumbnailOptions = {
  width: 300,
  height: 300,
  crop: 'fill',
  quality: 'auto',
  fetch_format: 'auto',
};

/**
 * Medium size image options
 */
export const mediumImageOptions = {
  width: 600,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  fetch_format: 'auto',
};

/**
 * Large size image options
 */
export const largeImageOptions = {
  width: 1200,
  height: 1200,
  crop: 'fill',
  quality: 'auto',
  fetch_format: 'auto',
};

/**
 * Validate Cloudinary configuration
 */
export const validateCloudinaryConfig = (): boolean => {
  const required = ['cloud_name', 'api_key', 'api_secret'];
  const missing = required.filter(key => !cloudinaryConfig[key as keyof typeof cloudinaryConfig]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Cloudinary configuration:', missing.join(', '));
    return false;
  }

  // Validate cloud_name format
  if (cloudinaryConfig.cloud_name && !/^[a-z0-9_-]+$/i.test(cloudinaryConfig.cloud_name)) {
    console.error('❌ Invalid cloud_name format. Must contain only letters, numbers, hyphens, and underscores.');
    return false;
  }

  // Test URL generation with a dummy publicId
  try {
    const testUrl = cloudinary.url('test', { secure: true });
    if (!testUrl || !testUrl.includes('cloudinary.com')) {
      console.error('❌ Cloudinary URL generation test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary configuration test failed:', error);
    return false;
  }
  
  console.log('✅ Cloudinary configuration validated');
  return true;
};

/**
 * Get Cloudinary instance
 */
export const getCloudinary = () => cloudinary;

/**
 * Generate optimized URL for different use cases
 */
export const generateOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
) => {
  try {
    // Validate publicId
    if (!publicId || typeof publicId !== 'string') {
      console.error('Invalid publicId provided to generateOptimizedUrl:', publicId);
      return '';
    }

    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    };
    
    const url = cloudinary.url(publicId, {
      ...defaultOptions,
      secure: true,
    });

    // Validate generated URL
    if (!url || !url.includes('cloudinary.com')) {
      console.error('Invalid URL generated for publicId:', publicId, 'URL:', url);
      return '';
    }

    return url;
  } catch (error) {
    console.error('Error generating optimized URL for publicId:', publicId, error);
    return '';
  }
};

/**
 * Generate responsive image URLs
 */
export const generateResponsiveUrls = (publicId: string) => {
  try {
    // Validate publicId
    if (!publicId || typeof publicId !== 'string') {
      console.error('Invalid publicId provided to generateResponsiveUrls:', publicId);
      return {
        thumbnail: '',
        medium: '',
        large: '',
        original: '',
      };
    }

    const thumbnail = generateOptimizedUrl(publicId, thumbnailOptions);
    const medium = generateOptimizedUrl(publicId, mediumImageOptions);
    const large = generateOptimizedUrl(publicId, largeImageOptions);
    const original = generateOptimizedUrl(publicId);

    // Validate all URLs are generated successfully
    const urls = { thumbnail, medium, large, original };
    const invalidUrls = Object.entries(urls).filter(([key, url]) => !url);
    
    if (invalidUrls.length > 0) {
      console.warn('Some responsive URLs failed to generate:', invalidUrls.map(([key]) => key));
    }

    return urls;
  } catch (error) {
    console.error('Error generating responsive URLs for publicId:', publicId, error);
    return {
      thumbnail: '',
      medium: '',
      large: '',
      original: '',
    };
  }
};

export default cloudinary;
