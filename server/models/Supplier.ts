import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categories: string[];
  rating: number;
  leadTimeDays: number;
  paymentTerms: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema<ISupplier> = new Schema(
  {
    code: {
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
    contactPerson: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    categories: {
      type: [String],
      default: ['Raw Materials'],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    leadTimeDays: {
      type: Number,
      default: 5,
    },
    paymentTerms: {
      type: String,
      default: 'Net 30',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'INACTIVE'],
      default: 'ACTIVE',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
