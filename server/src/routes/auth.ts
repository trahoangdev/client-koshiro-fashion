import express from 'express';
import { register, login, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController';
import { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController';
import { googleLogin, facebookLogin } from '../controllers/oauthController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Address routes
router.get('/addresses', authenticateToken, getUserAddresses);
router.post('/addresses', authenticateToken, addAddress);
router.put('/addresses/:id', authenticateToken, updateAddress);
router.delete('/addresses/:id', authenticateToken, deleteAddress);
router.put('/addresses/:id/default', authenticateToken, setDefaultAddress);

export default router; 