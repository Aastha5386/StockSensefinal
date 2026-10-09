import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryItem {
  product: string;
  sku: string;
  destinationBay: string;
  quantity: string;
  spec?: string;
  unitPrice?: number;
}

export interface IDelivery extends Document {
  id: string;
  timestampUtc: string;
  ledgerId: string;
  statusCode: string;
  stageName: string;
  status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'LATE' | 'CANCELLED';
  customerName?: string;
  deliveryAddress: string;
  coordinates: string;
  operationType: string;
  routing: string;
  pickVerified: boolean;
  pickVerifiedTime?: string;
  packInspected: boolean;
  packInspectedTime?: string;
  grossMass: string;
  netVolume: string;
  items: IDeliveryItem[];
  validatedAt?: Date;
  validatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryItemSchema = new Schema<IDeliveryItem>(
  {
    product: { type: String, required: true },
    sku: { type: String, required: true },
    destinationBay: { type: String, default: 'STAGE-NORTH' },
    quantity: { type: String, required: true },
    spec: { type: String, default: '' },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const DeliverySchema: Schema<IDelivery> = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    timestampUtc: { type: String, default: () => new Date().toISOString() },
    ledgerId: { type: String, required: true },
    statusCode: { type: String, default: 'ACT-04' },
    stageName: { type: String, default: 'MARITIME-OUTBOUND' },
    status: {
      type: String,
      enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'LATE', 'CANCELLED'],
      default: 'WAITING',
    },
    customerName: { type: String, default: 'Customer Express Logistics' },
    deliveryAddress: { type: String, default: 'PORT TERMINAL 4' },
    coordinates: { type: String, default: '45.1092° N, 122.3811° W' },
    operationType: { type: String, default: 'CONTAINER FREIGHT DISPATCH' },
    routing: { type: String, default: 'DIRECT LOGISTICS CORRIDOR' },
    pickVerified: { type: Boolean, default: false },
    pickVerifiedTime: { type: String },
    packInspected: { type: Boolean, default: false },
    packInspectedTime: { type: String },
    grossMass: { type: String, default: '1,200 KG' },
    netVolume: { type: String, default: '18.4 M³' },
    items: [DeliveryItemSchema],
    validatedAt: { type: Date },
    validatedBy: { type: String },
  },
  { timestamps: true }
);

export const Delivery = mongoose.model<IDelivery>('Delivery', DeliverySchema);
