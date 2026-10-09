import { Router, Request, Response } from 'express';
import { Delivery } from '../models/Delivery';
import { Product } from '../models/Product';
import { MoveRecord } from '../models/MoveRecord';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/deliveries
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    return res.json({ success: true, deliveries });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/deliveries/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const delivery = await Delivery.findOne({ id: req.params.id });
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    return res.json({ success: true, delivery });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/deliveries (Create Sales Order / Outbound Delivery)
router.post('/', verifyToken, requireRole(['admin', 'inventory_manager']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const data = req.body;
    const generatedId = data.id || `WH/OUT/${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newDelivery = new Delivery({
      ...data,
      id: generatedId,
      status: data.status || 'WAITING',
    });

    await newDelivery.save();
    return res.status(201).json({ success: true, delivery: newDelivery });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/deliveries/:id/checklist
router.patch('/:id/checklist', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { field } = req.body; // 'pick' or 'pack'
    const delivery = await Delivery.findOne({ id: req.params.id });
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const now = new Date().toISOString();
    if (field === 'pick') {
      delivery.pickVerified = !delivery.pickVerified;
      delivery.pickVerifiedTime = delivery.pickVerified ? now : undefined;
    } else if (field === 'pack') {
      delivery.packInspected = !delivery.packInspected;
      delivery.packInspectedTime = delivery.packInspected ? now : undefined;
    }

    if (delivery.pickVerified && delivery.packInspected && delivery.status === 'WAITING') {
      delivery.status = 'READY';
    }

    await delivery.save();
    return res.json({ success: true, delivery });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/deliveries/:id/validate (Dispatch & Deduct from Stock)
router.post('/:id/validate', verifyToken, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const delivery = await Delivery.findOne({ id: req.params.id });
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (delivery.status === 'DONE') {
      return res.status(400).json({ success: false, message: 'Delivery has already been dispatched and deducted.' });
    }

    const operatorName = req.user ? `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.operatorId : 'OPERATOR';

    // Deduct inventory and record stock movements
    for (const item of delivery.items) {
      const cleanSku = (item.sku || '').trim().toUpperCase();
      const qty = parseInt(String(item.quantity).replace(/[^0-9]/g, ''), 10) || 0;

      const product = await Product.findOne({ sku: cleanSku });
      if (product) {
        product.onHand = Math.max(0, (product.onHand || 0) - qty);
        product.freeToUse = Math.max(0, (product.freeToUse || 0) - qty);
        await product.save();
      }

      await MoveRecord.create({
        reference: `DSP-OUT-${delivery.id}-${cleanSku}`,
        carrier: delivery.operationType || 'Outbound Freight',
        carrierTag: delivery.ledgerId || 'SO-DISPATCH',
        from: 'STAGE-NORTH (BAY-02)',
        to: delivery.deliveryAddress || 'CUSTOMER DESTINATION',
        quantity: `-${qty} PCS`,
        isPositive: false,
        status: 'DONE',
        kind: 'outbound',
        productSku: cleanSku,
        productName: item.product,
        balanceAfter: product ? product.onHand : 0,
        operator: operatorName,
        notes: `Sales Order ${delivery.ledgerId} dispatched. Destination: ${delivery.deliveryAddress}`,
      });
    }

    delivery.status = 'DONE';
    delivery.pickVerified = true;
    delivery.packInspected = true;
    delivery.validatedAt = new Date();
    delivery.validatedBy = operatorName;
    await delivery.save();

    return res.json({ success: true, message: `Delivery ${delivery.id} dispatched and stock deducted.`, delivery });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
