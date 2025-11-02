import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  }
});

const cartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: false // Remove unique from schema, use index instead
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// Indexes for better performance
cartSchema.index({ userId: 1 }, { unique: true }); // Already unique, but explicit index
cartSchema.index({ createdAt: -1 });
cartSchema.index({ updatedAt: -1 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema); 