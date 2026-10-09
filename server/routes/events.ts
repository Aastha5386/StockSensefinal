import { Router, Request, Response } from 'express';

const router = Router();

// Store active clients
const clients: Set<Response> = new Set();

export const broadcastEvent = (event: string, data: any) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  });
};

// GET /api/events (SSE Stream for Real-time Inventory Dashboard & Alerts)
router.get('/', (req: Request, res: Response): any => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Live Inventory SSE Stream Established' })}\n\n`);
  clients.add(res);

  // Send periodic heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT', time: new Date().toISOString() })}\n\n`);
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

export default router;
