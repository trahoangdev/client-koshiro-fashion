import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { Category, ICategory } from '../models/Category';
import { Product } from '../models/Product';
import CloudinaryService from '../services/cloudinaryService';

// Types for better type safety
type CategoryTreeNode = ICategory & {
  children: CategoryTreeNode[];
};

interface CategoryResponse {
  success: boolean;
  message?: string;
  category?: ICategory;
  categories?: (ICategory & { productCount?: number })[];
  error?: unknown;
}

interface CategoryTreeResponse {
  success: boolean;
  categories?: CategoryTreeNode[];
  message?: string;
  error?: unknown;
}

interface CategoryWithProductsResponse {
  success: boolean;
  category?: ICategory;
  products?: unknown[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: unknown;
}

/**
 * Get all categories with optional filtering
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with categories array and product counts
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { isActive, parentId } = req.query;

    const filter: Record<string, unknown> = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (parentId) {
      filter.parentId = parentId;
    }

    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .lean();

    // Calculate product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          categoryId: category._id,
          isActive: true 
        });
        return {
          ...category,
          productCount
        };
      })
    );

    res.json({ 
      success: true,
      categories: categoriesWithCount 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
/**
 * Get a single category by ID
 * @param req - Express request object with category ID in params
 * @param res - Express response object
 * @returns JSON response with category data
 */
export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid category ID format' 
      });
    }
    
    const category = await Category.findById(id).lean();
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    res.json({ 
      success: true,
      category 
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
/**
 * Get a category by slug
 * @param req - Express request object with category slug in params
 * @param res - Express response object
 * @returns JSON response with category data
 */
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { slug } = req.params;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid slug parameter' 
      });
    }
    
    // Normalize slug to lowercase to match schema (slug field has lowercase: true)
    const normalizedSlug = slug.toLowerCase().trim();
    
    console.log('Looking for category with slug:', normalizedSlug);
    
    // Try to find category by slug (case-insensitive search)
    const category = await Category.findOne({ 
      $or: [
        { slug: normalizedSlug },
        { slug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') } }
      ],
      isActive: true
    }).lean();
    
    if (!category) {
      console.log('Category not found. Available slugs:', 
        await Category.find({ isActive: true }).select('slug name').lean()
      );
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    console.log('Category found:', category.name, 'with slug:', category.slug);
    res.json({ 
      success: true,
      category 
    });
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
/**
 * Create a new category
 * @param req - Express request object with category data in body
 * @param res - Express response object
 * @returns JSON response with created category data
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
  const {
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      slug,
      image, // Legacy field
      cloudinaryImages,
      bannerImage, // Legacy field
      cloudinaryBannerImages,
      isActive,
      parentId,
      // Additional fields
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      sortOrder,
      isFeatured,
      isVisible,
      displayType,
      color,
      icon,
      seoUrl,
      canonicalUrl,
      schemaMarkup
    } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and slug are required' 
      });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ 
        success: false,
        message: 'Slug must contain only lowercase letters, numbers, and hyphens' 
      });
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'Slug already exists' 
      });
    }

    // Validate parent category if provided
    if (parentId) {
      if (parentId.length !== 24) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid parent category ID format' 
        });
      }
      
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ 
          success: false,
          message: 'Parent category not found' 
        });
      }
    }

    const category = new Category({
      name: name.trim(),
      nameEn: nameEn?.trim(),
      nameJa: nameJa?.trim(),
      description: description?.trim(),
      descriptionEn: descriptionEn?.trim(),
      descriptionJa: descriptionJa?.trim(),
      slug: slug.trim(),
      // Legacy image fields
      image: image?.trim(),
      bannerImage: bannerImage?.trim(),
      // Cloudinary image fields
      cloudinaryImages: cloudinaryImages || [],
      cloudinaryBannerImages: cloudinaryBannerImages || [],
      isActive: isActive !== undefined ? isActive : true,
      parentId: parentId && parentId !== "" ? parentId : undefined,
      // Additional fields
      status: status || 'active',
      metaTitle: metaTitle?.trim(),
      metaDescription: metaDescription?.trim(),
      metaKeywords: metaKeywords?.trim(),
      sortOrder: sortOrder || 0,
      isFeatured: isFeatured || false,
      isVisible: isVisible !== undefined ? isVisible : true,
      displayType: displayType || 'grid',
      color: color || '#3B82F6',
      icon: icon?.trim(),
      seoUrl: seoUrl?.trim(),
      canonicalUrl: canonicalUrl?.trim(),
      schemaMarkup: schemaMarkup?.trim()
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
/**
 * Update an existing category
 * @param req - Express request object with category ID in params and update data in body
 * @param res - Express response object
 * @returns JSON response with updated category data
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
    const updateData = req.body;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid category ID format' 
      });
    }

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // Validate slug format if being updated
    if (updateData.slug) {
      if (!/^[a-z0-9-]+$/.test(updateData.slug)) {
        return res.status(400).json({ 
          success: false,
          message: 'Slug must contain only lowercase letters, numbers, and hyphens' 
        });
      }

      // Check if slug already exists (excluding current category)
      const slugExists = await Category.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: id } 
      });
      if (slugExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Slug already exists' 
        });
      }
    }

    // Validate parent category if being updated
    if (updateData.parentId) {
      if (updateData.parentId.length !== 24) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid parent category ID format' 
        });
      }

      const parentCategory = await Category.findById(updateData.parentId);
      if (!parentCategory) {
        return res.status(400).json({ 
          success: false,
          message: 'Parent category not found' 
        });
      }

      // Prevent circular reference
      if (updateData.parentId === id) {
        return res.status(400).json({ 
          success: false,
          message: 'Category cannot be its own parent' 
        });
      }

      // Check for circular reference in hierarchy
      const checkCircularReference = async (categoryId: string, targetId: string): Promise<boolean> => {
        const category = await Category.findById(categoryId);
        if (!category || !category.parentId) return false;
        if (category.parentId.toString() === targetId) return true;
        return checkCircularReference(category.parentId.toString(), targetId);
      };

      if (await checkCircularReference(updateData.parentId, id)) {
        return res.status(400).json({ 
          success: false,
          message: 'Cannot set parent: would create circular reference' 
        });
      }
    }

    // Clean and prepare update data
    const cleanedUpdateData: Record<string, unknown> = {};
    if (updateData.name) cleanedUpdateData.name = updateData.name.trim();
    if (updateData.nameEn) cleanedUpdateData.nameEn = updateData.nameEn.trim();
    if (updateData.nameJa) cleanedUpdateData.nameJa = updateData.nameJa.trim();
    if (updateData.description) cleanedUpdateData.description = updateData.description.trim();
    if (updateData.descriptionEn) cleanedUpdateData.descriptionEn = updateData.descriptionEn.trim();
    if (updateData.descriptionJa) cleanedUpdateData.descriptionJa = updateData.descriptionJa.trim();
    if (updateData.slug) cleanedUpdateData.slug = updateData.slug.trim();
    if (updateData.image) cleanedUpdateData.image = updateData.image.trim();
    if (updateData.isActive !== undefined) cleanedUpdateData.isActive = updateData.isActive;
    if (updateData.parentId !== undefined) cleanedUpdateData.parentId = updateData.parentId;

    const category = await Category.findByIdAndUpdate(
      id,
      cleanedUpdateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
/**
 * Delete a category
 * @param req - Express request object with category ID in params
 * @param res - Express response object
 * @returns JSON response with deletion confirmation
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
    
    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid category ID format' 
      });
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete category with ${productCount} products. Please move or delete products first.` 
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentId: id });
    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete category with ${subcategoryCount} subcategories. Please delete subcategories first.` 
      });
    }
    
    await Category.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
/**
 * Get category tree (hierarchical structure)
 * @param req - Express request object with optional isActive filter
 * @param res - Express response object
 * @returns JSON response with hierarchical category tree
 */
export const getCategoryTree = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { isActive } = req.query;

    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const categories = await Category.find(filter).sort({ name: 1 }).lean();

    // Build tree structure with proper typing
    const buildTree = (parentId: string | null = null): CategoryTreeNode[] => {
      return categories
        .filter(cat => cat.parentId?.toString() === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(cat._id.toString())
        } as unknown as CategoryTreeNode));
    };

    const categoryTree = buildTree();

    res.json({ 
      success: true,
      categories: categoryTree 
    });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
/**
 * Get category with its products (paginated)
 * @param req - Express request object with category ID in params and pagination query params
 * @param res - Express response object
 * @returns JSON response with category data, products array, and pagination info
 */
export const getCategoryWithProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid category ID format' 
      });
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    const products = await Product.find({ 
      categoryId: id, 
      isActive: true 
    })
      .populate('categoryId', 'name nameEn nameJa slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments({ 
      categoryId: id, 
      isActive: true 
    });

    res.json({
      success: true,
      category,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching category with products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Upload category images
 * @param req - Express request object with category ID in params and images in files
 * @param res - Express response object
 * @returns JSON response with upload result
 */
export const uploadCategoryImagesController = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Validate category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Upload images to Cloudinary
    const uploadResult = await CloudinaryService.uploadCategoryImages(files);
    if (!uploadResult.success || !uploadResult.data) {
      return res.status(400).json({
        success: false,
        message: 'Failed to upload images',
        errors: uploadResult.errors
      });
    }

    // Add new images to category
    category.cloudinaryImages = category.cloudinaryImages || [];
    category.cloudinaryImages.push(...uploadResult.data);
    await category.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: uploadResult.data,
      category
    });
  } catch (error) {
    console.error('Category image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Delete category image
 * @param req - Express request object with category ID and image public ID in params
 * @param res - Express response object
 * @returns JSON response with deletion result
 */
export const deleteCategoryImageController = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id, publicId } = req.params;

    // Validate category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Find and remove image from category
    const imageIndex = category.cloudinaryImages?.findIndex(img => img.publicId === publicId);
    if (imageIndex === undefined || imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in category'
      });
    }

    // Delete from Cloudinary
    const deleteResult = await CloudinaryService.deleteFile(publicId);
    if (!deleteResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete image from Cloudinary',
        error: deleteResult.error
      });
    }

    // Remove from category
    category.cloudinaryImages?.splice(imageIndex, 1);
    await category.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      category
    });
  } catch (error) {
    console.error('Category image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});