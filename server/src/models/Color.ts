import mongoose, { Document, Schema } from 'mongoose';

export interface IColor extends Document {
  name: string; // Vietnamese name (primary)
  nameEn?: string; // English name
  nameJa?: string; // Japanese name
  hexValue: string; // Hex color code (e.g., #FF0000)
  isActive: boolean;
  isDefault: boolean; // Whether this is a default color
  usageCount?: number; // Number of products using this color (virtual)
  createdAt: Date;
  updatedAt: Date;
}

const colorSchema = new Schema<IColor>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  nameEn: {
    type: String,
    trim: true,
    index: true
  },
  nameJa: {
    type: String,
    trim: true,
    index: true
  },
  hexValue: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^#[0-9A-Fa-f]{6}$/.test(v) || /^#[0-9A-Fa-f]{3}$/.test(v);
      },
      message: 'Invalid hex color format. Must be #RRGGBB or #RGB'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
colorSchema.index({ name: 1 });
colorSchema.index({ nameEn: 1 });
colorSchema.index({ nameJa: 1 });
colorSchema.index({ hexValue: 1 });
colorSchema.index({ isActive: 1, isDefault: 1 });

// Virtual for usage count (can be calculated separately if needed)
colorSchema.virtual('usageCount').get(function() {
  // This would need to be calculated via aggregation
  // For now, we'll leave it as a placeholder
  return 0;
});

// Method to get color name based on language
colorSchema.methods.getName = function(language: 'vi' | 'en' | 'ja' = 'vi'): string {
  switch (language) {
    case 'vi':
      return this.name;
    case 'en':
      return this.nameEn || this.name;
    case 'ja':
      return this.nameJa || this.name;
    default:
      return this.name;
  }
};

// Static method to find color by name (case-insensitive, any language)
colorSchema.statics.findByName = async function(name: string) {
  return this.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { nameEn: { $regex: new RegExp(`^${name}$`, 'i') } },
      { nameJa: { $regex: new RegExp(`^${name}$`, 'i') } }
    ]
  });
};

// Static method to get all active colors
colorSchema.statics.getActiveColors = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

const Color = mongoose.model<IColor>('Color', colorSchema);

export default Color;

