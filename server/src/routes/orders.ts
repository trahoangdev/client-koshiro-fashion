import express from 'express';
import {
  getOrders,
  getUserOrders,
  getOrder,
  createOrder,
  createGuestOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  trackOrder,
  trackOrderByEmail
} from '../controllers/orderController';
import { authenticateToken, requireAdmin, requireCustomer, requireCustomerOrAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/track/:orderNumber', trackOrder);
router.get('/track-email/:email', trackOrderByEmail);
router.post('/guest', createGuestOrder); // Guest order (no authentication)

// Customer routes (protected)
router.get('/my-orders', authenticateToken, requireCustomer, getUserOrders);
router.get('/my-orders/:id', authenticateToken, requireCustomer, getOrder);
router.post('/', authenticateToken, requireCustomer, createOrder);
router.put('/:id/cancel', authenticateToken, requireCustomerOrAdmin, cancelOrder);

// Admin routes (protected)
router.get('/', authenticateToken, requireAdmin, getOrders);
router.get('/stats', authenticateToken, requireAdmin, getOrderStats);
router.get('/:id', authenticateToken, requireAdmin, getOrder);
router.post('/admin', authenticateToken, requireAdmin, createOrder);
router.put('/:id', authenticateToken, requireAdmin, updateOrder);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router; 