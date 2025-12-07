import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getApiKeys,
  getApiKey,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  regenerateApiKey,
  getIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  syncIntegration,
  getApiLogs,
  getApiStats,
  clearApiLogs,
  exportApiKeys,
  importApiKeys
} from '../controllers/apiKeyController';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// API Keys routes
router.get('/keys', getApiKeys);
router.get('/keys/:id', getApiKey);
router.post('/keys', createApiKey);
router.put('/keys/:id', updateApiKey);
router.delete('/keys/:id', deleteApiKey);
router.post('/keys/:id/regenerate', regenerateApiKey);

// Integrations routes
router.get('/integrations', getIntegrations);
router.post('/integrations', createIntegration);
router.put('/integrations/:id', updateIntegration);
router.delete('/integrations/:id', deleteIntegration);
router.post('/integrations/:id/test', testIntegration);
router.post('/integrations/:id/sync', syncIntegration);

// API Logs routes
router.get('/logs', getApiLogs);
router.get('/stats', getApiStats);
router.delete('/logs', clearApiLogs);

// Export/Import routes
router.get('/export', exportApiKeys);
router.post('/import', importApiKeys);

export default router;
