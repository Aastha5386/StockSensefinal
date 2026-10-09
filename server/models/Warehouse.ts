import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  code: string;
  regId: string;
  title: string;
  spec: string;
  baysDetail: string;
  address: string;
  dockAccess: string;
  zoneCount: string;
  utilization: string;
  status: 'OPERATIONAL' | 'MONITORED' | 'STANDBY';
  createdAt: Date;
}

const WarehouseSchema: Schema<IWarehouse> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    regId: { type: String, default: 'FAC-REG' },
    title: { type: String, required: true },
    spec: { type: String, default: 'General Storage' },
    baysDetail: { type: String, default: '12 BAYS' },
    address: { type: String, default: 'Port Logistics Hub' },
    dockAccess: { type: String, default: 'DOCKS 1-4' },
    zoneCount: { type: String, default: '8 ZONES' },
    utilization: { type: String, default: '75%' },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'MONITORED', 'STANDBY'],
      default: 'OPERATIONAL',
    },
  },
  { timestamps: true }
);

export const Warehouse = mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
