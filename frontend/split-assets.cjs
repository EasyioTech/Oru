const fs = require('fs');
const path = require('path');

const srcFile = 'd:/Oru/frontend/src/services/api/assets/index.ts';
const destDir = 'd:/Oru/frontend/src/services/api/assets';
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

// 2. assets.ts
// Asset interface: 17-57
// getAssets ... updateAsset: 146-264 (wait, 146 is getAssets, we should include docs before it, so let's use 143-264)
const assetsContent = baseImport + getBlock(17, 57) + '\n\n' + getBlock(143, 264);
fs.writeFileSync(path.join(destDir, 'assets.ts'), assetsContent);

// 3. categories.ts
// AssetCategory interface: 58-72
// getAssetCategories ... deleteAssetCategory: 265-368
const categoriesContent = baseImport + getBlock(58, 72) + '\n\n' + getBlock(265, 368);
fs.writeFileSync(path.join(destDir, 'categories.ts'), categoriesContent);

// 4. locations.ts
// AssetLocation interface: 73-89
// getAssetLocations ... deleteAssetLocation: 369-472
const locationsContent = baseImport + getBlock(73, 89) + '\n\n' + getBlock(369, 472);
fs.writeFileSync(path.join(destDir, 'locations.ts'), locationsContent);

// 5. depreciation.ts
// DepreciationRecord interface: 120-141
// getAllDepreciation ... deleteDepreciation: 473-616
const depreciationContent = baseImport + getBlock(120, 141) + '\n\n' + getBlock(473, 616);
fs.writeFileSync(path.join(destDir, 'depreciation.ts'), depreciationContent);

// 6. maintenance.ts
// MaintenanceRecord interface: 90-119
// getAllMaintenance ... deleteMaintenance: 617-755
const maintenanceContent = baseImport + getBlock(90, 119) + '\n\n' + getBlock(617, 755);
fs.writeFileSync(path.join(destDir, 'maintenance.ts'), maintenanceContent);

// 7. disposals.ts
// DisposalRecord interface: 756-791
// getAllDisposals ... approveDisposal: 792-959
const disposalsContent = baseImport + getBlock(756, 959);
fs.writeFileSync(path.join(destDir, 'disposals.ts'), disposalsContent);

// 8. reports.ts
// AssetReports interface and getAssetReports: 960-1043
const reportsContent = baseImport + getBlock(960, 1043);
fs.writeFileSync(path.join(destDir, 'reports.ts'), reportsContent);

// 9. Replace index.ts
const indexContent = `export * from './assets';
export * from './categories';
export * from './locations';
export * from './depreciation';
export * from './maintenance';
export * from './disposals';
export * from './reports';
`;
fs.writeFileSync(srcFile, indexContent);

console.log("Assets API successfully split.");
