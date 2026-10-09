import { Router, Request, Response } from 'express';
import { MoveRecord } from '../models/MoveRecord';
import { Product } from '../models/Product';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/moves (Complete Stock Movement History)
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { kind, sku, search, limit } = req.query;
    const filter: any = {};

    if (kind && kind !== 'ALL') {
      filter.kind = kind;
    }

    if (sku) {
      filter.productSku = sku;
    }

    if (search) {
      filter.$or = [
        { reference: new RegExp(String(search), 'i') },
        { carrier: new RegExp(String(search), 'i') },
        { productSku: new RegExp(String(search), 'i') },
        { productName: new RegExp(String(search), 'i') },
        { from: new RegExp(String(search), 'i') },
        { to: new RegExp(String(search), 'i') },
        { notes: new RegExp(String(search), 'i') },
      ];
    }

    const records = await MoveRecord.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 100);

    return res.json({ success: true, count: records.length, moveRecords: records });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/moves (Create manual internal movement or ledger entry)
router.post('/', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { reference, carrier, carrierTag, from, to, quantity, isPositive, kind, productSku, productName, notes } = req.body;

    const operatorName = req.user ? `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.operatorId : 'OPERATOR';

    // If movement involves SKU and internal transfer, adjust product location or balance
    let balanceAfter: number | undefined;
    if (productSku) {
      const product = await Product.findOne({ sku: productSku.toUpperCase() });
      if (product) {
        const qtyNum = parseInt(String(quantity).replace(/[^0-9]/g, ''), 10) || 0;
        if (kind === 'outbound') {
          product.onHand = Math.max(0, product.onHand - qtyNum);
          product.freeToUse = Math.max(0, product.freeToUse - qtyNum);
        } else if (kind === 'inbound') {
          product.onHand += qtyNum;
          product.freeToUse += qtyNum;
        } else if (kind === 'internal' && to) {
          product.location = to;
        }
        await product.save();
        balanceAfter = product.onHand;
      }
    }

    const newMove = new MoveRecord({
      reference: reference || `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      timestampUtc: new Date().toISOString(),
      carrier: carrier || 'Internal Depot Transfer',
      carrierTag: carrierTag || 'DEPOT-MOV',
      from: from || 'WH-A',
      to: to || 'WH-B',
      quantity: quantity || '10 PCS',
      isPositive: isPositive !== undefined ? isPositive : true,
      status: 'DONE',
      kind: kind || 'internal',
      productSku: productSku || '',
      productName: productName || '',
      balanceAfter,
      operator: operatorName,
      notes: notes || '',
    });

    await newMove.save();
    return res.status(201).json({ success: true, moveRecord: newMove });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
