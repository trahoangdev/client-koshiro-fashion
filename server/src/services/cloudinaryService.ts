import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse, ResourceApiResponse } from 'cloudinary';
import { 
  uploadOptions, 
  productUploadOptions, 
  categoryUploadOptions,
  avatarUploadOptions,
  bannerUploadOptions,
  generateResponsiveUrls,
  generateOptimizedUrl
} from '../config/cloudinary';

// Type definitions for better type safety
interface CloudinaryUploadResult {
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

interface CloudinaryFileInfo {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

interface CloudinarySearchResult {
  resources: Array<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    created_at: string;
    tags: string[];
  }>;
}

interface UploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: Record<string, unknown>[];
  publicId?: string;
}

interface TransformOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  gravity?: string;
  radius?: number;
  effect?: string;
}

/**
 * Cloudinary Service
 * Handles all media operations including upload, delete, and transformation
 */
export class CloudinaryService {
  /**
   * Upload a single file to Cloudinary
   */
  static async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {}
  ): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult;
    error?: string;
  }> {
    try {
      // Validate file
      if (!file || !file.path) {
        return {
          success: false,
          error: 'Invalid file provided',
        };
      }

      // Validate file size (max 100MB for videos, 10MB for images)
      const isVideo = file.mimetype?.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for images
      const sizeLimit = isVideo ? '100MB' : '10MB';
      
      if (file.size && file.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds maximum limit of ${sizeLimit}`,
        };
      }

      // Validate file type
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'];
      const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
      
      if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
        return {
          success: false,
          error: 'Invalid file type. Only images and videos are allowed',
        };
      }

      const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(file.path, {
        ...uploadOptions,
        ...options,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });

      if (!uploadResult.public_id || !uploadResult.secure_url) {
        return {
          success: false,
          error: 'Upload failed: Invalid response from Cloudinary',
        };
      }

      // Generate responsive URLs with proper error handling
      let responsiveUrls;
      try {
        responsiveUrls = generateResponsiveUrls(uploadResult.public_id);
        
        // Validate that URLs are properly generated
        if (!responsiveUrls.thumbnail || !responsiveUrls.medium || !responsiveUrls.large || !responsiveUrls.original) {
          console.warn('Some responsive URLs are missing, using secure_url as fallback');
          responsiveUrls = {
            thumbnail: uploadResult.secure_url,
            medium: uploadResult.secure_url,
            large: uploadResult.secure_url,
            original: uploadResult.secure_url,
          };
        }
      } catch (urlError) {
        console.warn('Error generating responsive URLs, using secure_url as fallback:', urlError);
        responsiveUrls = {
          thumbnail: uploadResult.secure_url,
          medium: uploadResult.secure_url,
          large: uploadResult.secure_url,
          original: uploadResult.secure_url,
        };
      }

      return {
        success: true,
        data: {
          publicId: uploadResult.public_id,
          secureUrl: uploadResult.secure_url,
          width: uploadResult.width || 0,
          height: uploadResult.height || 0,
          format: uploadResult.format || 'unknown',
          bytes: uploadResult.bytes || 0,
          responsiveUrls,
        },
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      // Handle specific Cloudinary errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid image file')) {
          return {
            success: false,
            error: 'Invalid image file format',
          };
        }
        if (error.message.includes('File too large')) {
          return {
            success: false,
            error: 'File size too large',
          };
        }
        if (error.message.includes('Invalid public ID')) {
          return {
            success: false,
            error: 'Invalid file identifier',
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple files to Cloudinary
   */
  static async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {}
  ): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult[];
    errors?: string[];
  }> {
    try {
      // Validate input
      if (!files || !Array.isArray(files) || files.length === 0) {
        return {
          success: false,
          errors: ['No files provided for upload'],
        };
      }

      // Limit maximum files per batch
      const maxFiles = 10;
      if (files.length > maxFiles) {
        return {
          success: false,
          errors: [`Maximum ${maxFiles} files allowed per upload`],
        };
      }

      const uploadPromises = files.map((file, index) => 
        this.uploadFile(file, { ...options, publicId: `${options.publicId || 'batch'}_${index}` })
      );
      
      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads: CloudinaryUploadResult[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          successfulUploads.push(result.value.data);
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : result.value.error || 'Unknown error';
          errors.push(`File ${index + 1} (${files[index]?.originalname || 'unknown'}): ${error}`);
        }
      });

      return {
        success: successfulUploads.length > 0,
        data: successfulUploads.length > 0 ? successfulUploads : undefined,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Multiple upload failed'],
      };
    }
  }

  /**
   * Upload product images
   */
  static async uploadProductImages(files: Express.Multer.File[]): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult[];
    errors?: string[];
  }> {
    return this.uploadMultipleFiles(files, {
      ...productUploadOptions,
      tags: [...(productUploadOptions.tags || []), 'product-images'],
    });
  }

  /**
   * Upload category images
   */
  static async uploadCategoryImages(files: Express.Multer.File[]): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult[];
    errors?: string[];
  }> {
    return this.uploadMultipleFiles(files, {
      ...categoryUploadOptions,
      tags: [...(categoryUploadOptions.tags || []), 'category-images'],
    });
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: Express.Multer.File): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult;
    error?: string;
  }> {
    return this.uploadFile(file, {
      ...avatarUploadOptions,
      tags: [...(avatarUploadOptions.tags || []), 'user-avatar'],
    });
  }

  /**
   * Upload banner/hero images
   */
  static async uploadBanner(file: Express.Multer.File): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult;
    error?: string;
  }> {
    return this.uploadFile(file, {
      ...bannerUploadOptions,
      tags: [...(bannerUploadOptions.tags || []), 'banner-image'],
    });
  }

  /**
   * Upload product videos
   */
  static async uploadProductVideos(files: Express.Multer.File[]): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult[];
    errors?: string[];
  }> {
    return this.uploadMultipleFiles(files, {
      folder: 'products/videos',
      tags: ['product-videos', 'video'],
      transformation: [
        { quality: 'auto', format: 'mp4' },
        { width: 1280, height: 720, crop: 'scale' }
      ]
    });
  }

  /**
   * Upload category videos
   */
  static async uploadCategoryVideos(files: Express.Multer.File[]): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult[];
    errors?: string[];
  }> {
    return this.uploadMultipleFiles(files, {
      folder: 'categories/videos',
      tags: ['category-videos', 'video'],
      transformation: [
        { quality: 'auto', format: 'mp4' },
        { width: 800, height: 600, crop: 'scale' }
      ]
    });
  }

  /**
   * Upload a single video file
   */
  static async uploadVideo(file: Express.Multer.File, options: UploadOptions = {}): Promise<{
    success: boolean;
    data?: CloudinaryUploadResult;
    error?: string;
  }> {
    return this.uploadFile(file, {
      ...options,
      tags: [...(options.tags || []), 'video'],
      transformation: [
        { quality: 'auto', format: 'mp4' },
        { width: 1280, height: 720, crop: 'scale' }
      ]
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validate publicId
      if (!publicId || typeof publicId !== 'string') {
        return {
          success: false,
          error: 'Invalid public ID provided',
        };
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'auto',
        invalidate: true, // Invalidate CDN cache
      });
      
      if (result.result === 'ok') {
        return { success: true };
      } else if (result.result === 'not found') {
        return {
          success: false,
          error: 'File not found',
        };
      } else {
        return {
          success: false,
          error: `Failed to delete file: ${result.result}`,
        };
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      
      // Handle specific Cloudinary errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid public ID')) {
          return {
            success: false,
            error: 'Invalid file identifier',
          };
        }
        if (error.message.includes('Not found')) {
          return {
            success: false,
            error: 'File not found',
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Delete multiple files from Cloudinary
   */
  static async deleteMultipleFiles(publicIds: string[]): Promise<{
    success: boolean;
    deleted: string[];
    errors: string[];
  }> {
    try {
      // Validate input
      if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
        return {
          success: false,
          deleted: [],
          errors: ['No public IDs provided for deletion'],
        };
      }

      // Limit maximum files per batch
      const maxFiles = 20;
      if (publicIds.length > maxFiles) {
        return {
          success: false,
          deleted: [],
          errors: [`Maximum ${maxFiles} files allowed per deletion batch`],
        };
      }

      const deletePromises = publicIds.map(publicId => this.deleteFile(publicId));
      const results = await Promise.allSettled(deletePromises);

      const deleted: string[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          deleted.push(publicIds[index]);
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : result.value.error || 'Unknown error';
          errors.push(`${publicIds[index]}: ${error}`);
        }
      });

      return {
        success: deleted.length > 0,
        deleted,
        errors,
      };
    } catch (error) {
      console.error('Cloudinary multiple delete error:', error);
      return {
        success: false,
        deleted: [],
        errors: [error instanceof Error ? error.message : 'Multiple delete failed'],
      };
    }
  }

  /**
   * Transform an image URL
   */
  static transformImage(
    publicId: string,
    transformations: TransformOptions = {}
  ): string {
    // Validate publicId
    if (!publicId || typeof publicId !== 'string') {
      throw new Error('Invalid public ID provided');
    }

    // Validate transformations
    if (transformations.width && (transformations.width < 1 || transformations.width > 5000)) {
      throw new Error('Width must be between 1 and 5000 pixels');
    }

    if (transformations.height && (transformations.height < 1 || transformations.height > 5000)) {
      throw new Error('Height must be between 1 and 5000 pixels');
    }

    return generateOptimizedUrl(publicId, transformations);
  }

  /**
   * Generate responsive image URLs
   */
  static generateResponsiveImageUrls(publicId: string) {
    return generateResponsiveUrls(publicId);
  }

  /**
   * Get file information
   */
  static async getFileInfo(publicId: string): Promise<{
    success: boolean;
    data?: CloudinaryFileInfo;
    error?: string;
  }> {
    try {
      // Validate publicId
      if (!publicId || typeof publicId !== 'string') {
        return {
          success: false,
          error: 'Invalid public ID provided',
        };
      }

      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'auto',
      }) as Record<string, unknown>; // Cloudinary types are incomplete
      
      return {
        success: true,
        data: {
          publicId: result.public_id as string,
          secureUrl: result.secure_url as string,
          width: (result.width as number) || 0,
          height: (result.height as number) || 0,
          format: (result.format as string) || 'unknown',
          bytes: (result.bytes as number) || 0,
          createdAt: (result.created_at as string) || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Cloudinary get file info error:', error);
      
      // Handle specific Cloudinary errors
      if (error instanceof Error) {
        if (error.message.includes('Not found')) {
          return {
            success: false,
            error: 'File not found',
          };
        }
        if (error.message.includes('Invalid public ID')) {
          return {
            success: false,
            error: 'Invalid file identifier',
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file info',
      };
    }
  }

  /**
   * Search files by tags
   */
  static async searchFiles(tags: string[]): Promise<{
    success: boolean;
    data?: CloudinaryFileInfo[];
    error?: string;
  }> {
    try {
      // Validate tags
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return {
          success: false,
          error: 'No tags provided for search',
        };
      }

      // Filter out empty tags
      const validTags = tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
      
      if (validTags.length === 0) {
        return {
          success: false,
          error: 'No valid tags provided for search',
        };
      }

      const result: CloudinarySearchResult = await cloudinary.search
        .expression(`tags:${validTags.join(' AND ')}`)
        .max_results(100) // Limit results
        .execute();

      const formattedResults: CloudinaryFileInfo[] = result.resources.map(resource => ({
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
        width: resource.width || 0,
        height: resource.height || 0,
        format: resource.format || 'unknown',
        bytes: resource.bytes || 0,
        createdAt: resource.created_at || new Date().toISOString(),
      }));

      return {
        success: true,
        data: formattedResults,
      };
    } catch (error) {
      console.error('Cloudinary search error:', error);
      
      // Handle specific Cloudinary errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid expression')) {
          return {
            success: false,
            error: 'Invalid search expression',
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  /**
   * Create a folder
   */
  static async createFolder(folderName: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validate folder name
      if (!folderName || typeof folderName !== 'string') {
        return {
          success: false,
          error: 'Invalid folder name provided',
        };
      }

      // Clean folder name
      const cleanFolderName = folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      
      if (cleanFolderName.length === 0) {
        return {
          success: false,
          error: 'Invalid folder name after cleaning',
        };
      }

      // Cloudinary doesn't have explicit folder creation
      // Folders are created automatically when files are uploaded
      return { success: true };
    } catch (error) {
      console.error('Cloudinary create folder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create folder',
      };
    }
  }

  /**
   * Get folder contents
   */
  static async getFolderContents(folderName: string): Promise<{
    success: boolean;
    data?: CloudinaryFileInfo[];
    error?: string;
  }> {
    try {
      // Validate folder name
      if (!folderName || typeof folderName !== 'string') {
        return {
          success: false,
          error: 'Invalid folder name provided',
        };
      }

      const result: CloudinarySearchResult = await cloudinary.search
        .expression(`folder:${folderName}`)
        .max_results(100) // Limit results
        .execute();

      const formattedResults: CloudinaryFileInfo[] = result.resources.map(resource => ({
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
        width: resource.width || 0,
        height: resource.height || 0,
        format: resource.format || 'unknown',
        bytes: resource.bytes || 0,
        createdAt: resource.created_at || new Date().toISOString(),
      }));

      return {
        success: true,
        data: formattedResults,
      };
    } catch (error) {
      console.error('Cloudinary get folder contents error:', error);
      
      // Handle specific Cloudinary errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid expression')) {
          return {
            success: false,
            error: 'Invalid folder name',
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get folder contents',
      };
    }
  }

  /**
   * Validate Cloudinary configuration
   */
  static validateConfiguration(): {
    success: boolean;
    error?: string;
  } {
    try {
      const config = cloudinary.config();
      
      if (!config.cloud_name) {
        return {
          success: false,
          error: 'Cloudinary cloud name is not configured',
        };
      }

      if (!config.api_key) {
        return {
          success: false,
          error: 'Cloudinary API key is not configured',
        };
      }

      if (!config.api_secret) {
        return {
          success: false,
          error: 'Cloudinary API secret is not configured',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration validation failed',
      };
    }
  }

  /**
   * Get Cloudinary usage statistics
   */
  static async getUsageStats(): Promise<{
    success: boolean;
    data?: {
      plan: string;
      objects: {
        used: number;
        limit: number;
      };
      bandwidth: {
        used: number;
        limit: number;
      };
      storage: {
        used: number;
        limit: number;
      };
    };
    error?: string;
  }> {
    try {
      const result = await cloudinary.api.usage();
      
      return {
        success: true,
        data: {
          plan: result.plan || 'Unknown',
          objects: {
            used: result.objects?.used || 0,
            limit: result.objects?.limit || 0,
          },
          bandwidth: {
            used: result.bandwidth?.used || 0,
            limit: result.bandwidth?.limit || 0,
          },
          storage: {
            used: result.storage?.used || 0,
            limit: result.storage?.limit || 0,
          },
        },
      };
    } catch (error) {
      console.error('Cloudinary usage stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get usage statistics',
      };
    }
  }

  /**
   * Clean up orphaned files (files not referenced in database)
   */
  static async cleanupOrphanedFiles(referencedPublicIds: string[]): Promise<{
    success: boolean;
    cleaned: string[];
    errors: string[];
  }> {
    try {
      // Get all files from Cloudinary
      const allFilesResult = await cloudinary.search
        .expression('resource_type:image')
        .max_results(500)
        .execute();

      const allPublicIds = allFilesResult.resources.map((resource: Record<string, unknown>) => resource.public_id as string);
      const orphanedIds = allPublicIds.filter((id: string) => !referencedPublicIds.includes(id));

      if (orphanedIds.length === 0) {
        return {
          success: true,
          cleaned: [],
          errors: [],
        };
      }

      // Delete orphaned files in batches
      const batchSize = 10;
      const cleaned: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < orphanedIds.length; i += batchSize) {
        const batch = orphanedIds.slice(i, i + batchSize);
        const deleteResult = await this.deleteMultipleFiles(batch);
        
        if (deleteResult.success) {
          cleaned.push(...deleteResult.deleted);
        }
        
        if (deleteResult.errors) {
          errors.push(...deleteResult.errors);
        }
      }

      return {
        success: cleaned.length > 0,
        cleaned,
        errors,
      };
    } catch (error) {
      console.error('Cloudinary cleanup error:', error);
      return {
        success: false,
        cleaned: [],
        errors: [error instanceof Error ? error.message : 'Cleanup failed'],
      };
    }
  }
}

export default CloudinaryService;
