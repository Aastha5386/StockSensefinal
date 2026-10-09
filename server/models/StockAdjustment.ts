import mongoose, { Schema, Document } from 'mongoose';

export interface IStockAdjustment extends Document {
  id: string;
  sku: string;
  name: string;
  spec: string;
  location: string;
  systemQuantity: number;
  countedQuantity: number;
  status: 'PENDING' | 'COMMITTED';
  notes?: string;
  countedBy?: string;
  committedAt?: Date;
  createdAt: Date;
}

const StockAdjustmentSchema: Schema<IStockAdjustment> = new Schema(
  {
    id: { type: String, required: true, unique: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    spec: { type: String, default: '' },
    location: { type: String, default: 'WH-A / BAY-01' },
    systemQuantity: { type: Number, required: true },
    countedQuantity: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'COMMITTED'], default: 'PENDING' },
    notes: { type: String, default: '' },
    countedBy: { type: String, default: 'Operator' },
    committedAt: { type: Date },
  },
  { timestamps: true }
);

export const StockAdjustment = mongoose.model<IStockAdjustment>('StockAdjustment', StockAdjustmentSchema);
