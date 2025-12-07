import { Request, Response } from 'express';
import crypto from 'crypto';
import ApiKey, { IApiKey } from '../models/ApiKey';
import Integration, { IIntegration } from '../models/Integration';
import ApiLog, { IApiLog } from '../models/ApiLog';

// API Key Management
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const apiKeys = await ApiKey.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ApiKey.countDocuments(filter);

    res.json({
      success: true,
      data: {
        apiKeys,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API keys',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id).populate('createdBy', 'name email');
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    res.json({
      success: true,
      data: apiKey
    });
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API key',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions, rateLimit, expiresAt } = req.body;
    const createdBy = (req as Request & { user: { id: string } }).user.id;

    // Validation
    if (!name || !description || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and permissions are required'
      });
    }

    if (permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one permission is required'
      });
    }

    // Check for duplicate name
    const existingKey = await ApiKey.findOne({ name });
    if (existingKey) {
      return res.status(409).json({
        success: false,
        message: 'API key with this name already exists'
      });
    }

    // Rate limiting: Check if user has created too many keys recently
    const recentKeys = await ApiKey.countDocuments({
      createdBy,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    if (recentKeys >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Maximum 10 API keys per hour.'
      });
    }

    // Generate API key
    const key = 'kf_' + crypto.randomBytes(32).toString('hex');

    const apiKey = new ApiKey({
      name,
      description,
      permissions,
      rateLimit: rateLimit || 1000,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy
    });

    await apiKey.save();

    res.status(201).json({
      success: true,
      data: apiKey,
      message: 'API key created successfully'
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating API key',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, rateLimit, isActive, expiresAt } = req.body;

    const apiKey = await ApiKey.findById(id);
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    apiKey.name = name || apiKey.name;
    apiKey.description = description || apiKey.description;
    apiKey.permissions = permissions || apiKey.permissions;
    apiKey.rateLimit = rateLimit || apiKey.rateLimit;
    apiKey.isActive = isActive !== undefined ? isActive : apiKey.isActive;
    apiKey.expiresAt = expiresAt ? new Date(expiresAt) : apiKey.expiresAt;

    await apiKey.save();

    res.json({
      success: true,
      data: apiKey,
      message: 'API key updated successfully'
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating API key',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    await ApiKey.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting API key',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const regenerateApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    // Generate new key
    apiKey.key = 'kf_' + crypto.randomBytes(32).toString('hex');
    apiKey.usageCount = 0;
    apiKey.lastUsed = undefined;

    await apiKey.save();

    res.json({
      success: true,
      data: apiKey,
      message: 'API key regenerated successfully'
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating API key',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Integration Management
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', type = 'all', status = 'all' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (type !== 'all') {
      filter.type = type;
    }
    if (status !== 'all') {
      filter.status = status;
    }

    const integrations = await Integration.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Integration.countDocuments(filter);

    res.json({
      success: true,
      data: {
        integrations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching integrations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createIntegration = async (req: Request, res: Response) => {
  try {
    const { name, nameEn, nameJa, type, provider, description, descriptionEn, descriptionJa, config, webhookUrl, webhookSecret } = req.body;
    const createdBy = (req as Request & { user: { id: string } }).user.id;

    // Validation
    if (!name || !type || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and provider are required'
      });
    }

    // Validate type
    const validTypes = ['payment', 'shipping', 'email', 'sms', 'analytics', 'social', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid integration type'
      });
    }

    // Check for duplicate name
    const existingIntegration = await Integration.findOne({ name });
    if (existingIntegration) {
      return res.status(409).json({
        success: false,
        message: 'Integration with this name already exists'
      });
    }

    // Validate config if provided
    if (config && typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Config must be a valid JSON object'
      });
    }

    const integration = new Integration({
      name,
      nameEn,
      nameJa,
      type,
      provider,
      description,
      descriptionEn,
      descriptionJa,
      config: config || {},
      webhookUrl,
      webhookSecret,
      createdBy
    });

    await integration.save();

    res.status(201).json({
      success: true,
      data: integration,
      message: 'Integration created successfully'
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating integration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const integration = await Integration.findById(id);
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }

    Object.assign(integration, updateData);
    await integration.save();

    res.json({
      success: true,
      data: integration,
      message: 'Integration updated successfully'
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating integration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const integration = await Integration.findById(id);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }

    await Integration.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting integration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const testIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const integration = await Integration.findById(id);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }

    // Mock test connection - in real implementation, this would test the actual integration
    const result = integration.status === 'active';

    res.json({
      success: true,
      data: { success: result },
      message: result ? 'Connection test successful' : 'Connection test failed'
    });
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing integration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const syncIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const integration = await Integration.findById(id);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }

    // Mock sync operation - in real implementation, this would sync with external service
    const result = integration.status === 'active';
    
    // Update lastSync timestamp
    integration.lastSync = new Date();
    await integration.save();

    res.json({
      success: true,
      data: { success: result },
      message: result ? 'Sync completed successfully' : 'Sync failed'
    });
  } catch (error) {
    console.error('Error syncing integration:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing integration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API Logs Management
export const getApiLogs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      apiKey, 
      endpoint, 
      statusCode, 
      startDate, 
      endDate 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const filter: Record<string, unknown> = {};
    if (apiKey) filter.apiKey = apiKey;
    if (endpoint) filter.endpoint = { $regex: endpoint, $options: 'i' };
    if (statusCode) filter.statusCode = Number(statusCode);
    if (startDate || endDate) {
      filter.timestamp = {} as Record<string, unknown>;
      if (startDate) (filter.timestamp as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (filter.timestamp as Record<string, unknown>).$lte = new Date(endDate as string);
    }

    const logs = await ApiLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ApiLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching API logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getApiStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage: Record<string, unknown> = {};
    if (startDate && endDate) {
      matchStage.timestamp = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }

    const stats = await ApiLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successRequests: {
            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
          },
          errorRequests: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' },
          uniqueApiKeys: { $addToSet: '$apiKey' },
          uniqueEndpoints: { $addToSet: '$endpoint' }
        }
      },
      {
        $project: {
          totalRequests: 1,
          successRequests: 1,
          errorRequests: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successRequests', '$totalRequests'] },
              100
            ]
          },
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          uniqueApiKeys: { $size: '$uniqueApiKeys' },
          uniqueEndpoints: { $size: '$uniqueEndpoints' }
        }
      }
    ]);

    // Get API key stats
    const apiKeyStats = await ApiKey.aggregate([
      {
        $group: {
          _id: null,
          totalKeys: { $sum: 1 },
          activeKeys: { $sum: { $cond: ['$isActive', 1, 0] } },
          expiredKeys: { $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] } }
        }
      }
    ]);

    // Get integration stats
    const integrationStats = await Integration.aggregate([
      {
        $group: {
          _id: null,
          totalIntegrations: { $sum: 1 },
          activeIntegrations: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          errorIntegrations: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        apiStats: stats[0] || {
          totalRequests: 0,
          successRequests: 0,
          errorRequests: 0,
          successRate: 0,
          avgResponseTime: 0,
          uniqueApiKeys: 0,
          uniqueEndpoints: 0
        },
        apiKeyStats: apiKeyStats[0] || {
          totalKeys: 0,
          activeKeys: 0,
          expiredKeys: 0
        },
        integrationStats: integrationStats[0] || {
          totalIntegrations: 0,
          activeIntegrations: 0,
          errorIntegrations: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching API stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const clearApiLogs = async (req: Request, res: Response) => {
  try {
    const { olderThan } = req.body;
    const cutoffDate = olderThan ? new Date(olderThan) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago

    const result = await ApiLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: `${result.deletedCount} logs deleted successfully`
    });
  } catch (error) {
    console.error('Error clearing API logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing API logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export/Import Management
export const exportApiKeys = async (req: Request, res: Response) => {
  try {
    const { format = 'json', includeInactive = false } = req.query;
    
    const filter: Record<string, unknown> = {};
    if (!includeInactive) {
      filter.isActive = true;
    }

    const apiKeys = await ApiKey.find(filter)
      .populate('createdBy', 'name email')
      .select('-key') // Exclude sensitive key data
      .sort({ createdAt: -1 });

    const integrations = await Integration.find({})
      .populate('createdBy', 'name email')
      .select('-config.webhookSecret') // Exclude sensitive config
      .sort({ createdAt: -1 });

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      apiKeys: apiKeys.map(key => ({
        name: key.name,
        description: key.description,
        permissions: key.permissions,
        rateLimit: key.rateLimit,
        isActive: key.isActive,
        expiresAt: key.expiresAt,
        createdBy: key.createdBy,
        createdAt: key.createdAt.toISOString()
      })),
      integrations: integrations.map(integration => ({
        name: integration.name,
        nameEn: integration.nameEn,
        nameJa: integration.nameJa,
        type: integration.type,
        provider: integration.provider,
        description: integration.description,
        descriptionEn: integration.descriptionEn,
        descriptionJa: integration.descriptionJa,
        status: integration.status,
        config: integration.config,
        webhookUrl: integration.webhookUrl,
        createdAt: integration.createdAt.toISOString(),
        createdBy: integration.createdBy
      }))
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="api-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="api-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const importApiKeys = async (req: Request, res: Response) => {
  try {
    const { data, overwrite = false } = req.body;
    const createdBy = (req as Request & { user: { id: string } }).user.id;

    if (!data || !data.apiKeys || !Array.isArray(data.apiKeys)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid import data format. Expected data with apiKeys array.'
      });
    }

    // Validate data structure
    if (data.apiKeys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No API keys found in import data'
      });
    }

    // Validate each API key
    for (const keyData of data.apiKeys) {
      if (!keyData.name || !keyData.description || !keyData.permissions) {
        return res.status(400).json({
          success: false,
          message: `Invalid API key data: missing required fields for key "${keyData.name || 'unknown'}"`
        });
      }
    }

    const results = {
      apiKeys: { created: 0, updated: 0, errors: 0 },
      integrations: { created: 0, updated: 0, errors: 0 },
      errors: [] as string[]
    };

    // Import API Keys
    for (const keyData of data.apiKeys) {
      try {
        const existingKey = await ApiKey.findOne({ name: keyData.name });
        
        if (existingKey && !overwrite) {
          results.apiKeys.errors++;
          results.errors.push(`API Key "${keyData.name}" already exists`);
          continue;
        }

        if (existingKey && overwrite) {
          // Update existing key
          Object.assign(existingKey, {
            ...keyData,
            createdBy,
            key: existingKey.key // Keep existing key
          });
          await existingKey.save();
          results.apiKeys.updated++;
        } else {
          // Create new key
          const newKey = new ApiKey({
            ...keyData,
            createdBy,
            key: 'kf_' + crypto.randomBytes(32).toString('hex')
          });
          await newKey.save();
          results.apiKeys.created++;
        }
      } catch (error) {
        results.apiKeys.errors++;
        results.errors.push(`Error processing API Key "${keyData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import Integrations
    if (data.integrations && Array.isArray(data.integrations)) {
      for (const integrationData of data.integrations) {
        try {
          const existingIntegration = await Integration.findOne({ name: integrationData.name });
          
          if (existingIntegration && !overwrite) {
            results.integrations.errors++;
            results.errors.push(`Integration "${integrationData.name}" already exists`);
            continue;
          }

          if (existingIntegration && overwrite) {
            // Update existing integration
            Object.assign(existingIntegration, {
              ...integrationData,
              createdBy
            });
            await existingIntegration.save();
            results.integrations.updated++;
          } else {
            // Create new integration
            const newIntegration = new Integration({
              ...integrationData,
              createdBy
            });
            await newIntegration.save();
            results.integrations.created++;
          }
        } catch (error) {
          results.integrations.errors++;
          results.errors.push(`Error processing Integration "${integrationData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Import completed. API Keys: ${results.apiKeys.created} created, ${results.apiKeys.updated} updated, ${results.apiKeys.errors} errors. Integrations: ${results.integrations.created} created, ${results.integrations.updated} updated, ${results.integrations.errors} errors.`
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to convert data to CSV
interface ExportData {
  apiKeys: Array<{
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    createdBy: string | { name: string };
  }>;
  integrations: Array<{
    name: string;
    description: string;
    status: string;
    createdAt: string;
    createdBy: string | { name: string };
  }>;
}

const convertToCSV = (data: ExportData) => {
  const headers = ['Type', 'Name', 'Description', 'Status', 'Created By', 'Created At'];
  const rows: string[][] = [];

  // Add API Keys
  data.apiKeys.forEach((key) => {
    const createdByName = typeof key.createdBy === 'string' 
      ? key.createdBy 
      : key.createdBy?.name || 'Unknown';
    
    rows.push([
      'API Key',
      key.name,
      key.description,
      key.isActive ? 'Active' : 'Inactive',
      createdByName,
      new Date(key.createdAt).toISOString()
    ]);
  });

  // Add Integrations
  data.integrations.forEach((integration) => {
    const createdByName = typeof integration.createdBy === 'string' 
      ? integration.createdBy 
      : integration.createdBy?.name || 'Unknown';
    
    rows.push([
      'Integration',
      integration.name,
      integration.description,
      integration.status,
      createdByName,
      new Date(integration.createdAt).toISOString()
    ]);
  });

  const csvContent = [headers, ...rows]
    .map((row: string[]) => row.map((field: string) => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
};
