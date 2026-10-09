import { Router, Request, Response } from 'express';
import { queryInventoryAssistant } from '../services/aiService';

const router = Router();

// POST /api/chat (Intelligence Hub Chatbot for Inventory Queries)
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'A text message is required' });
    }

    const result = await queryInventoryAssistant(message);
    return res.json({
      success: true,
      reply: result.reply,
      suggestions: result.suggestions || [
        'Which items are critically low in stock?',
        'Forecast demand for next 30 days',
        'Show active suppliers',
        'What is our total inventory valuation?',
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
