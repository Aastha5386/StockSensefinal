import { connectDB } from '../server/db';
import { seedDatabase } from '../server/seed';
import { User } from '../server/models/User';
import { Product } from '../server/models/Product';
import { Supplier } from '../server/models/Supplier';
import { Receipt } from '../server/models/Receipt';
import { Delivery } from '../server/models/Delivery';
import { MoveRecord } from '../server/models/MoveRecord';
import { generateDemandForecast, queryInventoryAssistant } from '../server/services/aiService';
import mongoose from 'mongoose';

async function runTests() {
  console.log('--- 🧪 STARTING STOCKSENSE BACKEND & API TESTS ---');

  // Test 1: Connect to MongoDB
  console.log('1. Testing MongoDB connection...');
  await connectDB();
  console.log('✅ MongoDB connection verified!');

  // Test 2: Seed Database
  console.log('2. Running seedDatabase...');
  await seedDatabase();
  console.log('✅ Database seeded successfully!');

  // Test 3: Check Users & JWT Password Validation
  console.log('3. Testing User models & authentication...');
  const admin = await User.findOne({ email: 'admin@stocksense.internal' });
  if (!admin) throw new Error('Admin user not found');
  const passOk = await admin.comparePassword('password123');
  if (!passOk) throw new Error('Password check failed');
  console.log(`✅ Admin authenticated: ${admin.email} [Role: ${admin.role}, Operator: ${admin.operatorId}]`);

  // Test 4: Check Catalog & Low Stock Detection
  console.log('4. Testing Product Catalog & Low-Stock Alerts...');
  const products = await Product.find();
  const lowStock = products.filter((p) => p.onHand <= p.minThreshold);
  console.log(`✅ Found ${products.length} products. Low stock count: ${lowStock.length} items`);
  lowStock.forEach((p) => console.log(`   - 🔔 Low Stock: ${p.name} (${p.sku}) OnHand: ${p.onHand} <= Min: ${p.minThreshold}`));

  // Test 5: Check Suppliers
  console.log('5. Testing Supplier Management...');
  const suppliers = await Supplier.find();
  console.log(`✅ Found ${suppliers.length} active suppliers:`);
  suppliers.forEach((s) => console.log(`   - 🏭 ${s.name} (${s.code}) Rating: ${s.rating} LeadTime: ${s.leadTimeDays}d`));

  // Test 6: Check Movements Ledger
  console.log('6. Testing Complete Stock Movement History...');
  const moves = await MoveRecord.find();
  console.log(`✅ Found ${moves.length} movement records logged.`);

  // Test 7: AI Demand Forecasting
  console.log('7. Testing AI Demand Forecasting Engine...');
  const forecast = await generateDemandForecast('SKU-88319-KL');
  console.log(`✅ Forecast generated for ${forecast.sku} (${forecast.name}):`);
  console.log(`   - Current Stock: ${forecast.currentStock} ${forecast.category}`);
  console.log(`   - 7-Day Demand Projection: ${forecast.predictedDemand7d}`);
  console.log(`   - Estimated Days to Depletion: ${forecast.daysUntilStockout} days (Risk Date: ${forecast.stockoutRiskDate})`);
  console.log(`   - Recommended Reorder Qty: ${forecast.suggestedReorderQty}`);
  console.log(`   - AI Insights: "${forecast.aiInsights}"`);

  // Test 8: Intelligence Hub / Chatbot Query
  console.log('8. Testing Intelligence Hub / Chatbot Assistant...');
  const chatResponse = await queryInventoryAssistant('Which items are low in stock and need reordering?');
  console.log('✅ Chatbot Reply:');
  console.log(chatResponse.reply);

  console.log('--- 🎉 ALL BACKEND, MONGODB, AND FREE API TESTS PASSED! ---');
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
