import { Router, Request, Response } from 'express';
import { Receipt } from '../models/Receipt';
import { Product } from '../models/Product';
import { MoveRecord } from '../models/MoveRecord';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/receipts
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    return res.json({ success: true, receipts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/receipts/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const receipt = await Receipt.findOne({ id: req.params.id });
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    return res.json({ success: true, receipt });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/receipts (Create Purchase Order / Inbound Receipt)
router.post('/', verifyToken, requireRole(['admin', 'inventory_manager']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const data = req.body;
    const generatedId = data.id || `RCV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newReceipt = new Receipt({
      ...data,
      id: generatedId,
      status: data.status || 'WAITING',
    });

    await newReceipt.save();
    return res.status(201).json({ success: true, receipt: newReceipt });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/receipts/:id
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const updated = await Receipt.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    return res.json({ success: true, receipt: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/receipts/:id/validate (Commit Purchase Order to Stock)
router.post('/:id/validate', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const receipt = await Receipt.findOne({ id: req.params.id });
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    if (receipt.status === 'DONE') {
      return res.status(400).json({ success: false, message: 'Receipt has already been committed to inventory ledger.' });
    }

    const operatorName = req.user ? `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.operatorId : 'OPERATOR';

    // Increment inventory for each line item and create MoveRecords
    for (const item of receipt.items) {
      const cleanSku = (item.sku || '').trim().toUpperCase();
      const qty = Number(item.quantity) || 0;

      let product = await Product.findOne({ sku: cleanSku });
      if (!product) {
        // Auto-create product if missing from catalog
        product = new Product({
          sku: cleanSku,
          name: item.product || `Product ${cleanSku}`,
          category: 'Raw Materials',
          unit: item.unit || 'PCS',
          onHand: qty,
          freeToUse: qty,
          location: receipt.toLocation || 'WH-A / BAY-01',
          minThreshold: 50,
          costPrice: item.unitCost || 12,
          sellingPrice: (item.unitCost || 12) * 1.5,
          barcode: cleanSku,
          supplierName: receipt.contact,
        });
        await product.save();
      } else {
        product.onHand = (product.onHand || 0) + qty;
        product.freeToUse = (product.freeToUse || 0) + qty;
        await product.save();
      }

      // Record immutable stock movement
      await MoveRecord.create({
        reference: `RCV-IN-${receipt.id}-${cleanSku}`,
        carrier: receipt.contact || 'Freight Inbound',
        carrierTag: receipt.carrierCode || 'CARRIER-PO',
        from: `SUPPLIER (${receipt.contact})`,
        to: receipt.toLocation || 'WH-A',
        quantity: `+${qty} ${item.unit || 'PCS'}`,
        isPositive: true,
        status: 'DONE',
        kind: 'inbound',
        productSku: cleanSku,
        productName: item.product,
        balanceAfter: product.onHand,
        operator: operatorName,
        notes: `PO ${receipt.reference} committed to warehouse. Inbound Inspection: ${receipt.inspectionLevel || 'PASS'}`,
      });
    }

    receipt.status = 'DONE';
    receipt.validatedAt = new Date();
    receipt.validatedBy = operatorName;
    await receipt.save();

    return res.json({ success: true, message: `Receipt ${receipt.id} received and stock updated successfully.`, receipt });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
