import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
  uploadProductImages,
  deleteProductImages
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { authenticateApiKey, requireApiPermission } from '../middleware/apiKeyAuth';
import { uploadProductImages as uploadMiddleware, handleUploadError } from '../middleware/upload';

const router = express.Router();

// Public routes (with optional API key auth)
router.get('/', authenticateApiKey, getProducts);
router.get('/featured', authenticateApiKey, getFeaturedProducts);
router.get('/search', authenticateApiKey, searchProducts);
router.get('/:id', authenticateApiKey, getProduct);

// Admin routes (protected)
router.post('/', authenticateToken, requireAdmin, uploadMiddleware.array('images', 10), handleUploadError, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

// Image management routes
router.post('/upload-images', authenticateToken, requireAdmin, uploadMiddleware.array('images', 10), handleUploadError, uploadProductImages);
router.delete('/delete-images', authenticateToken, requireAdmin, deleteProductImages);

export default router; 