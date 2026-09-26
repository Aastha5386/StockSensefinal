export type OperationalStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'LATE' | 'CANCELLED';

export interface Product {
  sku: string;
  name: string;
  category: string;
  unit: string;
  onHand: number;
  freeToUse: number;
  location?: string;
  minThreshold?: number;
}

export interface ReceiptLineItem {
  product: string;
  spec?: string;
  sku: string;
  unit: string;
  quantity: number;
}

export interface Receipt {
  id: string; // e.g. RCV-2023-88401 or WH/IN/0001
  reference: string;
  contact: string;
  carrierCode?: string;
  toLocation: string;
  scheduledUtc: string;
  status: OperationalStatus;
  clearanceStatus?: string;
  containerSeal?: string;
  inspectionLevel?: string;
  totalPieces?: string;
  tallyWeight?: string;
  items: ReceiptLineItem[];
  receiverNotes?: string;
  custodialHandover?: {
    dispatchChief: string;
    terminalAuth: string;
    sealStatus: string;
  };
}

export interface DeliveryLineItem {
  product: string;
  spec?: string;
  sku: string;
  destinationBay: string;
  quantity: string;
}

export interface OutboundDelivery {
  id: string; // e.g. WH/OUT/0042
  timestampUtc: string;
  ledgerId: string;
  statusCode: string;
  stageName: string;
  status: OperationalStatus;
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
  items: DeliveryLineItem[];
}

export interface StockAdjustmentItem {
  id: string;
  sku: string;
  name: string;
  spec: string;
  location: string;
  systemQuantity: number;
  countedQuantity: number;
}

export interface MoveRecord {
  reference: string;
  timestampUtc: string;
  carrier: string;
  carrierTag?: string;
  from: string;
  to: string;
  quantity: string;
  isPositive: boolean;
  status: OperationalStatus;
  kind: 'inbound' | 'outbound' | 'internal';
}

export interface WarehouseSite {
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
}

export interface SubLocationZone {
  code: string;
  parentWarehouse: string;
  name: string;
  capacity: string;
  status: string;
  statusColor?: string;
}

export interface UserProfile {
  name: string;
  operatorId: string;
  email: string;
  role: string;
  dept: string;
  station: string;
  shiftDispatch: string;
  logSignature: string;
  avatarUrl: string;
}

export type ViewScreen = 
  | 'login'
  | 'dashboard'
  | 'products'
  | 'receipts'
  | 'receipt-detail'
  | 'delivery-detail'
  | 'transfers'
  | 'move-history'
  | 'settings'
  | 'profile-station';
