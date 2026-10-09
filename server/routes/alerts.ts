import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { Supplier } from '../models/Supplier';
import { Receipt } from '../models/Receipt';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/alerts (Automatic Low-Stock & Reorder Alerts)
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const products = await Product.find().lean();
    const suppliers = await Supplier.find().lean();

    const lowStockAlerts = products
      .filter((p) => (p.onHand || 0) <= (p.minThreshold || 50))
      .map((p) => {
        const min = p.minThreshold || 50;
        const current = p.onHand || 0;
        const isCritical = current <= min * 0.4 || current <= 10;
        const reorderQty = Math.max(50, (p.maxThreshold || min * 4) - current);

        // Match supplier if known or pick first supplier that matches category
        const matchedSupplier =
          suppliers.find((s) => s.name === p.supplierName) ||
          suppliers.find((s) => s.categories?.includes(p.category)) ||
          suppliers[0];

        return {
          id: `ALT-${p.sku}`,
          sku: p.sku,
          productName: p.name,
          category: p.category,
          unit: p.unit,
          currentStock: current,
          freeToUse: p.freeToUse || 0,
          minThreshold: min,
          maxThreshold: p.maxThreshold || 1000,
          location: p.location || 'WH-A',
          severity: isCritical ? ('CRITICAL' as const) : ('WARNING' as const),
          suggestedReorderQty: reorderQty,
          suggestedSupplier: matchedSupplier ? matchedSupplier.name : p.supplierName || 'Global Direct Supply',
          supplierEmail: matchedSupplier?.email || 'orders@supplier.internal',
          leadTimeDays: matchedSupplier?.leadTimeDays || 5,
          timestamp: new Date().toISOString(),
        };
      })
      .sort((a, b) => (a.severity === 'CRITICAL' ? -1 : 1));

    return res.json({
      success: true,
      totalAlerts: lowStockAlerts.length,
      criticalCount: lowStockAlerts.filter((a) => a.severity === 'CRITICAL').length,
      warningCount: lowStockAlerts.filter((a) => a.severity === 'WARNING').length,
      alerts: lowStockAlerts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/alerts/reorder (One-Click Purchase Order Generation)
router.post('/reorder', verifyToken, requireRole(['admin', 'inventory_manager']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { sku, quantity, supplierName } = req.body;
    if (!sku) {
      return res.status(400).json({ success: false, message: 'SKU is required' });
    }

    const product = await Product.findOne({ sku: sku.toUpperCase() });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reorderQty = Number(quantity) || Math.max(50, (product.maxThreshold || product.minThreshold * 4) - product.onHand);
    const poReference = `PO-AUTO-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptId = `RCV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newReceipt = new Receipt({
      id: receiptId,
      reference: poReference,
      contact: supplierName || product.supplierName || 'Apex Industrial Supply',
      carrierCode: 'FREIGHT-EXP',
      toLocation: product.location || 'WH-A / BAY-01',
      scheduledUtc: new Date(Date.now() + 5 * 86400000).toISOString(),
      status: 'WAITING',
      clearanceStatus: 'AUTOMATIC REORDER ORDERED',
      totalPieces: `${reorderQty}`,
      tallyWeight: `${Math.round(reorderQty * 2.5)} KG`,
      receiverNotes: `System automated reorder triggered by low-stock threshold alert (< ${product.minThreshold} units).`,
      items: [
        {
          product: product.name,
          sku: product.sku,
          unit: product.unit,
          quantity: reorderQty,
          unitCost: product.costPrice || 15,
        },
      ],
    });

    await newReceipt.save();

    return res.status(201).json({
      success: true,
      message: `Automatic Reorder PO Created: ${receiptId}`,
      receipt: newReceipt,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
