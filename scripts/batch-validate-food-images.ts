/**
 * Batch Validate & Audit Food Images
 * 
 * Performs an exhaustive quality control audit of all food records in the catalog:
 * - Validates exact food photographic correspondence
 * - Detects duplicate images across distinct food items (SHA-256 & 64-bit perceptual hash)
 * - Identifies missing images and flags them as MISSING
 * - Enforces zero-tolerance against generic or substituted images (mango != juice, etc.)
 * - Generates both food_images_validation_report.json and food_images_validation_report.csv
 * 
 * Usage:
 *   npx tsx scripts/batch-validate-food-images.ts
 *   npx tsx scripts/batch-validate-food-images.ts --dry-run
 *   npx tsx scripts/batch-validate-food-images.ts --force
 *   npx tsx scripts/batch-validate-food-images.ts --batch-size 100 --start 0 --limit 500
 */

import fs from 'fs';
import path from 'path';
import { foodItems as mockFoodItems } from '../shared/mockData';
import { 
  runValidationPipeline, 
  computeImageFingerprint,
  type ValidationPipelineResult 
} from '../server/foodImageValidationEngine';
import { getFoodImageMetadata, FOOD_PHOTO_MAP } from '../shared/foodImageResolver';
import { db, sql } from '../server/db';
import { foodItems } from '../shared/schema';
import { eq } from 'drizzle-orm';
import type { FoodItemClient } from '../shared/schema';

export interface BatchValidationOptions {
  dryRun?: boolean;
  force?: boolean;
  batchSize?: number;
  start?: number;
  limit?: number;
  reportJsonPath?: string;
  reportCsvPath?: string;
  verbose?: boolean;
}

export interface CategorySummary {
  category: string;
  totalItems: number;
  verifiedImages: number;
  needsReview: number;
  rejectedImages: number;
  missingImages: number;
  duplicateImages: number;
  accuracyPercentage: string;
}

export interface BatchValidationReport {
  summary: {
    totalScanned: number;
    verifiedImages: number;
    updatedImages: number;
    needsReview: number;
    rejectedImages: number;
    missingImages: number;
    duplicateImages: number;
    averageConfidence: number;
    realPhotographs: number;
    aiGenerated: number;
    durationMs: number;
    dryRun: boolean;
    timestamp: string;
  };
  categoryStatistics: Record<string, CategorySummary>;
  records: ValidationPipelineResult[];
}

export async function runBatchValidation(
  options: BatchValidationOptions = {}
): Promise<BatchValidationReport> {
  const startTime = Date.now();
  const dryRun = options.dryRun !== undefined ? options.dryRun : process.argv.includes('--dry-run');
  const force = options.force !== undefined ? options.force : process.argv.includes('--force');
  
  // Parse command-line args if present
  let batchSize = options.batchSize || 50;
  let startIdx = options.start || 0;
  let limit = options.limit;

  const args = process.argv;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch-size' && args[i + 1]) batchSize = parseInt(args[i + 1], 10) || 50;
    if (args[i] === '--start' && args[i + 1]) startIdx = parseInt(args[i + 1], 10) || 0;
    if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[i + 1], 10);
  }

  const jsonReportPath = options.reportJsonPath || path.join(process.cwd(), 'food_images_validation_report.json');
  const csvReportPath = options.reportCsvPath || path.join(process.cwd(), 'food_images_validation_report.csv');

  console.log(`\n=============================================================`);
  console.log(`     EXACT FOOD-IMAGE VALIDATION & QUALITY CONTROL AUDIT     `);
  console.log(`=============================================================`);
  console.log(`Mode:           ${dryRun ? 'DRY RUN (Simulation)' : 'LIVE AUDIT & UPDATE'}`);
  console.log(`Force Check:    ${force ? 'YES (All records)' : 'STANDARD'}`);
  console.log(`Batch Size:     ${batchSize}`);
  console.log(`Start Offset:   ${startIdx}`);
  console.log(`Record Limit:   ${limit || 'All available'}`);
  console.log(`Taxonomy Maps:  ${FOOD_PHOTO_MAP.length} curated botanical entries`);

  // Ensure safety backup exists
  const backupFile = path.join(process.cwd(), 'food_catalog_backup.json');
  if (!fs.existsSync(backupFile)) {
    console.log(`[Backup] Generating safety catalog snapshot...`);
    fs.writeFileSync(backupFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalRecords: mockFoodItems.length,
      records: mockFoodItems
    }, null, 2));
    console.log(`[Backup] Catalog backed up to ${backupFile}`);
  }

  // Slice items based on start and limit
  const allItems: FoodItemClient[] = [...mockFoodItems];
  const itemsToProcess = allItems.slice(startIdx, limit ? startIdx + limit : undefined);
  console.log(`Items to scan:  ${itemsToProcess.length} (out of ${allItems.length} total)`);

  const results: ValidationPipelineResult[] = [];
  let verifiedCount = 0;
  let updatedCount = 0;
  let needsReviewCount = 0;
  let rejectedCount = 0;
  let missingCount = 0;
  let duplicateCount = 0;
  let totalConfidence = 0;
  let realPhotoCount = 0;
  let aiGenCount = 0;

  const categoryStats: Record<string, {
    total: number;
    verified: number;
    needsReview: number;
    rejected: number;
    missing: number;
    duplicate: number;
  }> = {};

  // Process in batches
  for (let b = 0; b < itemsToProcess.length; b += batchSize) {
    const chunk = itemsToProcess.slice(b, b + batchSize);

    for (let i = 0; i < chunk.length; i++) {
      const item = chunk[i];
      const indexNum = startIdx + b + i + 1;
      const nameEn = typeof item.name === 'string' ? item.name : (item.name?.en || item.id);
      const cat = (item.category && item.category[0]) || 'General';

      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, verified: 0, needsReview: 0, rejected: 0, missing: 0, duplicate: 0 };
      }
      categoryStats[cat].total++;

      // Run exact multi-stage validation pipeline
      const validation = runValidationPipeline(item, allItems);
      results.push(validation);
      totalConfidence += validation.confidenceScore;

      // Track statistics
      switch (validation.status) {
        case 'VERIFIED':
          verifiedCount++;
          categoryStats[cat].verified++;
          break;
        case 'NEEDS_REVIEW':
          needsReviewCount++;
          categoryStats[cat].needsReview++;
          break;
        case 'REJECTED':
          rejectedCount++;
          categoryStats[cat].rejected++;
          break;
        case 'MISSING':
          missingCount++;
          categoryStats[cat].missing++;
          break;
        case 'DUPLICATE':
          duplicateCount++;
          categoryStats[cat].duplicate++;
          break;
      }

      if (validation.sourceType === 'ai_generated') {
        aiGenCount++;
      } else if (validation.imageUrl) {
        realPhotoCount++;
      }

      // If we are not in dry-run, apply updates to item
      if (!dryRun) {
        item.image_status = validation.status;
        item.image_confidence = validation.confidenceScore;
        item.image_hash = validation.fingerprint.sha256;
        item.image_perceptual_hash = validation.fingerprint.perceptualHash;
        item.image_verified_at = validation.verificationDate;
        item.image_verification_reason = validation.verificationReason;
        item.image_search_query = validation.searchQueries[0];
        item.image_alt_text = validation.altText;

        // CamelCase counterparts
        item.imageStatus = validation.status;
        item.imageConfidence = validation.confidenceScore;
        item.imageHash = validation.fingerprint.sha256;
        item.imagePerceptualHash = validation.fingerprint.perceptualHash;
        item.imageVerifiedAt = validation.verificationDate;
        item.imageVerificationReason = validation.verificationReason;
        item.imageSearchQuery = validation.searchQueries[0];
        item.imageAltText = validation.altText;

        updatedCount++;
      }

      // Real-time console log
      if (indexNum % 25 === 0 || indexNum === 1 || indexNum === itemsToProcess.length) {
        console.log(`[${indexNum}/${itemsToProcess.length}] ${nameEn} -> ${validation.status} (${validation.confidenceScore}%) | ${validation.verificationReason.substring(0, 50)}`);
      }
    }
  }

  const durationMs = Date.now() - startTime;
  const avgConfidence = itemsToProcess.length > 0 ? Math.round(totalConfidence / itemsToProcess.length) : 0;

  // Build Category Statistics
  const categoryStatistics: Record<string, CategorySummary> = {};
  for (const [catName, data] of Object.entries(categoryStats)) {
    const accPct = data.total > 0 ? ((data.verified / data.total) * 100).toFixed(1) + '%' : '0%';
    categoryStatistics[catName] = {
      category: catName,
      totalItems: data.total,
      verifiedImages: data.verified,
      needsReview: data.needsReview,
      rejectedImages: data.rejected,
      missingImages: data.missing,
      duplicateImages: data.duplicate,
      accuracyPercentage: accPct
    };
  }

  const report: BatchValidationReport = {
    summary: {
      totalScanned: itemsToProcess.length,
      verifiedImages: verifiedCount,
      updatedImages: dryRun ? 0 : updatedCount,
      needsReview: needsReviewCount,
      rejectedImages: rejectedCount,
      missingImages: missingCount,
      duplicateImages: duplicateCount,
      averageConfidence: avgConfidence,
      realPhotographs: realPhotoCount,
      aiGenerated: aiGenCount,
      durationMs,
      dryRun,
      timestamp: new Date().toISOString()
    },
    categoryStatistics,
    records: results
  };

  // 1. Write JSON report
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n[Report] JSON report written to: ${jsonReportPath}`);

  // 2. Write CSV report with exact specified columns:
  // food_id, food_name_en, food_name_hi, food_name_ta, category, old_image, new_image, status, confidence, source, is_duplicate, duplicate_of, hash, perceptual_hash, verification_reason, timestamp
  const csvHeaders = [
    'food_id',
    'food_name_en',
    'food_name_hi',
    'food_name_ta',
    'category',
    'old_image',
    'new_image',
    'status',
    'confidence',
    'source',
    'is_duplicate',
    'duplicate_of',
    'hash',
    'perceptual_hash',
    'verification_reason',
    'timestamp'
  ];

  const csvRows = results.map(r => {
    const sanitize = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;
    return [
      sanitize(r.foodId),
      sanitize(r.foodName.en),
      sanitize(r.foodName.hi || ''),
      sanitize(r.foodName.ta || ''),
      sanitize(r.category.join('; ')),
      sanitize(r.imageUrl),
      sanitize(r.imageUrl),
      sanitize(r.status),
      r.confidenceScore,
      sanitize(r.sourceType),
      r.isDuplicate ? 'TRUE' : 'FALSE',
      sanitize(r.duplicateOfId || ''),
      sanitize(r.fingerprint.sha256),
      sanitize(r.fingerprint.perceptualHash),
      sanitize(r.verificationReason),
      sanitize(r.verificationDate)
    ].join(',');
  });

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  fs.writeFileSync(csvReportPath, csvContent, 'utf-8');
  console.log(`[Report] CSV report written to:  ${csvReportPath}`);

  console.log(`\n=============================================================`);
  console.log(`                 VALIDATION AUDIT SUMMARY                    `);
  console.log(`=============================================================`);
  console.log(`Total Records Scanned:     ${report.summary.totalScanned}`);
  console.log(`Verified Images:           ${report.summary.verifiedImages}`);
  console.log(`Needs Review:              ${report.summary.needsReview}`);
  console.log(`Rejected Images:           ${report.summary.rejectedImages}`);
  console.log(`Missing Images:            ${report.summary.missingImages}`);
  console.log(`Duplicate Images:          ${report.summary.duplicateImages}`);
  console.log(`Average Confidence Score:  ${report.summary.averageConfidence}%`);
  console.log(`Real Photographs:          ${report.summary.realPhotographs}`);
  console.log(`AI-Generated Images:       ${report.summary.aiGenerated}`);
  console.log(`Duration:                  ${durationMs}ms`);
  console.log(`=============================================================\n`);

  return report;
}

// Direct execution from CLI
if (process.argv[1] && process.argv[1].endsWith('batch-validate-food-images.ts')) {
  runBatchValidation().catch(err => {
    console.error('Fatal batch validation error:', err);
    process.exit(1);
  });
}
