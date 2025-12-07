import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product';
import { Category, ICategory } from '../models/Category';
import CloudinaryService from '../services/cloudinaryService';

// Type definitions for better type safety
interface ProductQuery {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  isActive?: string;
  isFeatured?: string;
  isNew?: string;
  isLimitedEdition?: string;
  isBestSeller?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ProductCreateData {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  images?: string[];
  cloudinaryImages?: Array<{
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
  }>;
  galleryImages?: Array<{
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
  }>;
  videos?: Array<{
    publicId: string;
    secureUrl: string;
    duration?: number;
    format: string;
    bytes: number;
  }>;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  onSale?: boolean;
  isNew?: boolean;
  isLimitedEdition?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
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
}

interface ProductUpdateData extends Partial<ProductCreateData> {
  _id?: string;
}

interface BadgeDetectionResult {
  isLimitedEdition: boolean;
  isBestSeller: boolean;
}

// Helper function to detect badge statuses from tags
const detectBadgeFromTags = (tags: string[]): BadgeDetectionResult => {
  const limitedEditionPatterns = [
    /limited/i, /giới hạn/i, /限定/i, /limited edition/i, 
    /phiên bản giới hạn/i, /限定版/i
  ];
  
  const bestSellerPatterns = [
    /bestseller/i, /bán chạy/i, /ベストセラー/i, /best seller/i,
    /top seller/i, /bán nhiều/i, /人気/i
  ];
  
  const isLimitedEdition = tags.some(tag => 
    limitedEditionPatterns.some(pattern => pattern.test(tag))
  );
  
  const isBestSeller = tags.some(tag => 
    bestSellerPatterns.some(pattern => pattern.test(tag))
  );
  
  return { isLimitedEdition, isBestSeller };
};

// Helper function to update badge statuses based on creation date and tags
const updateBadgeStatuses = async (): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Update isNew status based on creation date
    await Promise.all([
      Product.updateMany(
        { 
          createdAt: { $lt: thirtyDaysAgo },
          isNew: true 
        },
        { isNew: false }
      ),
      Product.updateMany(
        { 
          createdAt: { $gte: thirtyDaysAgo },
          isNew: false 
        },
        { isNew: true }
      )
    ]);
    
    // Update isLimitedEdition based on tags
    const limitedEditionPatterns = [
      /limited/i, /giới hạn/i, /限定/i, /limited edition/i, 
      /phiên bản giới hạn/i, /限定版/i
    ];
    
    await Promise.all([
      Product.updateMany(
        { 
          tags: { $in: limitedEditionPatterns },
          isLimitedEdition: false 
        },
        { isLimitedEdition: true }
      ),
      Product.updateMany(
        { 
          tags: { $nin: limitedEditionPatterns },
          isLimitedEdition: true 
        },
        { isLimitedEdition: false }
      )
    ]);
    
    // Update isBestSeller based on tags
    const bestSellerPatterns = [
      /bestseller/i, /bán chạy/i, /ベストセラー/i, /best seller/i,
      /top seller/i, /bán nhiều/i, /人気/i
    ];
    
    await Promise.all([
      Product.updateMany(
        { 
          tags: { $in: bestSellerPatterns },
          isBestSeller: false 
        },
        { isBestSeller: true }
      ),
      Product.updateMany(
        { 
          tags: { $nin: bestSellerPatterns },
          isBestSeller: true 
        },
        { isBestSeller: false }
      )
    ]);
  } catch (error) {
    console.error('Error updating badge statuses:', error);
    throw error;
  }
};

// Helper function to validate product data
const validateProductData = (data: Partial<ProductCreateData>): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!data.categoryId) {
    errors.push('Category ID is required');
  }
  
  if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
    errors.push('Price must be a positive number');
  }
  
  if (data.stock !== undefined && (isNaN(data.stock) || data.stock < 0)) {
    errors.push('Stock must be a non-negative number');
  }
  
  if (data.weight !== undefined && (isNaN(data.weight) || data.weight < 0)) {
    errors.push('Weight must be a non-negative number');
  }
  
  if (data.dimensions) {
    const { length, width, height } = data.dimensions;
    if (length !== undefined && (isNaN(length) || length < 0)) {
      errors.push('Length must be a non-negative number');
    }
    if (width !== undefined && (isNaN(width) || width < 0)) {
      errors.push('Width must be a non-negative number');
    }
    if (height !== undefined && (isNaN(height) || height < 0)) {
      errors.push('Height must be a non-negative number');
    }
  }
  
  return errors;
};

// Helper function to build product filter
const buildProductFilter = (query: ProductQuery): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  
  if (query.category) {
    filter.categoryId = query.category;
  }
  
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  
  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured === 'true';
  }
  
  if (query.isNew !== undefined) {
    filter.isNew = query.isNew === 'true';
  }
  
  if (query.isLimitedEdition !== undefined) {
    filter.isLimitedEdition = query.isLimitedEdition === 'true';
  }
  
  if (query.isBestSeller !== undefined) {
    filter.isBestSeller = query.isBestSeller === 'true';
  }
  
  if (query.minPrice || query.maxPrice) {
    filter.price = {} as Record<string, number>;
    if (query.minPrice) {
      (filter.price as Record<string, number>).$gte = parseFloat(query.minPrice);
    }
    if (query.maxPrice) {
      (filter.price as Record<string, number>).$lte = parseFloat(query.maxPrice);
    }
  }
  
  if (query.search && query.search.trim()) {
    const searchTerm = query.search.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    filter.$or = [
      { name: searchRegex },
      { nameEn: searchRegex },
      { nameJa: searchRegex },
      { description: searchRegex },
      { descriptionEn: searchRegex },
      { descriptionJa: searchRegex },
      { tags: { $in: [searchRegex] } }
    ];
  }
  
  return filter;
};

// Get all products with pagination and filters
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Update badge statuses before fetching products
    await updateBadgeStatuses();
    
    const query = req.query as ProductQuery;
    const pageNum = parseInt(query.page || '1', 10);
    const limitNum = parseInt(query.limit || '10', 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid pagination parameters' 
      });
      return;
    }

    // Build filter object
    const filter = buildProductFilter(query);

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries in parallel for better performance
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'name nameEn nameJa slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean<IProduct[]>(),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single product by ID
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ 
        success: false,
        message: 'Invalid product ID' 
      });
      return;
    }
    
    const product = await Product.findById(id)
      .populate('categoryId', 'name nameEn nameJa slug')
      .lean<IProduct>();
    
    if (!product) {
      res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
      return;
    }

    res.json({ 
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = req.body as ProductCreateData;

    // Validate product data
    const validationErrors = validateProductData(productData);
    if (validationErrors.length > 0) {
      res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }

    // Validate category exists
    const category = await Category.findById(productData.categoryId).lean<ICategory>();
    if (!category) {
      res.status(400).json({ 
        success: false,
        message: 'Category not found' 
      });
      return;
    }

    // Handle Cloudinary images
    let cloudinaryImages: Array<{
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
    }> = [];
    
    // Use existing cloudinary images from request body if provided
    if (productData.cloudinaryImages && Array.isArray(productData.cloudinaryImages)) {
      cloudinaryImages = productData.cloudinaryImages;
    }
    
    // Handle new file uploads if any
    if (req.files && Array.isArray(req.files)) {
      // Separate images and videos
      const imageFiles = (req.files as Express.Multer.File[]).filter(file => 
        file.mimetype?.startsWith('image/')
      );
      const videoFiles = (req.files as Express.Multer.File[]).filter(file => 
        file.mimetype?.startsWith('video/')
      );

      // Upload images
      if (imageFiles.length > 0) {
        const uploadResult = await CloudinaryService.uploadProductImages(imageFiles);
        if (uploadResult.success && uploadResult.data) {
          cloudinaryImages = [...cloudinaryImages, ...uploadResult.data];
        } else {
          res.status(400).json({
            success: false,
            message: 'Failed to upload images',
            errors: uploadResult.errors
          });
          return;
        }
      }

      // Upload videos
      if (videoFiles.length > 0) {
        const videoUploadResult = await CloudinaryService.uploadProductVideos(videoFiles);
        if (videoUploadResult.success && videoUploadResult.data) {
          // Convert video upload results to video format
          const videoData = videoUploadResult.data.map(video => ({
            publicId: video.publicId,
            secureUrl: video.secureUrl,
            duration: 0, // Will be updated later if needed
            format: video.format,
            bytes: video.bytes
          }));
          
          // Add to existing videos or create new array
          if (productData.videos && Array.isArray(productData.videos)) {
            productData.videos.push(...videoData);
          } else {
            productData.videos = videoData;
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'Failed to upload videos',
            errors: videoUploadResult.errors
          });
          return;
        }
      }
    }

    // Auto-detect badge statuses from tags
    const productTags = productData.tags || [];
    const badgeDetection = detectBadgeFromTags(productTags);

    // Generate slug if not provided
    const productSlug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = new Product({
      name: productData.name,
      nameEn: productData.nameEn,
      nameJa: productData.nameJa,
      description: productData.description,
      descriptionEn: productData.descriptionEn,
      descriptionJa: productData.descriptionJa,
      price: productData.price,
      originalPrice: productData.originalPrice,
      categoryId: productData.categoryId,
      images: productData.images || [], // Legacy field for backward compatibility
      cloudinaryImages, // New Cloudinary images
      galleryImages: productData.galleryImages || [], // Additional gallery images
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      stock: productData.stock || 0,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      isFeatured: productData.isFeatured !== undefined ? productData.isFeatured : false,
      onSale: productData.onSale !== undefined ? productData.onSale : false,
      // Badge fields - use from request or auto-detect from tags
      isNew: productData.isNew !== undefined ? productData.isNew : true, // Default to true for new products
      isLimitedEdition: productData.isLimitedEdition !== undefined ? productData.isLimitedEdition : badgeDetection.isLimitedEdition,
      isBestSeller: productData.isBestSeller !== undefined ? productData.isBestSeller : badgeDetection.isBestSeller,
      tags: productTags,
      // New fields
      slug: productSlug,
      metaTitle: productData.metaTitle || productData.name,
      metaDescription: productData.metaDescription || productData.description,
      weight: productData.weight,
      dimensions: productData.dimensions,
      materials: productData.materials || [],
      careInstructions: productData.careInstructions,
      videos: productData.videos || [],
      sku: productData.sku,
      barcode: productData.barcode
    });

    await product.save();

    // Update category product count
    await Category.findByIdAndUpdate(productData.categoryId, {
      $inc: { productCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Upload product images
export const uploadProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
      return;
    }

    const uploadResult = await CloudinaryService.uploadProductImages(req.files as Express.Multer.File[]);
    
    if (uploadResult.success && uploadResult.data) {
      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadResult.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to upload images',
        errors: uploadResult.errors
      });
    }
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete product images
export const deleteProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicIds } = req.body;
    
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No public IDs provided'
      });
      return;
    }

    const deleteResult = await CloudinaryService.deleteMultipleFiles(publicIds);
    
    res.status(200).json({
      success: deleteResult.success,
      message: deleteResult.success ? 'Images deleted successfully' : 'Some images could not be deleted',
      data: {
        deleted: deleteResult.deleted,
        errors: deleteResult.errors
      }
    });
  } catch (error) {
    console.error('Delete product images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as ProductUpdateData;

    if (!id || typeof id !== 'string') {
      res.status(400).json({ 
        success: false,
        message: 'Invalid product ID' 
      });
      return;
    }

    // Validate update data
    const validationErrors = validateProductData(updateData);
    if (validationErrors.length > 0) {
      res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }

    // If category is being updated, validate it exists
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId).lean<ICategory>();
      if (!category) {
        res.status(400).json({ 
          success: false,
          message: 'Category not found' 
        });
        return;
      }
    }

    // Handle file uploads if any
    if (req.files && Array.isArray(req.files)) {
      // Separate images and videos
      const imageFiles = (req.files as Express.Multer.File[]).filter(file => 
        file.mimetype?.startsWith('image/')
      );
      const videoFiles = (req.files as Express.Multer.File[]).filter(file => 
        file.mimetype?.startsWith('video/')
      );

      // Upload new images
      if (imageFiles.length > 0) {
        const uploadResult = await CloudinaryService.uploadProductImages(imageFiles);
        if (uploadResult.success && uploadResult.data) {
          // Add new images to existing ones
          if (updateData.cloudinaryImages && Array.isArray(updateData.cloudinaryImages)) {
            updateData.cloudinaryImages = [...updateData.cloudinaryImages, ...uploadResult.data];
          } else {
            updateData.cloudinaryImages = uploadResult.data;
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'Failed to upload images',
            errors: uploadResult.errors
          });
          return;
        }
      }

      // Upload new videos
      if (videoFiles.length > 0) {
        const videoUploadResult = await CloudinaryService.uploadProductVideos(videoFiles);
        if (videoUploadResult.success && videoUploadResult.data) {
          // Convert video upload results to video format
          const videoData = videoUploadResult.data.map(video => ({
            publicId: video.publicId,
            secureUrl: video.secureUrl,
            duration: 0, // Will be updated later if needed
            format: video.format,
            bytes: video.bytes
          }));
          
          // Add new videos to existing ones
          if (updateData.videos && Array.isArray(updateData.videos)) {
            updateData.videos = [...updateData.videos, ...videoData];
          } else {
            updateData.videos = videoData;
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'Failed to upload videos',
            errors: videoUploadResult.errors
          });
          return;
        }
      }
    }

    // Auto-detect badge statuses from tags if tags are being updated
    if (updateData.tags) {
      const badgeDetection = detectBadgeFromTags(updateData.tags);
      updateData.isLimitedEdition = badgeDetection.isLimitedEdition;
      updateData.isBestSeller = badgeDetection.isBestSeller;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name nameEn nameJa slug').lean<IProduct>();

    if (!product) {
      res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ 
        success: false,
        message: 'Invalid product ID' 
      });
      return;
    }
    
    const product = await Product.findByIdAndDelete(id).lean<IProduct>();
    
    if (!product) {
      res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
      return;
    }

    // Update category product count
    await Category.findByIdAndUpdate(product.categoryId, {
      $inc: { productCount: -1 }
    });

    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit as string, 10);

    if (limitNum < 1 || limitNum > 50) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid limit parameter' 
      });
      return;
    }

    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
      .populate('categoryId', 'name nameEn nameJa slug')
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .lean<IProduct[]>();

    res.json({ 
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(400).json({ 
        success: false,
        message: 'Search query required' 
      });
      return;
    }

    const limitNum = parseInt(limit as string, 10);
    if (limitNum < 1 || limitNum > 50) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid limit parameter' 
      });
      return;
    }

    const products = await Product.find({
      $text: { $search: q.trim() },
      isActive: true
    })
      .populate('categoryId', 'name nameEn nameJa slug')
      .limit(limitNum)
      .sort({ score: { $meta: 'textScore' } })
      .lean<IProduct[]>();

    res.json({ 
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 
