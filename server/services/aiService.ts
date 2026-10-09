import { GoogleGenAI } from '@google/genai';
import { Product, IProduct } from '../models/Product';
import { MoveRecord } from '../models/MoveRecord';
import { Receipt } from '../models/Receipt';
import { Delivery } from '../models/Delivery';
import { Supplier } from '../models/Supplier';

// Initialize Google Gemini if API Key is available
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
    console.log('[StockSense AI] Gemini API client initialized.');
  } catch (err: any) {
    console.warn('[StockSense AI] Could not initialize Gemini client:', err.message);
  }
}

export interface SmartReorderResult {
  headline: string;
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

export interface ForecastResult {
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
  shortageSummaryText: string;
  suggestedReorderQty: number;
  confidence: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  aiInsights: string;
  healthScore: number;
  healthStatus: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  smartReorder: SmartReorderResult;
  projectedTimeline: Array<{ day: number; date: string; projectedStock: number; dailyConsumption: number }>;
}

/**
 * Perform statistical & AI demand forecasting for a given product or SKU
 */
export const generateDemandForecast = async (sku: string): Promise<ForecastResult> => {
  const product = await Product.findOne({ sku: sku.toUpperCase() });
  if (!product) {
    throw new Error(`Product with SKU ${sku} not found`);
  }

  // Fetch historical movements for this SKU
  const movements = await MoveRecord.find({
    $or: [{ productSku: product.sku }, { notes: new RegExp(product.sku, 'i') }],
  })
    .sort({ createdAt: -1 })
    .limit(40);

  // Calculate historical outbound consumption rate
  let totalOutboundUnits = 0;
  let outboundCount = 0;

  movements.forEach((m) => {
    const qty = parseInt(m.quantity.replace(/[^0-9]/g, ''), 10) || 0;
    if (m.kind === 'outbound' || (!m.isPositive && qty > 0)) {
      totalOutboundUnits += qty;
      outboundCount++;
    }
  });

  // Base daily demand: derive from moves or synthesize realistic rate based on stock & category
  let avgDailyDemand = 0;
  if (outboundCount > 0) {
    avgDailyDemand = Math.max(1, Math.round(totalOutboundUnits / Math.max(7, outboundCount * 3)));
  } else {
    // Heuristic baseline: ~1.5% to 3.5% of stock consumed daily
    avgDailyDemand = Math.max(2, Math.round(product.onHand * 0.024));
  }

  // Trend determination
  const trend: 'RISING' | 'STABLE' | 'DECLINING' =
    avgDailyDemand > 20 ? 'RISING' : avgDailyDemand < 5 ? 'DECLINING' : 'STABLE';

  // Projections
  const predictedDemand7d = Math.round(avgDailyDemand * 7 * (trend === 'RISING' ? 1.15 : 1.0));
  const predictedDemand14d = Math.round(avgDailyDemand * 14 * (trend === 'RISING' ? 1.2 : 0.98));
  const predictedDemand30d = Math.round(avgDailyDemand * 30 * (trend === 'RISING' ? 1.25 : 0.95));
  const monthlyExpectedDemand = Math.round(avgDailyDemand * 30);

  const daysUntilStockout = avgDailyDemand > 0 ? Math.floor(product.onHand / avgDailyDemand) : 999;

  const stockoutDate = new Date();
  stockoutDate.setDate(stockoutDate.getDate() + Math.min(daysUntilStockout, 365));
  const stockoutRiskDate = stockoutDate.toISOString().split('T')[0];

  // Lookup supplier lead time
  let supplierLeadTime = 5;
  let supplierName = product.supplierName || 'Apex Industrial Supply';
  try {
    const sup = await Supplier.findOne({
      $or: [{ name: new RegExp(product.supplierName || '', 'i') }, { categories: product.category }],
    });
    if (sup && sup.leadTimeDays) {
      supplierLeadTime = sup.leadTimeDays;
      supplierName = sup.name;
    }
  } catch {}

  const safetyStock = product.minThreshold || Math.round(avgDailyDemand * 4);
  const reorderPoint = avgDailyDemand * supplierLeadTime + safetyStock;
  const suggestedReorderQty = Math.max(40, Math.round((product.maxThreshold || safetyStock * 3) - product.onHand));

  // Smart Reorder Deadline calculation
  const bufferAboveSafety = Math.max(0, product.onHand - safetyStock);
  const orderWithinDays = Math.max(1, Math.min(14, Math.floor(bufferAboveSafety / Math.max(1, avgDailyDemand))));

  const smartReorder: SmartReorderResult = {
    headline: `Reorder ${suggestedReorderQty} units of ${product.name} within ${orderWithinDays} days.`,
    recommendedQty: suggestedReorderQty,
    orderWithinDays,
    currentStock: product.onHand,
    avgDailySales: avgDailyDemand,
    supplierLeadTime,
    safetyStock,
    reorderPoint,
    supplierName,
    leadTimeDays: supplierLeadTime,
  };

  // Inventory Health Score (0-100)
  const minThresh = product.minThreshold || 50;
  let bufferScore = 100;
  if (product.onHand <= 0) {
    bufferScore = 0;
  } else if (product.onHand < minThresh) {
    bufferScore = Math.round((product.onHand / minThresh) * 55);
  } else if (product.onHand <= minThresh * 4) {
    bufferScore = 100;
  } else {
    bufferScore = Math.max(45, 100 - Math.round(((product.onHand - minThresh * 4) / minThresh) * 8));
  }
  const turnoverScore = daysUntilStockout <= 60 ? 95 : daysUntilStockout <= 120 ? 80 : 50;
  const healthScore = Math.min(100, Math.max(12, Math.round(bufferScore * 0.65 + turnoverScore * 0.35)));
  const healthStatus: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' =
    healthScore >= 80 ? 'HEALTHY' : healthScore >= 50 ? 'AT_RISK' : 'CRITICAL';

  let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (product.onHand <= product.minThreshold || daysUntilStockout <= 5) {
    urgency = 'CRITICAL';
  } else if (daysUntilStockout <= 12) {
    urgency = 'HIGH';
  } else if (daysUntilStockout <= 25) {
    urgency = 'MEDIUM';
  }

  const shortageSummaryText = daysUntilStockout <= 30
    ? `${product.name} ki ${daysUntilStockout} days mein shortage ho sakti hai (Depletion by ${stockoutRiskDate}).`
    : `Stock level adequate for next ${daysUntilStockout} days.`;

  // Generate 14-day projection trajectory
  const projectedTimeline: Array<{ day: number; date: string; projectedStock: number; dailyConsumption: number }> = [];
  let remaining = product.onHand;
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    remaining = Math.max(0, remaining - avgDailyDemand);
    projectedTimeline.push({
      day: i,
      date: d.toISOString().split('T')[0],
      projectedStock: remaining,
      dailyConsumption: avgDailyDemand,
    });
  }

  // AI Insights generation (using Gemini if available, otherwise high-precision heuristic)
  let aiInsights = '';
  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI supply chain analyst for StockSense.
Provide a concise, 2-3 sentence strategic forecasting analysis for:
Product: ${product.name} (SKU: ${product.sku})
Category: ${product.category}
Current On Hand: ${product.onHand} ${product.unit}
Min Threshold: ${product.minThreshold}
Average Daily Demand: ${avgDailyDemand} ${product.unit}/day
Estimated Days to Depletion: ${daysUntilStockout} days
Suggested Reorder Quantity: ${suggestedReorderQty}
Urgency Level: ${urgency}
Focus on stockout risk, procurement timing, and buffer stock optimization. Keep response professional, actionable, and succinct.`,
      });
      aiInsights = response.text || '';
    } catch (err: any) {
      console.warn('[StockSense AI] Gemini API call failed, falling back to heuristic:', err.message);
    }
  }

  if (!aiInsights) {
    if (urgency === 'CRITICAL') {
      aiInsights = `ALERT: Depletion velocity for ${product.name} indicates imminent stockout in ~${daysUntilStockout} days. Immediate purchase requisition of ${suggestedReorderQty || 150} ${product.unit} is strongly recommended to protect operational SLAs.`;
    } else if (urgency === 'HIGH') {
      aiInsights = `Demand for ${product.name} is tracking at ${avgDailyDemand} units/day. Current inventory will breach safety buffer within 2 weeks. Initiate supplier procurement cycle within ${orderWithinDays} days to avert line stoppage.`;
    } else {
      aiInsights = `Stock levels for ${product.name} remain healthy (${healthScore}/100) with ${daysUntilStockout} days of coverage. Current velocity is sustainable; next planned replenishment review recommended in 14 days.`;
    }
  }

  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    currentStock: product.onHand,
    minThreshold: product.minThreshold,
    avgDailyDemand,
    predictedDemand7d,
    predictedDemand14d,
    predictedDemand30d,
    monthlyExpectedDemand,
    daysUntilStockout,
    stockoutRiskDate,
    shortageSummaryText,
    suggestedReorderQty,
    confidence: urgency === 'CRITICAL' ? 96 : 89,
    urgency,
    trend,
    aiInsights,
    healthScore,
    healthStatus,
    smartReorder,
    projectedTimeline,
  };
};

/**
 * What-If Scenario Simulator: Calculate dynamic stockout, extra demand, and capital cost
 */
export const simulateWhatIfScenario = async (
  sku: string,
  demandChangePercent: number = 20, // e.g. +20%
  leadTimeDelayDays: number = 0 // e.g. +3 days
) => {
  const forecast = await generateDemandForecast(sku);
  const product = await Product.findOne({ sku: sku.toUpperCase() });

  const multiplier = Math.max(0.1, 1 + demandChangePercent / 100);
  const simulatedDailyDemand = Math.max(1, Math.round(forecast.avgDailyDemand * multiplier));
  const currentStock = forecast.currentStock;

  const baselineStockoutDays = forecast.daysUntilStockout;
  const simulatedStockoutDays = Math.max(0, Math.floor(currentStock / simulatedDailyDemand));

  const simulatedStockoutDate = new Date();
  simulatedStockoutDate.setDate(simulatedStockoutDate.getDate() + Math.min(simulatedStockoutDays, 365));

  const daysShifted = baselineStockoutDays - simulatedStockoutDays;

  // Additional units needed for safe 30-day operating horizon + supplier lead time delay
  const effectiveLeadTime = (forecast.smartReorder.supplierLeadTime || 5) + Math.max(0, leadTimeDelayDays);
  const targetHorizonDays = 30 + effectiveLeadTime;
  const totalDemandNeeded = simulatedDailyDemand * targetHorizonDays;
  const additionalQtyRequired = Math.max(0, Math.round(totalDemandNeeded - currentStock));
  const costPerUnit = product?.costPrice || 25;
  const estimatedCapitalCost = additionalQtyRequired * costPerUnit;

  const riskLevel: 'SEVERE' | 'MODERATE' | 'LOW' =
    simulatedStockoutDays <= 7 ? 'SEVERE' : simulatedStockoutDays <= 18 ? 'MODERATE' : 'LOW';

  const summaryText =
    daysShifted > 0
      ? `A ${demandChangePercent > 0 ? '+' : ''}${demandChangePercent}% demand change shifts stockout ${daysShifted} days earlier (${simulatedStockoutDays} days remaining). You need +${additionalQtyRequired} extra units ($${estimatedCapitalCost.toLocaleString()}) to avoid stockout.`
      : `Inventory holds stable with ${simulatedStockoutDays} days of buffer under this scenario.`;

  return {
    sku: forecast.sku,
    name: forecast.name,
    demandChangePercent,
    leadTimeDelayDays,
    baselineDailyDemand: forecast.avgDailyDemand,
    simulatedDailyDemand,
    baselineStockoutDays,
    simulatedStockoutDays,
    simulatedStockoutDate: simulatedStockoutDate.toISOString().split('T')[0],
    daysShifted,
    additionalQtyRequired,
    estimatedCapitalCost,
    riskLevel,
    summaryText,
  };
};

/**
 * Chatbot Intelligence Hub: Answer inventory questions with live RAG data context
 */
export const queryInventoryAssistant = async (queryText: string): Promise<{ reply: string; suggestions?: string[] }> => {
  // Retrieve live system snapshot for RAG context
  const [totalProducts, lowStockProducts, pendingReceipts, pendingDeliveries, suppliers, recentMoves] =
    await Promise.all([
      Product.find().lean(),
      Product.find({ $expr: { $lte: ['$onHand', '$minThreshold'] } }).lean(),
      Receipt.find({ status: { $in: ['WAITING', 'READY'] } }).lean(),
      Delivery.find({ status: { $in: ['WAITING', 'READY'] } }).lean(),
      Supplier.find().lean(),
      MoveRecord.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

  const totalOnHand = totalProducts.reduce((sum, p) => sum + (p.onHand || 0), 0);
  const totalValuation = totalProducts.reduce((sum, p) => sum + (p.onHand || 0) * (p.costPrice || 12), 0);

  // If Gemini API is available, query with prompt context
  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const systemContext = `
You are the StockSense AI Intelligence Assistant, an expert warehouse logistics & inventory agent.
Current Live System State:
- Total Active SKUs: ${totalProducts.length}
- Total Inventory Units On Hand: ${totalOnHand.toLocaleString()}
- Total Estimated Inventory Valuation: $${totalValuation.toLocaleString()}
- Low Stock Items (${lowStockProducts.length}): ${lowStockProducts.map((p) => `${p.name} (${p.sku}: ${p.onHand}/${p.minThreshold})`).join(', ')}
- Pending Inbound Receipts: ${pendingReceipts.length} (${pendingReceipts.map((r) => r.id).join(', ')})
- Pending Outbound Deliveries: ${pendingDeliveries.length} (${pendingDeliveries.map((d) => d.id).join(', ')})
- Active Suppliers: ${suppliers.map((s) => `${s.name} (${s.code})`).join(', ')}
- Recent Stock Moves: ${recentMoves.map((m) => `${m.kind}: ${m.quantity} (${m.from} -> ${m.to})`).join('; ')}

User Query: "${queryText}"

Provide a direct, authoritative, and helpful answer formatted with clean markdown bullets where helpful. If they ask for recommendations, include actionable advice. Keep response under 150 words.
`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemContext,
      });

      if (response.text) {
        return {
          reply: response.text,
          suggestions: [
            'Which items are critically low in stock?',
            'Generate purchase orders for depleted stock',
            'Show inbound shipments scheduled today',
            'What is our total inventory valuation?',
          ],
        };
      }
    } catch (err: any) {
      console.warn('[StockSense AI] Gemini chat failed, using local RAG assistant:', err.message);
    }
  }

  // Built-in Intelligent Fallback RAG Assistant
  const lower = queryText.toLowerCase();

  if (lower.includes('low') || lower.includes('alert') || lower.includes('shortage') || lower.includes('deplet') || lower.includes('reorder')) {
    if (lowStockProducts.length === 0) {
      return {
        reply: `✅ **All stock levels are optimal!** None of the ${totalProducts.length} active SKUs are currently below their minimum threshold.`,
        suggestions: ['Show inventory valuation', 'View pending inbound receipts', 'Check warehouse capacity'],
      };
    }

    const itemsSummary = lowStockProducts
      .map((p) => `• **${p.name}** (\`${p.sku}\`): **${p.onHand}** ${p.unit} remaining (Min threshold: ${p.minThreshold}) — *Suggested PO: +${Math.max(50, p.minThreshold * 2 - p.onHand)} units*`)
      .join('\n');

    return {
      reply: `⚠️ **Attention: ${lowStockProducts.length} item(s) are below safety threshold!**\n\n${itemsSummary}\n\n💡 *Tip: Navigate to the **Low-Stock Alerts** view or **Receipts** view to dispatch automated purchase replenishment.*`,
      suggestions: ['Auto-create purchase orders for low stock', 'Who are our active suppliers?', 'Show outbound orders'],
    };
  }

  if (lower.includes('valuation') || lower.includes('worth') || lower.includes('value') || lower.includes('cost')) {
    return {
      reply: `💰 **Inventory Financial Summary:**\n• Total SKUs: **${totalProducts.length}**\n• Total Physical Units: **${totalOnHand.toLocaleString()}**\n• Estimated Inventory Valuation: **$${totalValuation.toLocaleString()}**\n• Highest volume category: **${totalProducts[0]?.category || 'Raw Materials'}**`,
      suggestions: ['Which items are low in stock?', 'Show demand trend analytics', 'Check pending receipts'],
    };
  }

  if (lower.includes('supplier') || lower.includes('vendor')) {
    const supList = suppliers.map((s) => `• **${s.name}** (\`${s.code}\`) — Rating: ⭐ ${s.rating} | Lead Time: ${s.leadTimeDays} days | Terms: ${s.paymentTerms}`).join('\n');
    return {
      reply: `🏭 **Registered Suppliers (${suppliers.length}):**\n\n${supList || 'No suppliers registered.'}\n\nYou can manage contracts and place orders under **Suppliers Management**.`,
      suggestions: ['Create purchase order from supplier', 'Check low-stock alerts', 'View inbound shipments'],
    };
  }

  if (lower.includes('inbound') || lower.includes('receipt') || lower.includes('purchase')) {
    return {
      reply: `📦 **Inbound Logistics Status:**\n• Active Inbound Receipts: **${pendingReceipts.length}** pending validation.\n• Recently Received: **${recentMoves.filter((m) => m.kind === 'inbound').length}** shipments committed to ledger.\n• Dock Bays Operational: **Bay 01, Bay 02, Bay 03**.`,
      suggestions: ['View pending receipts', 'What items are low in stock?', 'Show outbound shipments'],
    };
  }

  if (lower.includes('outbound') || lower.includes('delivery') || lower.includes('sale') || lower.includes('dispatch')) {
    return {
      reply: `🚚 **Outbound Sales & Dispatch:**\n• Scheduled Deliveries: **${pendingDeliveries.length}** active manifests.\n• Pick & Pack Buffer: Staging Bay North active.\n• Outbound movements logged today: **${recentMoves.filter((m) => m.kind === 'outbound').length}**.`,
      suggestions: ['Show picking checklist', 'Which items are low in stock?', 'Forecast next week demand'],
    };
  }

  // General inventory snapshot response
  return {
    reply: `📊 **StockSense Central Ledger Telemetry:**\n• Catalog: **${totalProducts.length} active SKUs** (${totalOnHand.toLocaleString()} units on hand)\n• Critical Stock Alerts: **${lowStockProducts.length} items** needing reorder\n• Pending Operations: **${pendingReceipts.length} inbound** receipts | **${pendingDeliveries.length} outbound** dispatches\n• Connected Suppliers: **${suppliers.length} active vendors**\n\nHow else can I assist with warehouse operations?`,
    suggestions: [
      'Which items are low in stock?',
      'Forecast demand for next 30 days',
      'What is our total inventory valuation?',
      'Show supplier performance ratings',
    ],
  };
};
