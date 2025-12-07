import mongoose, { Document, Schema } from 'mongoose';

export interface IApiLog extends Document {
  _id: string;
  apiKey: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent?: string;
  requestBody?: any;
  responseBody?: any;
  error?: string;
  timestamp: Date;
}

const apiLogSchema = new Schema<IApiLog>({
  apiKey: {
    type: String,
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true,
    index: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  statusCode: {
    type: Number,
    required: true,
    index: true
  },
  responseTime: {
    type: Number,
    required: true, // in milliseconds
    min: 0
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  requestBody: {
    type: Schema.Types.Mixed
  },
  responseBody: {
    type: Schema.Types.Mixed
  },
  error: {
    type: String,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // We're using custom timestamp field
});

// Indexes for better performance
apiLogSchema.index({ apiKey: 1, timestamp: -1 });
apiLogSchema.index({ endpoint: 1, timestamp: -1 });
apiLogSchema.index({ statusCode: 1, timestamp: -1 });
apiLogSchema.index({ ipAddress: 1, timestamp: -1 });
apiLogSchema.index({ timestamp: -1 });

// TTL index to automatically delete logs older than 30 days
apiLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static method to get logs by date range
apiLogSchema.statics.getLogsByDateRange = function(startDate: Date, endDate: Date, limit = 1000) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Static method to get logs by API key
apiLogSchema.statics.getLogsByApiKey = function(apiKey: string, limit = 100) {
  return this.find({ apiKey })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get error logs
apiLogSchema.statics.getErrorLogs = function(limit = 100) {
  return this.find({
    $or: [
      { statusCode: { $gte: 400 } },
      { error: { $exists: true, $ne: null } }
    ]
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Static method to get stats
apiLogSchema.statics.getStats = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  if (startDate && endDate) {
    matchStage.timestamp = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
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
};

export default mongoose.model<IApiLog>('ApiLog', apiLogSchema);
