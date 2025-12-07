import mongoose, { Document, Schema } from 'mongoose';

export interface IIntegration extends Document {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  type: 'payment' | 'shipping' | 'email' | 'sms' | 'analytics' | 'social' | 'other';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  config: Record<string, any>;
  webhookUrl?: string;
  webhookSecret?: string;
  lastSync?: Date;
  errorCount: number;
  successCount: number;
  lastError?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const integrationSchema = new Schema<IIntegration>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  nameEn: {
    type: String,
    trim: true,
    maxlength: 100
  },
  nameJa: {
    type: String,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['payment', 'shipping', 'email', 'sms', 'analytics', 'social', 'other']
  },
  provider: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'error', 'pending'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  descriptionEn: {
    type: String,
    trim: true,
    maxlength: 500
  },
  descriptionJa: {
    type: String,
    trim: true,
    maxlength: 500
  },
  config: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  webhookUrl: {
    type: String,
    trim: true,
    maxlength: 500
  },
  webhookSecret: {
    type: String,
    trim: true,
    maxlength: 100
  },
  lastSync: {
    type: Date
  },
  errorCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  lastError: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
integrationSchema.index({ type: 1 });
integrationSchema.index({ status: 1 });
integrationSchema.index({ provider: 1 });
integrationSchema.index({ createdBy: 1 });

// Method to test connection
integrationSchema.methods.testConnection = async function(): Promise<boolean> {
  try {
    // This would be implemented based on the integration type
    // For now, we'll just simulate a test
    this.status = 'active';
    this.lastSync = new Date();
    await this.save();
    return true;
  } catch (error) {
    this.status = 'error';
    this.lastError = error instanceof Error ? error.message : 'Unknown error';
    this.errorCount += 1;
    await this.save();
    return false;
  }
};

// Method to sync data
integrationSchema.methods.sync = async function(): Promise<boolean> {
  try {
    // This would be implemented based on the integration type
    // For now, we'll just simulate a sync
    this.lastSync = new Date();
    this.successCount += 1;
    await this.save();
    return true;
  } catch (error) {
    this.status = 'error';
    this.lastError = error instanceof Error ? error.message : 'Unknown error';
    this.errorCount += 1;
    await this.save();
    return false;
  }
};

export default mongoose.model<IIntegration>('Integration', integrationSchema);
