import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { MoveRecord } from '../models/MoveRecord';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { category, search, lowStock } = req.query;
    const filter: any = {};

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { sku: new RegExp(String(search), 'i') },
        { name: new RegExp(String(search), 'i') },
        { category: new RegExp(String(search), 'i') },
        { location: new RegExp(String(search), 'i') },
      ];
    }

    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$onHand', '$minThreshold'] };
    }

    const products = await Product.find(filter).sort({ name: 1 });
    return res.json({ success: true, products });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:sku
router.get('/:sku', async (req: Request, res: Response): Promise<any> => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/lookup/:code (Barcode or SKU lookup)
router.get('/lookup/:code', async (req: Request, res: Response): Promise<any> => {
  try {
    let rawCode = decodeURIComponent(req.params.code).trim();

    // 1. Try to extract SKU if rawCode is JSON (e.g., {"sku": "SKU-48201-AX"})
    if (rawCode.startsWith('{') && rawCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawCode);
        if (parsed.sku) rawCode = String(parsed.sku).trim();
        else if (parsed.code) rawCode = String(parsed.code).trim();
        else if (parsed.id) rawCode = String(parsed.id).trim();
      } catch {}
    }

    // 2. Try to extract SKU if rawCode is a URL
    if (rawCode.startsWith('http://') || rawCode.startsWith('https://')) {
      try {
        const parsedUrl = new URL(rawCode);
        const skuParam = parsedUrl.searchParams.get('sku') || parsedUrl.searchParams.get('code');
        if (skuParam) {
          rawCode = skuParam.trim();
        } else {
          const segments = parsedUrl.pathname.split('/').filter(Boolean);
          if (segments.length > 0) {
            rawCode = segments[segments.length - 1].trim();
          }
        }
      } catch {}
    }

    // 3. Strip common prefixes e.g. "SKU: ", "BARCODE: "
    rawCode = rawCode.replace(/^(SKU|BARCODE|CODE|PRODUCT):\s*/i, '').trim();

    const cleanCode = rawCode.toUpperCase();
    const strippedZeros = rawCode.replace(/^0+/, '');

    // Search across sku, barcode, and clean variants
    let product = await Product.findOne({
      $or: [
        { sku: cleanCode },
        { sku: rawCode },
        { barcode: rawCode },
        { barcode: cleanCode },
        { barcode: strippedZeros },
        { sku: new RegExp(`^${cleanCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ],
    });

    // If still not found, search if code matches product name closely
    if (!product && rawCode.length >= 3) {
      product = await Product.findOne({
        name: new RegExp(rawCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: `No product matches "${rawCode}"` });
    }
    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products
router.post('/', verifyToken, requireRole(['admin', 'inventory_manager']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { sku, name, category, unit, onHand, freeToUse, location, minThreshold, maxThreshold, costPrice, sellingPrice, barcode, supplierName } = req.body;

    if (!sku || !name) {
      return res.status(400).json({ success: false, message: 'SKU and Name are mandatory' });
    }

    const cleanSku = sku.trim().toUpperCase();
    const existing = await Product.findOne({ sku: cleanSku });
    if (existing) {
      return res.status(400).json({ success: false, message: `A product with SKU ${cleanSku} already exists` });
    }

    const product = new Product({
      sku: cleanSku,
      name: name.trim(),
      category: category || 'General',
      unit: unit || 'PCS',
      onHand: Number(onHand) || 0,
      freeToUse: Number(freeToUse) !== undefined ? Number(freeToUse) : Number(onHand) || 0,
      location: location || 'WH-A / BAY-01',
      minThreshold: Number(minThreshold) || 50,
      maxThreshold: Number(maxThreshold) || 1000,
      costPrice: Number(costPrice) || 10,
      sellingPrice: Number(sellingPrice) || 18,
      barcode: barcode || cleanSku,
      supplierName: supplierName || '',
    });

    await product.save();

    // Inscribe initial opening balance into Stock Movement history
    if (product.onHand > 0) {
      await MoveRecord.create({
        reference: `INIT-${cleanSku}`,
        carrier: 'Opening Inventory Allocation',
        carrierTag: 'INIT-AUDIT',
        from: 'PROCUREMENT / VENDOR',
        to: product.location || 'WH-A',
        quantity: `${product.onHand} ${product.unit}`,
        isPositive: true,
        status: 'DONE',
        kind: 'inbound',
        productSku: product.sku,
        productName: product.name,
        balanceAfter: product.onHand,
        operator: req.user?.operatorId || 'SYSTEM',
        notes: `Initial catalog inscription: ${product.name}`,
      });
    }

    return res.status(201).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:sku
router.put('/:sku', verifyToken, requireRole(['admin', 'inventory_manager']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const cleanSku = req.params.sku.toUpperCase();
    const product = await Product.findOneAndUpdate({ sku: cleanSku }, { ...req.body, sku: cleanSku }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:sku (admin only)
router.delete('/:sku', verifyToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const cleanSku = req.params.sku.toUpperCase();
    const deleted = await Product.findOneAndDelete({ sku: cleanSku });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, message: `Product ${cleanSku} removed from catalog` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
