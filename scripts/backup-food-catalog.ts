import fs from 'fs';
import path from 'path';
import { foodItems } from '../shared/mockData';

const backupPath = path.join(process.cwd(), 'food_catalog_backup.json');
const timestamp = new Date().toISOString();

const backupData = {
  timestamp,
  totalItems: foodItems.length,
  records: foodItems
};

fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
console.log(`[Safety Backup] Successfully backed up ${foodItems.length} food catalog items to ${backupPath}`);
