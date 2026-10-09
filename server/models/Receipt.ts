import mongoose, { Schema, Document } from 'mongoose';

export interface IReceiptItem {
  product: string;
  sku: string;
  unit: string;
  quantity: number;
  unitCost?: number;
  spec?: string;
}

export interface IReceipt extends Document {
  id: string;
  reference: string;
  contact: string;
  supplierId?: string;
  carrierCode?: string;
  toLocation: string;
  scheduledUtc: string;
  status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'LATE' | 'CANCELLED';
  clearanceStatus?: string;
  containerSeal?: string;
  inspectionLevel?: string;
  totalPieces?: string;
  tallyWeight?: string;
  receiverNotes?: string;
  custodialHandover?: {
    dispatchChief: string;
    terminalAuth: string;
    sealStatus: string;
  };
  items: IReceiptItem[];
  validatedAt?: Date;
  validatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptItemSchema = new Schema<IReceiptItem>(
  {
    product: { type: String, required: true },
    sku: { type: String, required: true },
    unit: { type: String, default: 'PCS' },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    spec: { type: String, default: '' },
  },
  { _id: false }
);

const ReceiptSchema: Schema<IReceipt> = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    reference: { type: String, required: true },
    contact: { type: String, required: true },
    supplierId: { type: String },
    carrierCode: { type: String, default: 'CARRIER-DEFAULT' },
    toLocation: { type: String, default: 'WH-A / BAY-01' },
    scheduledUtc: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'LATE', 'CANCELLED'],
      default: 'WAITING',
    },
    clearanceStatus: { type: String, default: 'CUSTOMS INSPECTION PENDING' },
    containerSeal: { type: String, default: 'SEAL-VALID-01' },
    inspectionLevel: { type: String, default: 'TIER-1 STANDARD' },
    totalPieces: { type: String, default: '100' },
    tallyWeight: { type: String, default: '250 KG' },
    receiverNotes: { type: String, default: '' },
    custodialHandover: {
      dispatchChief: { type: String, default: 'CHIEF OPERATOR' },
      terminalAuth: { type: String, default: 'AUTH-TERMINAL-01' },
      sealStatus: { type: String, default: 'VERIFIED' },
    },
    items: [ReceiptItemSchema],
    validatedAt: { type: Date },
    validatedBy: { type: String },
  },
  { timestamps: true }
);

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);
