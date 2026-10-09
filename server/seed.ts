import { User } from './models/User';
import { Product } from './models/Product';
import { Supplier } from './models/Supplier';
import { Receipt } from './models/Receipt';
import { Delivery } from './models/Delivery';
import { MoveRecord } from './models/MoveRecord';
import { StockAdjustment } from './models/StockAdjustment';
import { Warehouse } from './models/Warehouse';

export const seedDatabase = async () => {
  try {
    // 1. Seed Demo Company Users if not already present
    const existingFleetAdmin = await User.findOne({
      $or: [{ email: 'admin@fleetflow.io' }, { companyEmailOrId: 'FLEETFLOW-01' }],
    });

    if (!existingFleetAdmin) {
      const fleetAdmin = new User({
        companyName: 'FleetFlow Logistics',
        companyId: 'fleetflow',
        companyEmailOrId: 'FLEETFLOW-01',
        email: 'admin@fleetflow.io',
        password: 'StockSense@123',
        firstName: 'Alexander',
        lastName: 'Lindberg',
        role: 'admin',
        operatorId: 'OP-774-K',
        dept: 'CENTRAL-COMMAND',
        station: 'COMMAND-TERMINAL-01 // BAY-01',
        shiftDispatch: '45 CRATES',
        logSignature: 'VERIFIED',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      });
      await fleetAdmin.save();
      console.log('[StockSense Seed] Demo Company Admin ensured (FLEETFLOW-01 / StockSense@123)');
    }

    const existingStaff = await User.findOne({
      $or: [{ email: 'staff@fleetflow.io' }, { companyEmailOrId: 'STAFF-01' }],
    });

    if (!existingStaff) {
      const staffUser = new User({
        companyName: 'FleetFlow Logistics',
        companyId: 'fleetflow',
        companyEmailOrId: 'STAFF-01',
        email: 'staff@fleetflow.io',
        password: 'StockSense@123',
        firstName: 'Marcus',
        lastName: 'Vance',
        role: 'warehouse_staff',
        operatorId: 'OP-309-S',
        dept: 'WAREHOUSE-OPERATIONS',
        station: 'PACKING-DOCK-04',
        shiftDispatch: '20 CRATES',
        logSignature: 'VERIFIED',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      });
      await staffUser.save();
      console.log('[StockSense Seed] Demo Staff User ensured (STAFF-01 / StockSense@123)');
    }

    // 2. Seed Suppliers
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      console.log('[StockSense Seed] Seeding industrial suppliers...');
      await Supplier.insertMany([
        {
          code: 'SUP-401',
          name: 'Apex Industrial Materials Ltd',
          contactPerson: 'David Kelling',
          email: 'sales@apexmaterials.internal',
          phone: '+1 (555) 234-8901',
          address: '440 Industrial Parkway, Sector 9',
          categories: ['Raw Materials', 'Fasteners'],
          rating: 4.9,
          leadTimeDays: 4,
          paymentTerms: 'Net 30',
          status: 'ACTIVE',
          notes: 'Primary supplier for tempered glass and steel structural channels.',
        },
        {
          code: 'SUP-402',
          name: 'Precision Fasteners & Bolts Corp',
          contactPerson: 'Sarah Jenkins',
          email: 'orders@precisionfasteners.internal',
          phone: '+1 (555) 872-4411',
          address: '12 Metalworks Way, Bay Logistics',
          categories: ['Fasteners'],
          rating: 4.7,
          leadTimeDays: 3,
          paymentTerms: 'Net 15',
          status: 'ACTIVE',
          notes: 'High-tensile zinc flange bolts and custom fastener packs.',
        },
        {
          code: 'SUP-403',
          name: 'Nordic Polymer & Seals Group',
          contactPerson: 'Hans Berg',
          email: 'h.berg@nordicpolymer.internal',
          phone: '+46 8 123 4567',
          address: 'Terminalvägen 8, Gothenburg',
          categories: ['Seals & Gaskets', 'Fluids'],
          rating: 4.8,
          leadTimeDays: 6,
          paymentTerms: 'Net 45',
          status: 'ACTIVE',
          notes: 'Certified EPDM rubber seals and aerospace grade hydraulic fluids.',
        },
        {
          code: 'SUP-404',
          name: 'Pinnacle Freight & Packaging Solutions',
          contactPerson: 'Maya Lin',
          email: 'logistics@pinnaclepack.internal',
          phone: '+1 (555) 609-1223',
          address: '890 Harbor Blvd, Container Port',
          categories: ['Packaging'],
          rating: 4.6,
          leadTimeDays: 2,
          paymentTerms: 'Net 30',
          status: 'ACTIVE',
          notes: 'Heavy-duty corrugated shipping crates and thermal transfer labels.',
        },
      ]);
    }

    // 3. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[StockSense Seed] Seeding catalog products...');
      await Product.insertMany([
        {
          sku: 'SKU-48201-AX',
          name: 'Tempered Glass Sheet 4mm',
          category: 'Raw Materials',
          unit: 'PCS',
          onHand: 1450,
          freeToUse: 1200,
          location: 'WH-A / BAY-02',
          minThreshold: 500,
          maxThreshold: 2000,
          costPrice: 42.5,
          sellingPrice: 65.0,
          barcode: 'SKU-48201-AX',
          supplierName: 'Apex Industrial Materials Ltd',
        },
        {
          sku: 'SKU-99120-BZ',
          name: 'M12 Zinc Hex Flange Bolt',
          category: 'Fasteners',
          unit: 'BOX / 500',
          onHand: 28000,
          freeToUse: 24500,
          location: 'WH-A / RACK-14',
          minThreshold: 5000,
          maxThreshold: 40000,
          costPrice: 18.0,
          sellingPrice: 28.5,
          barcode: 'SKU-99120-BZ',
          supplierName: 'Precision Fasteners & Bolts Corp',
        },
        {
          sku: 'SKU-10492-CD',
          name: 'Polymer Sealing Gasket B',
          category: 'Seals & Gaskets',
          unit: 'ROLL',
          onHand: 340,
          freeToUse: 180,
          location: 'WH-B / SHELF-04',
          minThreshold: 100,
          maxThreshold: 500,
          costPrice: 24.0,
          sellingPrice: 38.0,
          barcode: 'SKU-10492-CD',
          supplierName: 'Nordic Polymer & Seals Group',
        },
        {
          sku: 'SKU-88319-KL',
          name: 'Corrugated Shipping Crate XL',
          category: 'Packaging',
          unit: 'PALLET',
          onHand: 42, // Low stock on purpose to test alerts!
          freeToUse: 8,
          location: 'WH-A / RACK-08',
          minThreshold: 60,
          maxThreshold: 200,
          costPrice: 85.0,
          sellingPrice: 125.0,
          barcode: 'SKU-88319-KL',
          supplierName: 'Pinnacle Freight & Packaging Solutions',
        },
        {
          sku: 'SKU-50284-HY',
          name: 'Hydraulic Fluid Type-IV',
          category: 'Fluids',
          unit: 'LITRE',
          onHand: 110, // Low stock on purpose to test alerts!
          freeToUse: 95,
          location: 'WH-C / SEC-09',
          minThreshold: 150,
          maxThreshold: 600,
          costPrice: 19.5,
          sellingPrice: 32.0,
          barcode: 'SKU-50284-HY',
          supplierName: 'Nordic Polymer & Seals Group',
        },
        {
          sku: 'SKU-31092-PL',
          name: 'Structural Aluminum Channel 40x40',
          category: 'Raw Materials',
          unit: 'METRE',
          onHand: 2890,
          freeToUse: 2140,
          location: 'WH-A / RACK-14',
          minThreshold: 1000,
          maxThreshold: 5000,
          costPrice: 12.0,
          sellingPrice: 19.0,
          barcode: 'SKU-31092-PL',
          supplierName: 'Apex Industrial Materials Ltd',
        },
        {
          sku: 'SKU-77641-ER',
          name: 'EPDM Rubber O-Ring Kit #4',
          category: 'Seals & Gaskets',
          unit: 'SET / 120',
          onHand: 615,
          freeToUse: 590,
          location: 'WH-B / SHELF-02',
          minThreshold: 150,
          maxThreshold: 1000,
          costPrice: 35.0,
          sellingPrice: 52.0,
          barcode: 'SKU-77641-ER',
          supplierName: 'Nordic Polymer & Seals Group',
        },
        {
          sku: 'SKU-19402-TH',
          name: 'Thermal Transfer Ribbon 110mm',
          category: 'Packaging',
          unit: 'ROLL',
          onHand: 35, // Low stock on purpose to test alerts!
          freeToUse: 20,
          location: 'WH-B / SHELF-06',
          minThreshold: 80,
          maxThreshold: 300,
          costPrice: 8.5,
          sellingPrice: 14.0,
          barcode: 'SKU-19402-TH',
          supplierName: 'Pinnacle Freight & Packaging Solutions',
        },
      ]);
    }

    // 4. Seed Receipts (Purchase Orders)
    const receiptCount = await Receipt.countDocuments();
    if (receiptCount === 0) {
      console.log('[StockSense Seed] Seeding purchase order receipts...');
      await Receipt.insertMany([
        {
          id: 'RCV-2026-88401',
          reference: 'PO-88401 / LADING-7712',
          contact: 'Apex Industrial Materials Ltd',
          carrierCode: 'FREIGHT-EXP-09',
          toLocation: 'WH-A / BAY-02',
          scheduledUtc: new Date(Date.now() + 86400000).toISOString(),
          status: 'READY',
          clearanceStatus: 'CUSTOMS CLEARED // TIER-1',
          containerSeal: 'SEAL-APEX-89012',
          inspectionLevel: 'LEVEL II SAMPLING (AQL 1.0)',
          totalPieces: '250',
          tallyWeight: '1,450 KG',
          receiverNotes: 'All crates tagged with high-visibility safety tamper stickers.',
          custodialHandover: {
            dispatchChief: 'CHIEF A. LINDBERG',
            terminalAuth: 'TERMINAL-AUTH-9092',
            sealStatus: 'INTACT // VERIFIED',
          },
          items: [
            {
              product: 'Tempered Glass Sheet 4mm',
              spec: '4mm Float Annealed / Cut 1200x800',
              sku: 'SKU-48201-AX',
              unit: 'PCS',
              quantity: 200,
              unitCost: 42.5,
            },
            {
              product: 'Structural Aluminum Channel 40x40',
              spec: 'Anodized 6063-T5 / 3m Segments',
              sku: 'SKU-31092-PL',
              unit: 'METRE',
              quantity: 50,
              unitCost: 12.0,
            },
          ],
        },
        {
          id: 'WH/IN/0002',
          reference: 'PO-99410 / SEA-881',
          contact: 'Precision Fasteners & Bolts Corp',
          carrierCode: 'CONTAINER-MARITIME',
          toLocation: 'WH-A / RACK-14',
          scheduledUtc: new Date(Date.now() + 172800000).toISOString(),
          status: 'WAITING',
          clearanceStatus: 'DOCK UNLOADING IN PROGRESS',
          containerSeal: 'SEAL-MAR-4421',
          inspectionLevel: 'RANDOM TALLY CHECK',
          totalPieces: '120',
          tallyWeight: '820 KG',
          receiverNotes: 'Fastener crates palletized with strapping.',
          items: [
            {
              product: 'M12 Zinc Hex Flange Bolt',
              spec: 'Grade 8.8 Galvanized / 500ct',
              sku: 'SKU-99120-BZ',
              unit: 'BOX / 500',
              quantity: 120,
              unitCost: 18.0,
            },
          ],
        },
      ]);
    }

    // 5. Seed Outbound Deliveries (Sales Orders)
    const deliveryCount = await Delivery.countDocuments();
    if (deliveryCount === 0) {
      console.log('[StockSense Seed] Seeding outbound delivery orders...');
      await Delivery.insertMany([
        {
          id: 'WH/OUT/0042',
          timestampUtc: new Date().toISOString(),
          ledgerId: 'LEDGER-EXP-0042',
          statusCode: 'ACT-04',
          stageName: 'MARITIME-OUTBOUND',
          status: 'READY',
          customerName: 'Pacific Rim Assembly Facility',
          deliveryAddress: 'BERTH 14 // PIER SOUTH\nPORT OF TACOMA, WA 98421',
          coordinates: '47.2642° N, 122.4173° W',
          operationType: 'CONTAINER FREIGHT DISPATCH',
          routing: 'DIRECT MARITIME BUFFER // TRACK 4',
          pickVerified: true,
          pickVerifiedTime: new Date(Date.now() - 3600000).toISOString(),
          packInspected: false,
          grossMass: '1,420 KG',
          netVolume: '14.8 M³',
          items: [
            {
              product: 'Tempered Glass Sheet 4mm',
              spec: 'Float Annealed 1200x800mm',
              sku: 'SKU-48201-AX',
              destinationBay: 'BERTH-14',
              quantity: '40 PCS',
              unitPrice: 65.0,
            },
            {
              product: 'Structural Aluminum Channel 40x40',
              spec: 'Anodized 6063-T5',
              sku: 'SKU-31092-PL',
              destinationBay: 'BERTH-14',
              quantity: '120 METRE',
              unitPrice: 19.0,
            },
          ],
        },
        {
          id: 'WH/OUT/0043',
          timestampUtc: new Date(Date.now() + 86400000).toISOString(),
          ledgerId: 'LEDGER-EXP-0043',
          statusCode: 'ACT-02',
          stageName: 'STAGING-BUFFER',
          status: 'WAITING',
          customerName: 'Evergreen Automation Systems',
          deliveryAddress: 'GATE 7, SECTOR INDUSTRIAL 12\nVANCOUVER FREIGHT HUB',
          coordinates: '49.2827° N, 123.1207° W',
          operationType: 'INTERMODAL TRUCK HAUL',
          routing: 'HIGHWAY-99 LOGISTICS CORRIDOR',
          pickVerified: false,
          packInspected: false,
          grossMass: '680 KG',
          netVolume: '6.2 M³',
          items: [
            {
              product: 'M12 Zinc Hex Flange Bolt',
              spec: 'Grade 8.8 Galvanized / 500ct',
              sku: 'SKU-99120-BZ',
              destinationBay: 'DOCK-02',
              quantity: '50 BOX / 500',
              unitPrice: 28.5,
            },
          ],
        },
      ]);
    }

    // 6. Seed Complete Stock Movement History
    const moveCount = await MoveRecord.countDocuments();
    if (moveCount === 0) {
      console.log('[StockSense Seed] Seeding stock movement ledger...');
      await MoveRecord.insertMany([
        {
          reference: 'MOV-2026-901',
          timestampUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
          carrier: 'Apex Industrial Materials Ltd',
          carrierTag: 'INB-PO-88390',
          from: 'SUPPLIER DOCK // FREIGHT',
          to: 'WH-A / BAY-02',
          quantity: '+500 PCS',
          isPositive: true,
          status: 'DONE',
          kind: 'inbound',
          productSku: 'SKU-48201-AX',
          productName: 'Tempered Glass Sheet 4mm',
          balanceAfter: 1450,
          operator: 'OP-774-K',
          notes: 'Purchase Order receipt verified and cleared.',
        },
        {
          reference: 'MOV-2026-902',
          timestampUtc: new Date(Date.now() - 86400000).toISOString(),
          carrier: 'Pacific Rim Express',
          carrierTag: 'OUT-SO-4401',
          from: 'WH-A / BAY-02',
          to: 'PORT OF TACOMA // BERTH 14',
          quantity: '-40 PCS',
          isPositive: false,
          status: 'DONE',
          kind: 'outbound',
          productSku: 'SKU-48201-AX',
          productName: 'Tempered Glass Sheet 4mm',
          balanceAfter: 1410,
          operator: 'OP-309-S',
          notes: 'Customer dispatch completed.',
        },
        {
          reference: 'MOV-2026-903',
          timestampUtc: new Date(Date.now() - 43200000).toISOString(),
          carrier: 'Depot Transfer AGV-3',
          carrierTag: 'INT-TRANSFER-88',
          from: 'WH-A / RACK-14',
          to: 'WH-B / STAGING-BAY',
          quantity: '10 BOX / 500',
          isPositive: true,
          status: 'DONE',
          kind: 'internal',
          productSku: 'SKU-99120-BZ',
          productName: 'M12 Zinc Hex Flange Bolt',
          balanceAfter: 28000,
          operator: 'OP-512-M',
          notes: 'Internal buffer replenishment.',
        },
        {
          reference: 'MOV-2026-904',
          timestampUtc: new Date(Date.now() - 14400000).toISOString(),
          carrier: 'Physical Audit Team',
          carrierTag: 'AUDIT-ADJ-99',
          from: 'CYCLE COUNT RECONCILIATION',
          to: 'WH-B / SHELF-04',
          quantity: '+15 ROLL',
          isPositive: true,
          status: 'DONE',
          kind: 'adjustment',
          productSku: 'SKU-10492-CD',
          productName: 'Polymer Sealing Gasket B',
          balanceAfter: 340,
          operator: 'OP-512-M',
          notes: 'Physical count adjustment reconciled.',
        },
      ]);
    }

    // 7. Seed Warehouses
    const warehouseCount = await Warehouse.countDocuments();
    if (warehouseCount === 0) {
      console.log('[StockSense Seed] Seeding warehouse facility sites...');
      await Warehouse.insertMany([
        {
          code: 'WH-A',
          regId: 'FAC-PACIFIC-01',
          title: 'North Terminal Logistics Center',
          spec: 'High-Density Heavy Pallet Buffer',
          baysDetail: '16 BAYS // AUTOMATED CRANE',
          address: 'Pier 22, Port Maritime Corridor',
          dockAccess: 'DOCKS 1-6 // RAIL SPUR',
          zoneCount: '12 ZONES',
          utilization: '78%',
          status: 'OPERATIONAL',
        },
        {
          code: 'WH-B',
          regId: 'FAC-PACIFIC-02',
          title: 'Precision Small-Parts Depot',
          spec: 'Climate Controlled Shelving',
          baysDetail: '24 AISLES // RFID GATES',
          address: '400 Logistics Way, Bay Industrial',
          dockAccess: 'DOCKS 7-10',
          zoneCount: '16 ZONES',
          utilization: '64%',
          status: 'OPERATIONAL',
        },
        {
          code: 'WH-C',
          regId: 'FAC-PACIFIC-03',
          title: 'Chemical & Hazardous Fluids Bunker',
          spec: 'Secondary Containment Certified',
          baysDetail: '8 ISOLATED VAULTS',
          address: 'Safety Zone Perimeter West',
          dockAccess: 'DOCK 11 DEDICATED',
          zoneCount: '4 ZONES',
          utilization: '45%',
          status: 'MONITORED',
        },
      ]);
    }

    console.log('[StockSense Seed] Database seeding check complete.');
  } catch (error: any) {
    console.error('[StockSense Seed] Error during database seed:', error.message);
  }
};
