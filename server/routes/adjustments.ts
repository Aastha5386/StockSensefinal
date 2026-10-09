import { Router, Request, Response } from 'express';
import { StockAdjustment } from '../models/StockAdjustment';
import { Product } from '../models/Product';
import { MoveRecord } from '../models/MoveRecord';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/adjustments
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const items = await StockAdjustment.find().sort({ createdAt: -1 });
    return res.json({ success: true, adjustmentItems: items });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/adjustments
router.post('/', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id, sku, name, spec, location, systemQuantity, countedQuantity } = req.body;
    const cleanId = id || `ADJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const adjustment = new StockAdjustment({
      id: cleanId,
      sku: (sku || '').toUpperCase(),
      name: name || 'Item',
      spec: spec || '',
      location: location || 'WH-A / BAY-01',
      systemQuantity: Number(systemQuantity) || 0,
      countedQuantity: Number(countedQuantity) || 0,
      countedBy: req.user?.operatorId || 'OPERATOR',
    });

    await adjustment.save();
    return res.status(201).json({ success: true, adjustmentItem: adjustment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/adjustments/:id (Update counted quantity)
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { countedQuantity } = req.body;
    const updated = await StockAdjustment.findOneAndUpdate(
      { id: req.params.id },
      { countedQuantity: Number(countedQuantity) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Adjustment item not found' });
    }
    return res.json({ success: true, adjustmentItem: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/adjustments/commit (Commit physical audit to ledger)
router.post('/commit', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { notes } = req.body;
    const pendingItems = await StockAdjustment.find({ status: 'PENDING' });

    const operatorName = req.user ? `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.operatorId : 'OPERATOR';

    for (const item of pendingItems) {
      const diff = item.countedQuantity - item.systemQuantity;
      const product = await Product.findOne({ sku: item.sku });

      if (product) {
        product.onHand = item.countedQuantity;
        product.freeToUse = Math.max(0, product.freeToUse + diff);
        await product.save();
      }

      // Record adjustment move
      await MoveRecord.create({
        reference: `AUDIT-ADJ-${item.id}`,
        carrier: 'Physical Cycle Count Audit',
        carrierTag: 'AUDIT-TALLY',
        from: diff >= 0 ? 'PHYSICAL RECONCILIATION' : item.location,
        to: diff >= 0 ? item.location : 'VARIANCE WRITE-OFF',
        quantity: `${diff >= 0 ? '+' : ''}${diff} PCS`,
        isPositive: diff >= 0,
        status: 'DONE',
        kind: 'adjustment',
        productSku: item.sku,
        productName: item.name,
        balanceAfter: item.countedQuantity,
        operator: operatorName,
        notes: `Physical tally reconciliation: ${notes || 'Periodic physical count audit committed.'}`,
      });

      item.status = 'COMMITTED';
      item.committedAt = new Date();
      await item.save();
    }

    return res.json({
      success: true,
      message: `Physical tally registry sealed. Reconciled ${pendingItems.length} items.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
