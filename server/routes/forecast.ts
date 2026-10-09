import { Router, Request, Response } from 'express';
import { generateDemandForecast, simulateWhatIfScenario } from '../services/aiService';
import { Product } from '../models/Product';

const router = Router();

// GET /api/forecast/what-if/:sku
router.get('/what-if/:sku', async (req: Request, res: Response): Promise<any> => {
  try {
    const demandChange = parseFloat(req.query.demandChange as string) || 20;
    const leadTimeDelay = parseInt(req.query.leadTimeDelay as string, 10) || 0;
    const simulation = await simulateWhatIfScenario(req.params.sku, demandChange, leadTimeDelay);
    return res.json({ success: true, simulation });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/forecast/:sku
router.get('/:sku', async (req: Request, res: Response): Promise<any> => {
  try {
    const forecast = await generateDemandForecast(req.params.sku);
    return res.json({ success: true, forecast });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/forecast (Batch forecast for top inventory items)
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const products = await Product.find().limit(8);
    const forecasts = await Promise.all(
      products.map(async (p) => {
        try {
          return await generateDemandForecast(p.sku);
        } catch {
          return null;
        }
      })
    );

    const valid = forecasts.filter(Boolean);
    return res.json({ success: true, forecasts: valid });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
