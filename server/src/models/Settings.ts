import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingZone {
  name: string;
  cost: number;
}

export interface ISettings extends Document {
  // General Settings
  websiteName: string;
  websiteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  timezone: string;
  currency: string;
  language: string;
  
  // Notification Settings
  emailNotifications: boolean;
  orderNotifications: boolean;
  stockNotifications: boolean;
  customerNotifications: boolean;
  adminNotifications: boolean;
  
  // Security Settings
  sessionTimeout: number; // in minutes
  passwordMinLength: number;
  requireTwoFactor: boolean;
  maxLoginAttempts: number;
  enableCaptcha: boolean;
  
  // Payment Settings
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  
  // Shipping Settings
  freeShippingThreshold: number;
  defaultShippingCost: number;
  enableTracking: boolean;
  shippingZones: IShippingZone[];
  
  // Appearance Settings
  theme: string; // 'light' | 'dark' | 'auto'
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  
  // System Settings (legacy fields for backward compatibility)
  enableDarkMode: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const shippingZoneSchema = new Schema<IShippingZone>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const settingsSchema = new Schema<ISettings>({
  // General Settings
  websiteName: {
    type: String,
    required: true,
    default: 'Koshiro Japan Style Fashion',
    trim: true
  },
  websiteDescription: {
    type: String,
    required: true,
    default: 'Thời trang Nhật Bản truyền thống và hiện đại',
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'contact@koshiro-fashion.com',
    trim: true
  },
  contactPhone: {
    type: String,
    required: true,
    default: '+84 123 456 789',
    trim: true
  },
  address: {
    type: String,
    default: '123 Fashion Street, Ho Chi Minh City, Vietnam',
    trim: true
  },
  timezone: {
    type: String,
    default: 'Asia/Ho_Chi_Minh',
    trim: true
  },
  currency: {
    type: String,
    default: 'VND',
    trim: true
  },
  language: {
    type: String,
    default: 'vi',
    enum: ['vi', 'en', 'ja']
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  orderNotifications: {
    type: Boolean,
    default: true
  },
  stockNotifications: {
    type: Boolean,
    default: true
  },
  customerNotifications: {
    type: Boolean,
    default: true
  },
  adminNotifications: {
    type: Boolean,
    default: true
  },
  
  // Security Settings
  sessionTimeout: {
    type: Number,
    default: 30,
    min: 5,
    max: 1440 // 24 hours
  },
  passwordMinLength: {
    type: Number,
    default: 8,
    min: 6,
    max: 128
  },
  requireTwoFactor: {
    type: Boolean,
    default: false
  },
  maxLoginAttempts: {
    type: Number,
    default: 5,
    min: 3,
    max: 10
  },
  enableCaptcha: {
    type: Boolean,
    default: true
  },
  
  // Payment Settings
  stripeEnabled: {
    type: Boolean,
    default: false
  },
  paypalEnabled: {
    type: Boolean,
    default: false
  },
  cashOnDelivery: {
    type: Boolean,
    default: true
  },
  bankTransfer: {
    type: Boolean,
    default: true
  },
  
  // Shipping Settings
  freeShippingThreshold: {
    type: Number,
    default: 1000000,
    min: 0
  },
  defaultShippingCost: {
    type: Number,
    default: 50000,
    min: 0
  },
  enableTracking: {
    type: Boolean,
    default: true
  },
  shippingZones: {
    type: [shippingZoneSchema],
    default: [
      { name: 'Ho Chi Minh City', cost: 30000 },
      { name: 'Hanoi', cost: 50000 },
      { name: 'Other Cities', cost: 80000 }
    ]
  },
  
  // Appearance Settings
  theme: {
    type: String,
    default: 'light',
    enum: ['light', 'dark', 'auto']
  },
  primaryColor: {
    type: String,
    default: '#000000',
    trim: true
  },
  logoUrl: {
    type: String,
    default: '/koshino_logo.png',
    trim: true
  },
  faviconUrl: {
    type: String,
    default: '/favicon.ico',
    trim: true
  },
  
  // System Settings (legacy fields)
  enableDarkMode: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  debugMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema); 