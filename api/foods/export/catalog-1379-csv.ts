import * as fs from 'fs';
import * as path from 'path';

export default async function handler(req: any, res: any) {
  try {
    // 1. Try resolving the static CSV file directly
    const possiblePaths = [
      path.resolve(process.cwd(), 'nutrifacts_food_catalog_1379.csv'),
      path.resolve(process.cwd(), 'client/public/nutrifacts_food_catalog_1379.csv'),
      path.resolve(process.cwd(), 'dist/nutrifacts_food_catalog_1379.csv'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        const fileContent = fs.readFileSync(p);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="nutrifacts_food_catalog_1379.csv"');
        return res.status(200).send(fileContent);
      }
    }

    // 2. Dynamic fallback generator if file is absent in ephemeral container
    const { generateCatalogCsvString } = await import('../../../scripts/generate-catalog-csv');
    const csvContent = generateCatalogCsvString();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="nutrifacts_food_catalog_1379.csv"');
    return res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('[api/foods/export/catalog-1379-csv error]:', error);
    return res.status(500).json({
      error: 'Failed to generate catalog CSV export',
      message: error?.message || 'Internal server error',
    });
  }
}
