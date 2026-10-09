import { Router, Request, Response } from 'express';
import { Warehouse } from '../models/Warehouse';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/warehouses
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const warehouses = await Warehouse.find().sort({ code: 1 });
    return res.json({ success: true, warehouses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/warehouses
router.post('/', verifyToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { code, regId, title, spec, baysDetail, address, dockAccess, zoneCount, utilization, status } = req.body;
    if (!code || !title) {
      return res.status(400).json({ success: false, message: 'Code and Title are required' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Warehouse.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Warehouse ${cleanCode} already exists` });
    }

    const warehouse = new Warehouse({
      code: cleanCode,
      regId: regId || 'FAC-REG',
      title: title.trim(),
      spec: spec || 'Standard Logistics Facility',
      baysDetail: baysDetail || '10 BAYS',
      address: address || 'Hub Terminal',
      dockAccess: dockAccess || 'DOCKS 1-2',
      zoneCount: zoneCount || '6 ZONES',
      utilization: utilization || '60%',
      status: status || 'OPERATIONAL',
    });

    await warehouse.save();
    return res.status(201).json({ success: true, warehouse });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/warehouses/:code
router.delete('/:code', verifyToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const cleanCode = req.params.code.toUpperCase().trim();
    const deleted = await Warehouse.findOneAndDelete({ code: cleanCode });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    return res.json({ success: true, message: `Warehouse ${cleanCode} removed` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
