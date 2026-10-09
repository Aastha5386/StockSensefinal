export type OperationalStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'LATE' | 'CANCELLED';

export type UserRole = 'admin' | 'inventory_manager' | 'warehouse_staff' | 'purchase_manager';

export interface Product {
  sku: string;
  name: string;
  category: string;
  unit: string;
  onHand: number;
  freeToUse: number;
  location?: string;
  minThreshold?: number;
  maxThreshold?: number;
  costPrice?: number;
  sellingPrice?: number;
  barcode?: string;
  supplierName?: string;
  updatedAt?: string;
}

export interface ReceiptLineItem {
  product: string;
  spec?: string;
  sku: string;
  unit: string;
  quantity: number;
  unitCost?: number;
}

export interface Receipt {
  id: string; // e.g. RCV-2026-88401 or WH/IN/0001
  reference: string;
  contact: string;
  supplierId?: string;
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
  validatedAt?: string;
  validatedBy?: string;
}

export interface DeliveryLineItem {
  product: string;
  spec?: string;
  sku: string;
  destinationBay: string;
  quantity: string;
  unitPrice?: number;
}

export interface OutboundDelivery {
  id: string; // e.g. WH/OUT/0042
  timestampUtc: string;
  ledgerId: string;
  statusCode: string;
  stageName: string;
  status: OperationalStatus;
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
  items: DeliveryLineItem[];
  validatedAt?: string;
  validatedBy?: string;
}

export interface StockAdjustmentItem {
  id: string;
  sku: string;
  name: string;
  spec?: string;
  location: string;
  systemQuantity: number;
  countedQuantity: number;
  status?: 'PENDING' | 'COMMITTED';
  notes?: string;
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
  kind: 'inbound' | 'outbound' | 'internal' | 'adjustment';
  productSku?: string;
  productName?: string;
  balanceAfter?: number;
  operator?: string;
  notes?: string;
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
  id?: string;
  companyName?: string;
  companyId?: string;
  companyEmailOrId?: string;
  name: string;
  operatorId: string;
  email: string;
  role: UserRole | string;
  dept?: string;
  station?: string;
  shiftDispatch?: string;
  logSignature?: string;
  avatarUrl: string;
}

export interface Supplier {
  _id?: string;
  id?: string;
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
}

export interface StockAlert {
  id: string;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  currentStock: number;
  freeToUse: number;
  minThreshold: number;
  maxThreshold: number;
  location: string;
  severity: 'CRITICAL' | 'WARNING';
  suggestedReorderQty: number;
  suggestedSupplier: string;
  supplierEmail: string;
  leadTimeDays: number;
  timestamp: string;
}

export interface SmartReorderInfo {
  headline: string; // e.g. "Reorder 80 units within 3 days"
  recommendedQty: number;
  orderWithinDays: number;
  currentStock: number;
  avgDailySales: number;
  supplierLeadTime: number;
  safetyStock: number;
  reorderPoint: number;
  supplierName?: string;
  leadTimeDays: number;
}

export interface DemandForecast {
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  avgDailyDemand: number;
  predictedDemand7d: number;
  predictedDemand14d: number;
  predictedDemand30d: number;
  monthlyExpectedDemand: number;
  daysUntilStockout: number;
  stockoutRiskDate: string;
  shortageSummaryText: string; // e.g. "Shortage expected in 12 days."
  suggestedReorderQty: number;
  confidence: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  aiInsights: string;
  healthScore: number; // 0-100
  healthStatus: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  smartReorder: SmartReorderInfo;
  projectedTimeline: Array<{ day: number; date: string; projectedStock: number; dailyConsumption: number }>;
}

export interface WhatIfSimulationResult {
  sku: string;
  name: string;
  demandChangePercent: number;
  leadTimeDelayDays: number;
  baselineDailyDemand: number;
  simulatedDailyDemand: number;
  baselineStockoutDays: number;
  simulatedStockoutDays: number;
  simulatedStockoutDate: string;
  daysShifted: number;
  additionalQtyRequired: number;
  estimatedCapitalCost: number;
  riskLevel: 'SEVERE' | 'MODERATE' | 'LOW';
  summaryText: string;
}

export interface InventoryHealthItem {
  sku: string;
  name: string;
  score: number;
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  statusLabel: string;
  currentStock: number;
  minThreshold: number;
  turnoverRatio: number;
}

export interface DeadStockItem {
  sku: string;
  name: string;
  category: string;
  onHand: number;
  unit: string;
  daysInactive: number;
  tiedUpValuation: number;
  suggestedAction: 'DISCOUNT' | 'BUNDLE' | 'TRANSFER' | 'DISCONTINUE';
  actionRationale: string;
}

export interface InventoryAnomaly {
  id: string;
  type: 'UNUSUAL_REDUCTION' | 'RAPID_ADJUSTMENT' | 'OFF_HOURS_ACTIVITY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  sku: string;
  productName: string;
  description: string;
  operator: string;
  timestamp: string;
  detectedQty: number;
}

export interface SmartTransferRecommendation {
  id: string;
  sku: string;
  productName: string;
  fromWarehouse: string;
  toWarehouse: string;
  fromStock: number;
  toStock: number;
  recommendedTransferQty: number;
  rationale: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
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
  | 'suppliers'
  | 'analytics'
  | 'forecast'
  | 'alerts'
  | 'scanner'
  | 'chat'
  | 'settings'
  | 'profile-station'
  | 'settings-users';
