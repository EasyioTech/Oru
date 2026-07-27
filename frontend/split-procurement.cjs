const fs = require('fs');
const path = require('path');

const srcFile = 'd:/Oru/frontend/src/services/api/procurement/index.ts';
const destDir = 'd:/Oru/frontend/src/services/api/procurement';
const lines = fs.readFileSync(srcFile, 'utf8').split('\n');

function getBlock(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

// 1. _client.ts
const clientContent = `import { getApiBaseUrl } from '@/config/api';

export const API_BASE = getApiBaseUrl();

export function getAuthToken(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem('auth_token');
}
`;
fs.writeFileSync(path.join(destDir, '_client.ts'), clientContent);

// Base import for domain files
const baseImport = `import { API_BASE, getAuthToken } from './_client';\n\n`;

// 2. requisitions.ts
// PurchaseRequisition: 10-27
// getPurchaseRequisitions ...: 87-147 (including JSDoc)
fs.writeFileSync(path.join(destDir, 'requisitions.ts'), baseImport + getBlock(10, 27) + '\n\n' + getBlock(87, 147));

// 3. orders.ts
// PurchaseOrder: 28-56
// getPurchaseOrders, createPurchaseOrder: 148-207
// getPurchaseOrderById, updatePurchaseOrder: 422-474
fs.writeFileSync(path.join(destDir, 'orders.ts'), baseImport + getBlock(28, 56) + '\n\n' + getBlock(148, 207) + '\n\n' + getBlock(419, 474));

// 4. receipts.ts
// GoodsReceipt: 57-86
// getGoodsReceipts, createGoodsReceipt: 208-262
fs.writeFileSync(path.join(destDir, 'receipts.ts'), baseImport + getBlock(57, 86) + '\n\n' + getBlock(208, 262));

// 5. suppliers.ts
// Supplier: 263-288
// getSuppliers ... updateSupplier: 306-418
fs.writeFileSync(path.join(destDir, 'suppliers.ts'), baseImport + getBlock(263, 288) + '\n\n' + getBlock(306, 418));

// 6. rfqs.ts
// RfqRfp: 289-305
// getRfqRfp, createRfqRfp: 475-531
fs.writeFileSync(path.join(destDir, 'rfqs.ts'), baseImport + getBlock(289, 305) + '\n\n' + getBlock(475, 531));

// 7. contracts.ts
// VendorContract: 532-556
// getVendorContracts ... deleteVendorContract: 582-725
fs.writeFileSync(path.join(destDir, 'contracts.ts'), baseImport + getBlock(532, 556) + '\n\n' + getBlock(582, 725));

// 8. performance.ts
// VendorPerformance: 557-581
// getVendorPerformance ... deleteVendorPerformance: 726-865
fs.writeFileSync(path.join(destDir, 'performance.ts'), baseImport + getBlock(557, 581) + '\n\n' + getBlock(726, 865));

// 9. reports.ts
// ProcurementReports: 866-909
// getProcurementReports: 910-937
fs.writeFileSync(path.join(destDir, 'reports.ts'), baseImport + getBlock(866, 937));

// 10. Replace index.ts
const indexContent = `export * from './requisitions';
export * from './orders';
export * from './receipts';
export * from './suppliers';
export * from './rfqs';
export * from './contracts';
export * from './performance';
export * from './reports';
`;
fs.writeFileSync(srcFile, indexContent);

console.log("Procurement API successfully split.");
