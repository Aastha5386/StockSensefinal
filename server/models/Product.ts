import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  category: string;
  unit: string;
  onHand: number;
  freeToUse: number;
  location?: string;
  minThreshold: number;
  maxThreshold?: number;
  costPrice: number;
  sellingPrice: number;
  barcode: string;
  supplierName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    unit: {
      type: String,
      default: 'PCS',
    },
    onHand: {
      type: Number,
      default: 0,
    },
    freeToUse: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: 'WH-A / BAY-01',
    },
    minThreshold: {
      type: Number,
      default: 50,
    },
    maxThreshold: {
      type: Number,
      default: 1000,
    },
    costPrice: {
      type: Number,
      default: 10,
    },
    sellingPrice: {
      type: Number,
      default: 18,
    },
    barcode: {
      type: String,
      default: '',
    },
    supplierName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
