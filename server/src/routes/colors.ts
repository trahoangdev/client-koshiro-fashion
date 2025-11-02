import express from 'express';
import {
  getColors,
  getColor,
  createColor,
  updateColor,
  deleteColor,
  getColorByName,
  getColorHex
} from '../controllers/colorController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
// Note: Rate limiting is already applied globally in index.ts via app.use('/api', apiLimiter)
// No need to apply it again here to avoid double counting

const router = express.Router();

// Public routes (rate limiting applied globally)
router.get('/', getColors);
router.get('/name/:name', getColorByName);
router.get('/hex/:name', getColorHex);
router.get('/:id', getColor);

// Admin routes (protected, rate limiting applied globally)
router.post('/', authenticateToken, requireAdmin, createColor);
router.put('/:id', authenticateToken, requireAdmin, updateColor);
router.delete('/:id', authenticateToken, requireAdmin, deleteColor);

export default router;

