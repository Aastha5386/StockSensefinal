import { Router, Request, Response } from 'express';
import { Supplier } from '../models/Supplier';
import { Receipt } from '../models/Receipt';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/suppliers
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    return res.json({ success: true, suppliers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/suppliers/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Also fetch purchase orders related to this supplier
    const relatedOrders = await Receipt.find({
      $or: [{ supplierId: supplier._id }, { contact: new RegExp(supplier.name, 'i') }],
    }).sort({ createdAt: -1 });

    return res.json({ success: true, supplier, orders: relatedOrders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/suppliers
router.post('/', verifyToken, requireRole(['admin', 'inventory_manager']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, code, contactPerson, email, phone, address, categories, rating, leadTimeDays, paymentTerms, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const supplierCode = code || `SUP-${Math.floor(100 + Math.random() * 900)}`;

    const supplier = new Supplier({
      code: supplierCode.toUpperCase(),
      name: name.trim(),
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      categories: categories || ['Raw Materials'],
      rating: Number(rating) || 4.5,
      leadTimeDays: Number(leadTimeDays) || 5,
      paymentTerms: paymentTerms || 'Net 30',
      notes: notes || '',
    });

    await supplier.save();
    return res.status(201).json({ success: true, supplier });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', verifyToken, requireRole(['admin', 'inventory_manager']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    return res.json({ success: true, supplier: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', verifyToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    return res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
