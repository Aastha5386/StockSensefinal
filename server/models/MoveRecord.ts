import mongoose, { Schema, Document } from 'mongoose';

export interface IMoveRecord extends Document {
  reference: string;
  timestampUtc: string;
  carrier: string;
  carrierTag?: string;
  from: string;
  to: string;
  quantity: string;
  isPositive: boolean;
  status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'LATE' | 'CANCELLED';
  kind: 'inbound' | 'outbound' | 'internal' | 'adjustment';
  productSku?: string;
  productName?: string;
  balanceAfter?: number;
  operator?: string;
  notes?: string;
  createdAt: Date;
}

const MoveRecordSchema: Schema<IMoveRecord> = new Schema(
  {
    reference: { type: String, required: true, index: true },
    timestampUtc: { type: String, default: () => new Date().toISOString() },
    carrier: { type: String, default: 'Internal Logistics' },
    carrierTag: { type: String, default: 'MOV-LOG' },
    from: { type: String, required: true },
    to: { type: String, required: true },
    quantity: { type: String, required: true },
    isPositive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'LATE', 'CANCELLED'],
      default: 'DONE',
    },
    kind: {
      type: String,
      enum: ['inbound', 'outbound', 'internal', 'adjustment'],
      default: 'internal',
    },
    productSku: { type: String, default: '' },
    productName: { type: String, default: '' },
    balanceAfter: { type: Number },
    operator: { type: String, default: 'SYSTEM' },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MoveRecord = mongoose.model<IMoveRecord>('MoveRecord', MoveRecordSchema);
