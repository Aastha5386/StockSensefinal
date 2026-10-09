import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'inventory_manager' | 'warehouse_staff' | 'purchase_manager';

export interface IUser extends Document {
  companyName: string;
  companyId: string;
  companyEmailOrId: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  operatorId: string;
  dept?: string;
  station?: string;
  shiftDispatch?: string;
  logSignature?: string;
  avatarUrl?: string;
  createdAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    default: 'FleetFlow StockSense Central',
  },
  companyId: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'fleetflow-stocksense',
    index: true,
  },
  companyEmailOrId: {
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    default: '',
    trim: true,
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'inventory_manager', 'warehouse_staff', 'purchase_manager'],
    default: 'warehouse_staff',
  },
  operatorId: {
    type: String,
    default: () => `OP-${Math.floor(100 + Math.random() * 900)}-K`,
  },
  dept: {
    type: String,
    default: 'DISPATCH-CENTRAL',
  },
  station: {
    type: String,
    default: 'TERMINAL-01 // BAY-01',
  },
  shiftDispatch: {
    type: String,
    default: '35 CRATES',
  },
  logSignature: {
    type: String,
    default: 'VERIFIED',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
