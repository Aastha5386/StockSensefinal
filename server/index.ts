import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { seedDatabase } from './seed';

// Import Route Handlers
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import receiptsRouter from './routes/receipts';
import deliveriesRouter from './routes/deliveries';
import suppliersRouter from './routes/suppliers';
import movesRouter from './routes/moves';
import adjustmentsRouter from './routes/adjustments';
import warehousesRouter from './routes/warehouses';
import alertsRouter from './routes/alerts';
import analyticsRouter from './routes/analytics';
import forecastRouter from './routes/forecast';
import chatRouter from './routes/chat';
import eventsRouter from './routes/events';
import { verifyToken } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'FleetFlow / StockSense Enterprise Logistics API (MongoDB & Express)',
    version: '2.0.0',
  });
});

// Public / Auth Routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);

// Protected Company Data Routes (Restricted to authenticated company users with valid JWT)
app.use('/api/products', verifyToken, productsRouter);
app.use('/api/receipts', verifyToken, receiptsRouter);
app.use('/api/deliveries', verifyToken, deliveriesRouter);
app.use('/api/suppliers', verifyToken, suppliersRouter);
app.use('/api/moves', verifyToken, movesRouter);
app.use('/api/adjustments', verifyToken, adjustmentsRouter);
app.use('/api/warehouses', verifyToken, warehousesRouter);
app.use('/api/alerts', verifyToken, alertsRouter);
app.use('/api/analytics', verifyToken, analyticsRouter);
app.use('/api/forecast', verifyToken, forecastRouter);
app.use('/api/chat', verifyToken, chatRouter);

// Initialize DB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`[StockSense] Server listening on http://localhost:${PORT}`);
      console.log(`[StockSense] MongoDB Connected & Seeded`);
      console.log(`[StockSense] Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err: any) {
    console.error(`[StockSense] Failed to start server:`, err.message);
    process.exit(1);
  }
};

startServer();

export default app;
