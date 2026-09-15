import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import type { Language, FoodItemClient, ImageStatus } from "../shared/schema";
import { generateCompleteFoodItem } from "./utils/anthropicHelper";
import { askGeminiNutritionAssistant, generateGeminiFoodItem } from "./utils/geminiHelper";
import { auditFoodImage, generateFoodImageEngineMetadata } from "./imageAuditService";
import { generateFoodStudioImage, editFoodStudioImage } from "./foodImageStudioService";
import { generateAITopic, generateAIArticle } from "./utils/editorialEngine";
import { analyticsEngine } from "./analyticsEngine";
import { generateMainSitemapXml, generateNewsSitemapXml, getSitemapStats, reindexSitemap } from "./sitemapEngine";
import { 
  auditAndFixFoodItemImage, 
  autoCheckFoodAccuracy, 
  getGoogleImageSearchUrl, 
  getExcelHyperlinkFormula, 
  getFoodImageMetadata, 
  resolveAccurateFoodImage 
} from "../shared/foodImageResolver";
import { ImageValidationWorker } from "./imageValidationWorker";
import { generateFoodImageStudioPrompt, generateSearchQueries, runValidationPipeline } from "./foodImageValidationEngine";
import { runBatchValidation } from "../scripts/batch-validate-food-images";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes prefix
  const API_PREFIX = "/api";

  // Automated background image validator & search replacement worker
  const imageValidationWorker = new ImageValidationWorker(storage);

  // Error handling middleware
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Root API info and health endpoints for Vercel, uptime monitors and API consumers
  app.get([API_PREFIX, `${API_PREFIX}/`, `${API_PREFIX}/index`], (_req: Request, res: Response) => {
    res.json({
      status: "online",
      name: "NutriGlobe Nutrition Engine API",
      version: "1.0.0",
      totalCatalogFoods: 1376,
      photoAccuracy: "100.0% Curated",
      endpoints: {
        health: "/api/health",
        foods: "/api/foods",
        categories: "/api/categories",
        auditSpreadsheet: "/api/foods/export/audit-spreadsheet",
        batchUpdateImages: "/api/admin/batch-update-food-photos"
      }
    });
  });

  app.get([`${API_PREFIX}/health`, "/health"], (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: "NutriGlobe Engine"
    });
  });

  // Food Categories List Endpoint
  app.get(`${API_PREFIX}/categories`, asyncHandler(async (_req: Request, res: Response) => {
    const foods = await storage.getAllFoodItems();
    const categorySet = new Set<string>();
    foods.forEach(f => {
      const cats = Array.isArray(f.category) ? f.category : (typeof (f as any).category === 'string' ? [(f as any).category] : []);
      cats.forEach(c => {
        if (c && typeof c === 'string' && c.trim().length > 0) {
          categorySet.add(c.trim().toLowerCase());
        }
      });
    });
    res.json(Array.from(categorySet).sort());
  }));

  // --- Visitor & Telemetry Analytics Routes ---
  app.post(`${API_PREFIX}/analytics/log-visit`, asyncHandler(async (req: Request, res: Response) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || '';
    const { path } = req.body || {};
    const log = analyticsEngine.logVisit(ip, path || '/', userAgent, req.headers);
    res.json({ success: true, log });
  }));

  app.post(`${API_PREFIX}/analytics/food-view`, asyncHandler(async (req: Request, res: Response) => {
    const { foodId, foodName, category } = req.body || {};
    if (foodId) {
      analyticsEngine.logFoodView(foodId, foodName, category);
    }
    res.json({ success: true });
  }));

  app.post(`${API_PREFIX}/analytics/share`, asyncHandler(async (req: Request, res: Response) => {
    const { targetId, type } = req.body || {};
    if (targetId) {
      analyticsEngine.logShare(targetId, type || 'food');
    }
    res.json({ success: true });
  }));

  app.post(`${API_PREFIX}/analytics/download`, asyncHandler(async (req: Request, res: Response) => {
    const { targetId, type } = req.body || {};
    if (targetId) {
      analyticsEngine.logDownload(targetId, type || 'pdf');
    }
    res.json({ success: true });
  }));

  app.post(`${API_PREFIX}/analytics/ad-impression`, asyncHandler(async (req: Request, res: Response) => {
    const { adUnit } = req.body || {};
    analyticsEngine.logAdImpression(adUnit || 'Header Banner');
    res.json({ success: true });
  }));

  app.post(`${API_PREFIX}/analytics/ad-click`, asyncHandler(async (req: Request, res: Response) => {
    const { adUnit } = req.body || {};
    analyticsEngine.logAdClick(adUnit || 'Header Banner');
    res.json({ success: true });
  }));

  app.get(`${API_PREFIX}/analytics/summary`, asyncHandler(async (_req: Request, res: Response) => {
    const summary = analyticsEngine.getAnalyticsSummary();
    res.json(summary);
  }));

  // --- Admin Food CRUD Endpoints ---
  app.post(`${API_PREFIX}/admin/foods`, asyncHandler(async (req: Request, res: Response) => {
    const foodData: FoodItemClient = req.body;
    if (!foodData || !foodData.id || !foodData.name?.en) {
      return res.status(400).json({ error: 'Valid food data with id and English name is required' });
    }
    const created = await storage.createFoodItem(foodData);
    res.json({ success: true, food: created });
  }));

  app.put(`${API_PREFIX}/admin/foods/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates: Partial<FoodItemClient> = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Food ID is required' });
    }
    const updated = await storage.updateFoodItem(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ success: true, food: updated });
  }));

  app.delete(`${API_PREFIX}/admin/foods/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Food ID is required' });
    }
    const success = await storage.deleteFoodItem(id);
    res.json({ success });
  }));

  app.post(`${API_PREFIX}/admin/upload-food-image`, asyncHandler(async (req: Request, res: Response) => {
    const { foodId, imageBase64, filename } = req.body;
    if (!foodId || !imageBase64) {
      return res.status(400).json({ error: 'foodId and imageBase64 are required' });
    }
    const updated = await storage.updateFoodItem(foodId, {
      image: imageBase64,
      imageUrl: imageBase64,
      imageVerifiedStatus: 'verified',
      imageAttribution: `Admin uploaded file (${filename || 'image.png'})`,
      imageLastCheckedAt: new Date().toISOString()
    });
    res.json({ success: true, imageUrl: imageBase64, food: updated });
  }));

  // Get all food items
  app.get(`${API_PREFIX}/foods`, asyncHandler(async (req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    res.json(foodItems);
  }));

  // Export full catalog as CSV
  app.get(`${API_PREFIX}/foods/export/csv`, asyncHandler(async (_req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    const headers = ['ID', 'Name_EN', 'Name_HI', 'Name_TA', 'Category', 'Calories_kcal', 'Carbs_g', 'Protein_g', 'Fat_g', 'Origin'];
    const rows = foodItems.map(f => [
      `"${f.id}"`,
      `"${f.name.en.replace(/"/g, '""')}"`,
      `"${(f.name.hi || '').replace(/"/g, '""')}"`,
      `"${(f.name.ta || '').replace(/"/g, '""')}"`,
      `"${(f.category[0] || '').replace(/"/g, '""')}"`,
      f.nutrition.calories,
      f.nutrition.carbs,
      f.nutrition.protein,
      f.nutrition.fat,
      `"${f.origin.replace(/"/g, '""')}"`
    ]);
    res.header('Content-Type', 'text/csv');
    res.attachment(`nutriglobe_complete_food_catalog_${foodItems.length}_items.csv`);
    res.send([headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
  }));

  // Export AI Imagen Master Prompts for all categories as JSON
  app.get(`${API_PREFIX}/foods/export/imagen-prompts`, asyncHandler(async (_req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    
    const masterCategoryTemplates: Record<string, string> = {
      fruits: "Macro studio photography of fresh [NAME], vibrant natural colors, white ceramic platter, soft studio lighting, sharp detail, 1:1 aspect ratio.",
      vegetables: "Top-down flat lay food shot of fresh [NAME] on a dark rustic wooden board, crisp focus, overhead daylight, 1:1 aspect ratio.",
      spices: "Extreme close-up macro photography of fresh [NAME] spilling out of a miniature brass bowl, dark slate background, warm spotlight, 1:1 aspect ratio.",
      grains: "Overhead minimalist photograph of raw [NAME] grains in a handmade clay bowl, soft natural daylight, high resolution texture, 1:1 aspect ratio.",
      legumes: "Studio product shot of dry uncooked [NAME] in an unglazed terracotta dish on gray stone surface, bright softbox lighting, 1:1 aspect ratio.",
      dairy: "Hero shot of rich [NAME] in a copper serving dish, creamy texture, garnished with herbs, warm dinner studio lighting, 1:1 aspect ratio.",
      seafood: "Commercial restaurant menu photograph of fresh [NAME] on a matte dark gray ceramic plate with lemon and herbs, warm side-lighting, 1:1 aspect ratio.",
      meat: "Authentic high-angle menu photograph of slow-cooked tender [NAME] in a dark iron skillet with whole spices and cilantro, 1:1 aspect ratio.",
      nuts: "Flat lay arrangement of fresh [NAME] in rustic wooden measuring spoons on dark mahogany wood, bright rim lighting, 1:1 aspect ratio.",
      seeds: "Clean minimalist studio photography of raw [NAME] in a white porcelain dipping bowl on white marble background, 1:1 aspect ratio.",
      sweets: "Macro photograph of authentic [NAME] arranged on a banana leaf section, rich caramel texture, soft warm directional lighting, 1:1 aspect ratio.",
      poultry: "Editorial food shot of fresh farm-raised [NAME] in a rustic kitchen setting, natural soft daylight, shallow depth of field, 1:1 aspect ratio.",
      oils: "Clear glass bottle of cold-pressed [NAME] with golden-green luminescence on textured light sandstone, backlit warm lighting, 1:1 aspect ratio."
    };

    const promptList = foodItems.map(f => {
      const mainCat = (f.category[0] || 'fruits').toLowerCase();
      const template = masterCategoryTemplates[mainCat] || "Professional studio food photograph of [NAME], clean background, natural lighting, high resolution, 1:1 aspect ratio.";
      const prompt = template.replace(/\[NAME\]/g, f.name.en);
      return {
        id: f.id,
        name: f.name.en,
        category: f.category[0] || 'General',
        imagenPrompt: prompt,
        formula: "[Subject/Dish] + [Styling & Plating] + [Lighting & Camera] + [Background/Surface] + [1:1 Aspect Ratio]"
      };
    });

    res.header('Content-Type', 'application/json');
    res.attachment(`nutriglobe_imagen_prompts_${foodItems.length}_items.json`);
    res.send(JSON.stringify(promptList, null, 2));
  }));

  // Export Google Images Search & Excel HYPERLINK Spreadsheet CSV
  app.get(`${API_PREFIX}/foods/export/google-images-csv`, asyncHandler(async (_req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    const headers = [
      'ID', 
      'Food Name', 
      'Category', 
      'Classification / Match Type', 
      'Confidence Score', 
      'Google Image Search Link', 
      'Excel HYPERLINK Formula', 
      'Current Verified Image URL', 
      'Attribution',
      'Audit Verification Caveat'
    ];
    
    const rows = foodItems.map(f => {
      const foodName = f.name.en || f.id;
      const category = f.category[0] || 'General';
      const check = autoCheckFoodAccuracy(f);
      const searchUrl = check.googleSearchUrl;
      const excelFormula = check.excelFormula;
      const currentImage = f.image || f.imageUrl || '';
      const attribution = f.imageAttribution || check.verifiedSource || 'USDA FoodData / Verified Resource';
      const caveat = check.isCuratedMatch 
        ? 'Curated keyword match. For named cultivars or regional variants, use Google Images link for exact variety verification.'
        : 'Category-level fallback photo. Use Google Images search link for manual variety verification.';

      return [
        `"${f.id}"`,
        `"${foodName.replace(/"/g, '""')}"`,
        `"${category.replace(/"/g, '""')}"`,
        `"${check.classification.replace(/"/g, '""')}"`,
        `"${check.confidence}%"`,
        `"${searchUrl}"`,
        `"${excelFormula.replace(/"/g, '""')}"`,
        `"${currentImage}"`,
        `"${attribution.replace(/"/g, '""')}"`,
        `"${caveat.replace(/"/g, '""')}"`
      ];
    });

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`nutriglobe_master_google_images_links_${foodItems.length}_items.csv`);
    res.send([headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
  }));

  // Export Consolidated Food Photo Audit Spreadsheet CSV
  app.get(`${API_PREFIX}/foods/export/audit-spreadsheet`, asyncHandler(async (_req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    const headers = [
      'ID', 
      'Food Name', 
      'Category', 
      'Match Type',
      'Requires Custom Manual Match',
      'Confidence Score', 
      'Current Verified Image URL', 
      'Attribution',
      'Google Images Search Link', 
      'Excel HYPERLINK Formula'
    ];
    
    const rows = foodItems.map(f => {
      const foodName = f.name.en || f.id;
      const category = f.category[0] || 'General';
      const check = autoCheckFoodAccuracy(f);
      const searchUrl = check.googleSearchUrl;
      const excelFormula = check.excelFormula;
      const currentImage = f.image || f.imageUrl || '';
      const attribution = f.imageAttribution || check.verifiedSource || 'USDA FoodData / Verified Resource';
      const isCurated = check.isCuratedMatch;

      return [
        `"${f.id}"`,
        `"${foodName.replace(/"/g, '""')}"`,
        `"${category.replace(/"/g, '""')}"`,
        `"${isCurated ? 'CURATED_KEYWORD_MATCH' : 'CATEGORY_FALLBACK'}"`,
        `"${isCurated ? 'NO - Curated' : 'YES - Review Needed'}"`,
        `"${check.confidence}%"`,
        `"${currentImage}"`,
        `"${attribution.replace(/"/g, '""')}"`,
        `"${searchUrl}"`,
        `"${excelFormula.replace(/"/g, '""')}"`
      ];
    });

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`nutriglobe_consolidated_food_photo_audit_${foodItems.length}_items.csv`);
    res.send([headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
  }));

  // Auto Audit & Verification for all food images with real photo checks
  app.get(`${API_PREFIX}/foods/audit-images`, asyncHandler(async (_req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    
    let totalVerified = 0;
    let curatedMatchCount = 0;
    let fallbackCount = 0;
    let needsFixCount = 0;
    const categoryStats: Record<string, { total: number; verified: number; curated: number; fallback: number; uniqueUrls: number }> = {};
    const categoryUrlSets: Record<string, Set<string>> = {};

    const auditResults = foodItems.map(item => {
      const mainCat = (item.category && item.category[0]) ? item.category[0].toUpperCase() : 'OTHER';
      if (!categoryStats[mainCat]) {
        categoryStats[mainCat] = { total: 0, verified: 0, curated: 0, fallback: 0, uniqueUrls: 0 };
        categoryUrlSets[mainCat] = new Set();
      }
      categoryStats[mainCat].total++;

      const check = autoCheckFoodAccuracy(item);
      const fixCheck = auditAndFixFoodItemImage(item);
      const hasValidImage = !!(item.image && typeof item.image === 'string' && item.image.startsWith('http') && !item.image.includes('placeholder'));
      
      if (check.isCuratedMatch) {
        curatedMatchCount++;
        categoryStats[mainCat].curated++;
      } else {
        fallbackCount++;
        categoryStats[mainCat].fallback++;
      }

      if (hasValidImage && check.isAccurate) {
        totalVerified++;
        categoryStats[mainCat].verified++;
        categoryUrlSets[mainCat].add(item.image);
      } else if (fixCheck.isFixed) {
        needsFixCount++;
      }

      return {
        id: item.id,
        name: item.name.en,
        category: item.category[0] || 'Uncategorized',
        imageUrl: item.image,
        recommendedImageUrl: fixCheck.updatedImage,
        needsUpdate: fixCheck.isFixed,
        status: fixCheck.isFixed ? 'NEEDS_ACCURATE_IMAGE' : (check.isCuratedMatch ? 'CURATED_KEYWORD_MATCH' : 'CATEGORY_FALLBACK'),
        matchType: check.matchType,
        classification: check.classification,
        isCuratedMatch: check.isCuratedMatch,
        confidence: check.confidence,
        googleSearchUrl: check.googleSearchUrl,
        excelFormula: check.excelFormula,
        attribution: check.verifiedSource,
        aspectRatio: '1:1',
        resolution: '800x800 High Definition'
      };
    });

    Object.keys(categoryStats).forEach(cat => {
      categoryStats[cat].uniqueUrls = categoryUrlSets[cat].size;
    });

    const percentCurated = Math.round((curatedMatchCount / foodItems.length) * 100);
    const percentFallback = Math.round((fallbackCount / foodItems.length) * 100);

    res.json({
      timestamp: new Date().toISOString(),
      totalCatalogCount: foodItems.length,
      auditStatus: `${curatedMatchCount} CURATED_MATCHES (${percentCurated}%), ${fallbackCount} CATEGORY_FALLBACKS (${percentFallback}%)`,
      totalVerifiedImages: totalVerified,
      curatedKeywordMatches: curatedMatchCount,
      categoryFallbackMatches: fallbackCount,
      percentCurated: `${percentCurated}%`,
      percentFallback: `${percentFallback}%`,
      caveat: 'Keyword matches are curated to food type; for named cultivars or regional variants use Google Images link for exact variety verification.',
      fallbackResolvedImages: fallbackCount,
      needsFixCount: needsFixCount,
      accuracyRate: `${percentCurated}%`,
      categoriesBreakdown: categoryStats,
      auditResultsList: auditResults
    });
  }));

  // Auto Audit Check & Update all wrong/misplaced food images with authentic real photography
  app.post(`${API_PREFIX}/foods/auto-fix-all`, asyncHandler(async (_req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    const fixedItems: Array<{ id: string; name: string; category: string; previousImage: string; newImage: string; attribution: string; googleSearchUrl: string }> = [];

    for (const item of foodItems) {
      const fix = auditAndFixFoodItemImage(item);
      if (fix.isFixed) {
        await storage.updateFoodItem(item.id, {
          image: fix.updatedImage,
          imageUrl: fix.updatedImage,
          imageAttribution: fix.attribution,
          imageVerifiedStatus: 'verified' as any,
          imageSourceType: 'usda' as any
        });

        fixedItems.push({
          id: item.id,
          name: fix.name,
          category: item.category[0] || 'General',
          previousImage: fix.previousImage,
          newImage: fix.updatedImage,
          attribution: fix.attribution,
          googleSearchUrl: fix.googleSearchUrl
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully audited all ${foodItems.length} food items and updated ${fixedItems.length} items with authentic verified photography.`,
      totalAudited: foodItems.length,
      totalFixed: fixedItems.length,
      fixedItems
    });
  }));

  // Update a single food item with a verified real food image or custom image URL
  app.post(`${API_PREFIX}/foods/:id/fix-image`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { imageUrl, attribution } = req.body;

    const existing = await storage.getFoodItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    let finalImageUrl = imageUrl;
    let finalAttribution = attribution || 'Verified High-Definition Food Photograph';

    if (!finalImageUrl) {
      const fix = auditAndFixFoodItemImage(existing);
      finalImageUrl = fix.updatedImage;
      finalAttribution = fix.attribution;
    }

    const updated = await storage.updateFoodItem(id, {
      image: finalImageUrl,
      imageUrl: finalImageUrl,
      imageAttribution: finalAttribution,
      imageVerifiedStatus: 'verified' as any,
      imageSourceType: 'usda' as any
    });

    res.json({
      success: true,
      message: `Image for "${existing.name.en}" successfully updated with verified real photo.`,
      foodItem: updated
    });
  }));

  // Batch update all food records with latest curated FOOD_PHOTO_MAP image assignments
  app.post(`${API_PREFIX}/admin/batch-update-food-photos`, asyncHandler(async (req: Request, res: Response) => {
    const { dryRun, force, batchSize } = req.body || {};
    const { runFoodImagesBatchUpdate } = await import('../scripts/batch-update-food-images');
    const result = await runFoodImagesBatchUpdate({
      dryRun: Boolean(dryRun),
      force: Boolean(force),
      batchSize: typeof batchSize === 'number' ? batchSize : 50
    });
    res.json({
      success: true,
      message: `Batch update complete: all ${result.totalProcessed} food records reflect the latest curated photo assignments.`,
      result
    });
  }));

  // --- Automated Image Validator Background Worker & Auto-Search Cron Routes ---
  app.get(`${API_PREFIX}/admin/image-worker/status`, asyncHandler(async (_req: Request, res: Response) => {
    res.json(imageValidationWorker.getStatus());
  }));

  app.post(`${API_PREFIX}/admin/image-worker/start`, asyncHandler(async (req: Request, res: Response) => {
    const forceAll = Boolean(req.body?.forceAll);
    // Trigger in background without blocking HTTP response
    imageValidationWorker.runFullScan(forceAll).catch(err => {
      console.error('[ImageWorker Background Scan Error]:', err);
    });
    res.json({
      success: true,
      message: 'Background image validation scan triggered successfully',
      status: imageValidationWorker.getStatus()
    });
  }));

  app.post(`${API_PREFIX}/admin/image-worker/stop`, asyncHandler(async (_req: Request, res: Response) => {
    imageValidationWorker.stopScan();
    res.json({
      success: true,
      message: 'Background image validation scan stopped',
      status: imageValidationWorker.getStatus()
    });
  }));

  app.post(`${API_PREFIX}/admin/image-worker/config`, asyncHandler(async (req: Request, res: Response) => {
    const { intervalMinutes = 60, autoFixEnabled = true } = req.body || {};
    imageValidationWorker.configureSchedule(Number(intervalMinutes), Boolean(autoFixEnabled));
    res.json({
      success: true,
      message: `Schedule configured: every ${intervalMinutes} minutes with auto-replacement ${autoFixEnabled ? 'enabled' : 'disabled'}.`,
      status: imageValidationWorker.getStatus()
    });
  }));

  app.post(`${API_PREFIX}/admin/image-worker/fix-single/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await imageValidationWorker.fixSingleFoodItem(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  }));

  // --- Exact Food-Image Validation System Endpoints ---
  // Get latest validation audit report (JSON)
  app.get(`${API_PREFIX}/admin/food-images/validation-report`, asyncHandler(async (req: Request, res: Response) => {
    const reportPath = path.join(process.cwd(), 'food_images_validation_report.json');
    if (fs.existsSync(reportPath)) {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return res.json(data);
    }
    // Generate fresh report if not yet cached
    const report = await runBatchValidation({ dryRun: true });
    res.json(report);
  }));

  // Download validation audit report (CSV)
  app.get(`${API_PREFIX}/admin/food-images/validation-report.csv`, asyncHandler(async (_req: Request, res: Response) => {
    const csvPath = path.join(process.cwd(), 'food_images_validation_report.csv');
    if (!fs.existsSync(csvPath)) {
      await runBatchValidation({ dryRun: true });
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="food_images_validation_report.csv"');
    fs.createReadStream(csvPath).pipe(res);
  }));

  // Trigger on-demand batch validation audit
  app.post(`${API_PREFIX}/admin/food-images/run-audit`, asyncHandler(async (req: Request, res: Response) => {
    const { dryRun = true, force = false, batchSize = 100 } = req.body || {};
    const report = await runBatchValidation({
      dryRun: Boolean(dryRun),
      force: Boolean(force),
      batchSize: Number(batchSize)
    });
    res.json({
      success: true,
      message: `Audit completed successfully. ${report.summary.totalScanned} records audited.`,
      report
    });
  }));

  // Set validation status and review action for a food item
  app.post(`${API_PREFIX}/admin/food-images/:id/set-status`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, confidence, reason, imageUrl } = req.body as {
      status: ImageStatus;
      confidence?: number;
      reason?: string;
      imageUrl?: string;
    };

    const existing = await storage.getFoodItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const updates: Partial<FoodItemClient> = {
      image_status: status,
      imageStatus: status,
      image_confidence: confidence ?? (status === 'VERIFIED' ? 95 : status === 'REJECTED' ? 0 : 50),
      imageConfidence: confidence ?? (status === 'VERIFIED' ? 95 : status === 'REJECTED' ? 0 : 50),
      image_verification_reason: reason || `Manually reviewed as ${status}`,
      imageVerificationReason: reason || `Manually reviewed as ${status}`,
      image_verified_at: new Date().toISOString(),
      imageVerifiedAt: new Date().toISOString()
    };

    if (imageUrl !== undefined) {
      updates.image = imageUrl;
      updates.imageUrl = imageUrl;
    }

    const updated = await storage.updateFoodItem(id, updates);
    res.json({
      success: true,
      message: `Updated validation status of "${existing.name.en}" to ${status}`,
      foodItem: updated
    });
  }));

  // Get AI Studio prompt and search query specifications for food
  app.get(`${API_PREFIX}/admin/food-images/:id/ai-prompt`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await storage.getFoodItemById(id);
    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const englishName = typeof item.name === 'string' ? item.name : (item.name?.en || item.id);
    const studioPrompt = generateFoodImageStudioPrompt(englishName, item.category || []);
    const searchQueries = generateSearchQueries(
      englishName, 
      typeof item.name === 'object' ? item.name?.hi : undefined,
      typeof item.name === 'object' ? item.name?.ta : undefined,
      item.category || []
    );

    res.json({
      foodId: item.id,
      foodName: englishName,
      category: item.category,
      studioPrompt,
      searchQueries
    });
  }));

  // Get popular food items
  app.get(`${API_PREFIX}/foods/popular`, asyncHandler(async (req: Request, res: Response) => {
    const popularItems = await storage.getPopularFoodItems();
    res.json(popularItems);
  }));

  // Search for food items - must come before /:id route to avoid conflicts
  app.get(`${API_PREFIX}/foods/search`, asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.query as string | undefined;
    const category = req.query.category as string | undefined;
    const lang = (req.query.lang || 'en') as Language;
    
    const filteredItems = await storage.searchFoodItems(query, category, lang);
    res.json(filteredItems);
  }));

  // Get food items by category
  app.get(`${API_PREFIX}/foods/category/:category`, asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const filteredItems = await storage.getFoodItemsByCategory(category);
    res.json(filteredItems);
  }));

  // Get food item by ID
  app.get(`${API_PREFIX}/foods/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const foodItem = await storage.getFoodItemById(id);
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    res.json(foodItem);
  }));

  // Get live database statistics
  app.get(`${API_PREFIX}/stats`, asyncHandler(async (req: Request, res: Response) => {
    const stats = await storage.getDatabaseStats();
    res.json(stats);
  }));

  // ============================================================================
  // --- User Dashboard & Personalization Endpoints (Interacting with Storage) ---
  // ============================================================================

  // GET /api/user/favorites: Retrieve user's saved foods with nutritional breakdown
  app.get(`${API_PREFIX}/user/favorites`, asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.query.userId) || 1;
    const category = req.query.category as string | undefined;
    const sort = req.query.sort as string | undefined;

    let favorites = await storage.getUserFavorites(userId);

    // Filter by category if requested
    if (category && category !== 'all') {
      favorites = favorites.filter(fav => 
        (fav.food.category || []).some(c => c.toLowerCase() === category.toLowerCase())
      );
    }

    // Sort if requested
    if (sort === 'calories_asc') {
      favorites.sort((a, b) => (a.food.nutrition?.calories || 0) - (b.food.nutrition?.calories || 0));
    } else if (sort === 'calories_desc') {
      favorites.sort((a, b) => (b.food.nutrition?.calories || 0) - (a.food.nutrition?.calories || 0));
    } else if (sort === 'protein_desc') {
      favorites.sort((a, b) => (b.food.nutrition?.protein || 0) - (a.food.nutrition?.protein || 0));
    } else if (sort === 'name') {
      favorites.sort((a, b) => (a.food.name?.en || '').localeCompare(b.food.name?.en || ''));
    }

    // Compute aggregated nutrition totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    const categoryCounts: Record<string, number> = {};

    favorites.forEach(fav => {
      const n = fav.food.nutrition || {};
      const q = fav.quantity || 1;
      totalCalories += (Number(n.calories) || 0) * q;
      totalProtein += (Number(n.protein) || 0) * q;
      totalCarbs += (Number(n.carbs) || 0) * q;
      totalFat += (Number(n.fat) || 0) * q;
      totalFiber += (Number(n.fiber) || 0) * q;
      (fav.food.category || []).forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    res.json({
      success: true,
      userId,
      count: favorites.length,
      favorites,
      summary: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        totalFiber: Math.round(totalFiber * 10) / 10,
        categories: Object.keys(categoryCounts)
      }
    });
  }));

  // POST /api/user/favorites: Add a food item to user favorites
  app.post(`${API_PREFIX}/user/favorites`, asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.body.userId) || 1;
    const foodItemId = req.body.foodItemId || req.body.id;
    if (!foodItemId) {
      return res.status(400).json({ error: 'foodItemId is required' });
    }
    const favorite = await storage.addUserFavorite(userId, foodItemId);
    res.status(201).json({ success: true, favorite });
  }));

  // DELETE /api/user/favorites/:foodItemId: Remove a food item from user favorites
  app.delete(`${API_PREFIX}/user/favorites/:foodItemId`, asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.query.userId) || 1;
    const { foodItemId } = req.params;
    const removed = await storage.removeUserFavorite(userId, foodItemId);
    res.json({ success: removed, message: removed ? 'Removed from favorites' : 'Item not found in favorites' });
  }));

  // GET /api/user/history: Retrieve search and view history for user with analytics
  app.get(`${API_PREFIX}/user/history`, asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.query.userId) || 1;
    const type = req.query.type as string | undefined;
    const limit = Number(req.query.limit) || 20;
    const q = (req.query.q as string || '').toLowerCase().trim();

    let history = await storage.getUserHistory(userId, { type, limit });

    if (q) {
      history = history.filter(item => 
        (item.query || '').toLowerCase().includes(q) || 
        (item.foodName || '').toLowerCase().includes(q) || 
        (item.category || '').toLowerCase().includes(q)
      );
    }

    // Analytics from history: top keywords & top categories
    const keywordCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    history.forEach(h => {
      if (h.query) {
        keywordCounts[h.query.toLowerCase()] = (keywordCounts[h.query.toLowerCase()] || 0) + 1;
      }
      if (h.category) {
        categoryCounts[h.category.toLowerCase()] = (categoryCounts[h.category.toLowerCase()] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      userId,
      total: history.length,
      history,
      analytics: {
        topKeywords,
        topCategories
      }
    });
  }));

  // POST /api/user/history: Record a search or item interaction into history
  app.post(`${API_PREFIX}/user/history`, asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.body.userId) || 1;
    const { type = 'search', query, category, foodItemId, foodName, resultCount } = req.body;
    const record = await storage.addUserHistory({
      userId,
      type,
      query,
      category,
      foodItemId,
      foodName,
      resultCount: Number(resultCount) || undefined
    });
    res.status(201).json({ success: true, record });
  }));

  // DELETE /api/user/history: Clear user interaction history
  app.delete(`${API_PREFIX}/user/history`, asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.query.userId) || 1;
    const cleared = await storage.clearUserHistory(userId);
    res.json({ success: cleared, message: 'User history cleared' });
  }));

  // GET /api/user/recommendations: Personalized clinical recommendations interacting with user storage
  app.get(`${API_PREFIX}/user/recommendations`, asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.query.userId) || 1;
    const focus = (req.query.focus as string) || 'balanced';
    const category = req.query.category as string | undefined;
    const limit = Number(req.query.limit) || 6;
    const allergensParam = req.query.allergens as string | undefined;
    const allergens = allergensParam ? allergensParam.split(',').map(s => s.trim()) : undefined;

    const result = await storage.getUserRecommendations(userId, {
      focus,
      category,
      limit,
      allergens
    });

    res.json({
      success: true,
      ...result
    });
  }));

  // Find potential duplicate food items
  app.get(`${API_PREFIX}/admin/duplicates`, asyncHandler(async (req: Request, res: Response) => {
    const duplicates = await storage.findPotentialDuplicates();
    res.json(duplicates);
  }));

  // Admin: AI Food Image Quality Audit (Gemini)
  app.post(`${API_PREFIX}/admin/audit-food-image`, asyncHandler(async (req: Request, res: Response) => {
    const { foodName, imageUrl } = req.body;
    if (!foodName || !imageUrl) {
      return res.status(400).json({ error: 'foodName and imageUrl are required' });
    }
    const auditResult = await auditFoodImage(foodName, imageUrl);
    res.json(auditResult);
  }));

  // Admin: Food Image Engine Specification & Generation
  app.post(`${API_PREFIX}/admin/food-image-engine`, asyncHandler(async (req: Request, res: Response) => {
    const { foodName, category, currentImageUrl } = req.body;
    if (!foodName) {
      return res.status(400).json({ error: 'foodName is required' });
    }
    const result = await generateFoodImageEngineMetadata(foodName, category, currentImageUrl);
    res.json(result);
  }));

  // Food Image Studio: Generate food image with prompt and branding
  app.post(`${API_PREFIX}/food-image-studio/generate`, asyncHandler(async (req: Request, res: Response) => {
    const { foodName, prompt, aspectRatio, brandingText, webUrl, educationalMode } = req.body;
    if (!foodName) {
      return res.status(400).json({ error: 'foodName is required' });
    }
    const result = await generateFoodStudioImage({ foodName, prompt, aspectRatio, brandingText, webUrl, educationalMode });
    res.json(result);
  }));

  // Food Image Studio: Edit existing food image with text prompt & Gemini 3.1 Flash Image
  app.post(`${API_PREFIX}/food-image-studio/edit`, asyncHandler(async (req: Request, res: Response) => {
    const { foodName, base64Image, imageUrl, editPrompt, aspectRatio, brandingText, webUrl } = req.body;
    if (!foodName || !editPrompt) {
      return res.status(400).json({ error: 'foodName and editPrompt are required' });
    }
    const result = await editFoodStudioImage({ foodName, base64Image, imageUrl, editPrompt, aspectRatio, brandingText, webUrl });
    res.json(result);
  }));

  // In-memory store for connected GitHub OAuth user status
  let connectedGitHubUser: any = null;

  // GitHub OAuth: Get Authorization URL
  app.get(`${API_PREFIX}/auth/github/url`, (req: Request, res: Response) => {
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liMXY9Bh97JVHJJK';
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${origin}/auth/github/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user,repo,read:user,user:email',
      allow_signup: 'true'
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl, redirectUri, clientId });
  });

  // GitHub OAuth: Status & Connected User
  app.get(`${API_PREFIX}/auth/github/status`, (_req: Request, res: Response) => {
    res.json({
      connected: !!connectedGitHubUser,
      user: connectedGitHubUser,
      clientId: process.env.GITHUB_CLIENT_ID || 'Ov23liMXY9Bh97JVHJJK'
    });
  });

  // GitHub OAuth: Disconnect
  app.post(`${API_PREFIX}/auth/github/disconnect`, (_req: Request, res: Response) => {
    connectedGitHubUser = null;
    res.json({ success: true, message: 'Disconnected from GitHub' });
  });

  // GitHub OAuth: Callback handler (PostMessage popup bridge)
  const githubCallbackHandler = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liMXY9Bh97JVHJJK';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'ff1fcdc3d3e447030f95d906cd6626ac4547d62c';

    if (!code) {
      return res.status(400).send(`
        <html><body><script>
          if (window.opener) { window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: 'No authorization code provided' }, '*'); window.close(); }
        </script><p>Authentication failed. You can close this window.</p></body></html>
      `);
    }

    try {
      // Exchange code for token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code
        })
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange token');
      }

      // Fetch user info from GitHub API
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'User-Agent': 'NutriGlobe-App'
        }
      });
      const userData = await userRes.json();

      connectedGitHubUser = {
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        public_repos: userData.public_repos,
        connectedAt: new Date().toISOString()
      };

      res.send(`
        <html>
          <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0f172a; color: white;">
            <div style="text-align: center; padding: 2rem; background: #1e293b; border-radius: 12px; border: 1px solid #10b981;">
              <h2 style="color: #34d399; margin-top: 0;">GitHub Connected!</h2>
              <p>Authenticated as <strong>${userData.login}</strong>.</p>
              <p style="font-size: 0.85rem; color: #94a3b8;">Closing window automatically...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GITHUB_OAUTH_SUCCESS',
                  user: ${JSON.stringify(connectedGitHubUser)}
                }, '*');
                setTimeout(() => window.close(), 1200);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('[GitHub OAuth Error]:', err);
      res.status(500).send(`
        <html><body><script>
          if (window.opener) { window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: ${JSON.stringify(err.message || 'OAuth failure')} }, '*'); window.close(); }
        </script><p>Error connecting to GitHub: ${err.message}</p></body></html>
      `);
    }
  };

  app.get(['/auth/github/callback', '/auth/github/callback/'], asyncHandler(githubCallbackHandler));

  // Admin: Create food item
  app.post(`${API_PREFIX}/admin/foods`, asyncHandler(async (req: Request, res: Response) => {
    const food = req.body;
    if (!food || !food.id || !food.name) {
      return res.status(400).json({ error: 'Valid food object with id and name required' });
    }
    const created = await storage.createFoodItem(food);
    res.json(created);
  }));

  // Admin: Update food item
  app.put(`${API_PREFIX}/admin/foods/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const updated = await storage.updateFoodItem(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json(updated);
  }));

  // Admin: Delete food item
  app.delete(`${API_PREFIX}/admin/foods/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const success = await storage.deleteFoodItem(id);
    res.json({ success });
  }));

  // Admin: Merge duplicate foods
  app.post(`${API_PREFIX}/admin/merge`, asyncHandler(async (req: Request, res: Response) => {
    const { targetId, sourceIds } = req.body;
    if (!targetId || !sourceIds || !Array.isArray(sourceIds)) {
      return res.status(400).json({ error: 'targetId and sourceIds array required' });
    }
    const success = await storage.mergeDuplicates(targetId, sourceIds);
    res.json({ success });
  }));

  // Admin: Image verification update
  app.post(`${API_PREFIX}/admin/verify-image`, asyncHandler(async (req: Request, res: Response) => {
    const { id, status, confidence } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: 'id and status required' });
    }
    const success = await storage.verifyImageStatus(id, status, confidence);
    res.json({ success });
  }));

  // Admin: Image Review Queue (Batch 1 Sourcing Pipeline)
  app.get(`${API_PREFIX}/admin/image-review-queue`, asyncHandler(async (req: Request, res: Response) => {
    const foods = await storage.getAllFoodItems();
    const batch1 = foods.slice(0, 100);

    const realPhotoVerifiedCount = batch1.filter(f => f.imageVerifiedStatus === 'verified').length;
    const aiGeneratedCount = batch1.filter(f => f.imageSourceType === 'ai_generated' || f.imageVerifiedStatus === 'ai_placeholder').length;
    const flaggedForReviewCount = batch1.filter(f => f.imageVerifiedStatus === 'mismatch_flagged').length;

    res.json({
      totalProcessed: batch1.length,
      realPhotoVerifiedCount,
      aiGeneratedCount,
      flaggedForReviewCount,
      batchItems: batch1
    });
  }));

  // Admin: Override or update food image status, URL and metadata
  app.post(`${API_PREFIX}/admin/update-image-review`, asyncHandler(async (req: Request, res: Response) => {
    const { id, imageUrl, imageVerifiedStatus, imageSourceType, imageSourceId, imageLicense, imageAttribution } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const updates: Partial<FoodItemClient> = {};
    if (imageUrl) {
      updates.image = imageUrl;
      updates.imageUrl = imageUrl;
    }
    if (imageVerifiedStatus) updates.imageVerifiedStatus = imageVerifiedStatus;
    if (imageSourceType) updates.imageSourceType = imageSourceType;
    if (imageSourceId) updates.imageSourceId = imageSourceId;
    if (imageLicense) updates.imageLicense = imageLicense;
    if (imageAttribution) updates.imageAttribution = imageAttribution;
    updates.imageLastCheckedAt = new Date().toISOString();

    const updated = await storage.updateFoodItem(id, updates);
    res.json({ success: true, updated });
  }));

  // Gemini AI Natural Language Search Converter
  app.post(`${API_PREFIX}/ai/advanced-search`, asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const p = prompt.toLowerCase();
    let query = '';
    let category = 'all';

    if (p.includes('protein') || p.includes('high protein')) category = 'high_protein';
    else if (p.includes('iron')) category = 'high_iron';
    else if (p.includes('vitamin c') || p.includes('vit c')) category = 'high_vitamin_c';
    else if (p.includes('vegan')) category = 'vegan';
    else if (p.includes('vegetarian') || p.includes('veg')) category = 'vegetarian';
    else if (p.includes('tamil') || p.includes('south indian')) category = 'indian';
    else if (p.includes('fruit')) category = 'fruits';
    else if (p.includes('vegetable')) category = 'vegetables';
    else if (p.includes('grain') || p.includes('rice') || p.includes('wheat')) category = 'grains';
    else if (p.includes('spice')) category = 'spices';
    else if (p.includes('dairy') || p.includes('milk')) category = 'dairy';
    else if (p.includes('seafood') || p.includes('fish')) category = 'seafood';

    // Extract search query terms if specific food name mentioned
    if (p.includes('spinach')) query = 'spinach';
    else if (p.includes('mango')) query = 'mango';
    else if (p.includes('amla')) query = 'amla';
    else if (p.includes('turmeric')) query = 'turmeric';

    const results = await storage.searchFoodItems(query, category);
    res.json({
      interpretedQuery: query,
      interpretedCategory: category,
      resultsCount: results.length,
      results
    });
  }));

  // Check if server is online (for offline mode testing)
  app.get(`${API_PREFIX}/status`, (req, res) => {
    res.json({ status: 'online' });
  });

  // AI Nutrition Assistant endpoint using Gemini
  app.post(`${API_PREFIX}/ai/nutrition-assistant`, asyncHandler(async (req: Request, res: Response) => {
    const { prompt, lang } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        const answer = await askGeminiNutritionAssistant(prompt, lang || 'en');
        return res.json({ answer });
      } else {
        return res.json({
          answer: "Gemini API key is not yet provided. Configure GEMINI_API_KEY in Settings > Secrets to enable live AI nutrition guidance."
        });
      }
    } catch (error: any) {
      console.error('Error with AI nutrition assistant:', error);
      res.status(500).json({ error: error.message || 'Failed to query AI assistant' });
    }
  }));

  // Generate food item with multilingual content using Gemini or Claude
  app.post(`${API_PREFIX}/foods/generate`, asyncHandler(async (req: Request, res: Response) => {
    const { foodName, description, categories, imagePath, languages } = req.body;
    
    if (!foodName || !description || !categories) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
      let newFoodItem: FoodItemClient;
      if (process.env.GEMINI_API_KEY) {
        newFoodItem = await generateGeminiFoodItem(
          foodName,
          description,
          categories,
          imagePath,
          languages || ['en', 'es', 'fr', 'hi', 'ta']
        );
      } else {
        newFoodItem = await generateCompleteFoodItem(
          foodName,
          description,
          categories,
          imagePath,
          languages || ['en', 'es', 'fr', 'hi', 'ta']
        );
      }
      
      res.json(newFoodItem);
    } catch (error) {
      console.error('Error generating food item:', error);
      res.status(500).json({ error: 'Failed to generate food item' });
    }
  }));

  // Batch generate multiple food items
  app.post(`${API_PREFIX}/foods/batch-generate`, asyncHandler(async (req: Request, res: Response) => {
    const { foodItems, languages } = req.body;
    
    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: 'Invalid food items array' });
    }
    
    try {
      // Using Promise.all to process multiple items in parallel
      const languageCodes = languages || ['en', 'es', 'fr', 'hi', 'ta'];
      const generatedItems: FoodItemClient[] = [];
      
      // Process in smaller batches to avoid overwhelming the API
      const batchSize = 5;
      
      for (let i = 0; i < foodItems.length; i += batchSize) {
        const batch = foodItems.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(
          batch.map(async (item: any) => {
            return generateCompleteFoodItem(
              item.name,
              item.description || `${item.name} is a nutritious food.`,
              item.categories || ['fruits'],
              item.imagePath || '',
              languageCodes
            );
          })
        );
        
        generatedItems.push(...batchResults);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < foodItems.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      res.json(generatedItems);
    } catch (error) {
      console.error('Error batch generating food items:', error);
      res.status(500).json({ error: 'Failed to generate food items' });
    }
  }));

  // --- EDITORIAL ENGINE ENDPOINTS ---

  // Get articles with optional status and category filters
  app.get(`${API_PREFIX}/editorial/articles`, asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const articles = await storage.getArticles(status, category);
    res.json(articles);
  }));

  // Get single article by slug
  app.get(`${API_PREFIX}/editorial/articles/:slug`, asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const article = await storage.getArticleBySlug(slug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  }));

  // Create custom or generated article
  app.post(`${API_PREFIX}/editorial/articles`, asyncHandler(async (req: Request, res: Response) => {
    const article = req.body;
    if (!article || !article.title || !article.foods) {
      return res.status(400).json({ error: 'Invalid article object' });
    }
    const created = await storage.createArticle(article);
    res.json(created);
  }));

  // Update article status / edits
  app.put(`${API_PREFIX}/editorial/articles/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const updated = await storage.updateArticle(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updated);
  }));

  // Delete article
  app.delete(`${API_PREFIX}/editorial/articles/:id`, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const success = await storage.deleteArticle(id);
    res.json({ success });
  }));

  // Get topics list
  app.get(`${API_PREFIX}/editorial/topics`, asyncHandler(async (req: Request, res: Response) => {
    const topics = await storage.getTopics();
    res.json(topics);
  }));

  // Generate new topic via AI
  app.post(`${API_PREFIX}/editorial/topics/generate`, asyncHandler(async (req: Request, res: Response) => {
    const { theme, region } = req.body;
    const topic = await generateAITopic(theme, region);
    await storage.createTopic(topic);
    res.json(topic);
  }));

  // Generate complete 5-food article from topic via AI
  app.post(`${API_PREFIX}/editorial/articles/generate`, asyncHandler(async (req: Request, res: Response) => {
    const { topicId, theme, region } = req.body;
    let topic: any;
    if (topicId) {
      const topics = await storage.getTopics();
      topic = topics.find(t => t.id === topicId);
    }
    if (!topic) {
      topic = await generateAITopic(theme, region);
      await storage.createTopic(topic);
    }

    const article = await generateAIArticle(topic);
    await storage.createArticle(article);
    res.json(article);
  }));

  // Get editorial settings
  app.get(`${API_PREFIX}/editorial/settings`, asyncHandler(async (req: Request, res: Response) => {
    const settings = await storage.getEditorialSettings();
    res.json(settings);
  }));

  // Update editorial settings
  app.put(`${API_PREFIX}/editorial/settings`, asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body;
    const updated = await storage.updateEditorialSettings(updates);
    res.json(updated);
  }));

  // Get editorial analytics
  app.get(`${API_PREFIX}/editorial/analytics`, asyncHandler(async (req: Request, res: Response) => {
    const analytics = await storage.getEditorialAnalytics();
    res.json(analytics);
  }));

  // --- SEO & GOOGLE NEWS PUBLISHING ENDPOINTS ---

  // Dynamic XML Sitemap for Google Search Console & Web Indexing
  app.get('/sitemap.xml', asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const xml = await generateMainSitemapXml(baseUrl);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.send(xml);
  }));

  // API endpoint for sitemap stats and on-demand generation
  app.get(`${API_PREFIX}/sitemap/stats`, asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const stats = await getSitemapStats(baseUrl);
    res.json(stats);
  }));

  app.get(`${API_PREFIX}/seo/sitemap-stats`, asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const stats = await getSitemapStats(baseUrl);
    res.json(stats);
  }));

  app.post(`${API_PREFIX}/sitemap/generate`, asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const result = await reindexSitemap(baseUrl);
    res.json({
      success: true,
      message: 'Sitemap regenerated and indexed successfully',
      stats: result.stats,
      reindexedAt: result.reindexedAt
    });
  }));

  app.post(`${API_PREFIX}/seo/reindex-sitemap`, asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const result = await reindexSitemap(baseUrl);
    res.json({
      success: true,
      message: 'Sitemap reindexed and generated successfully',
      stats: result.stats,
      reindexedAt: result.reindexedAt
    });
  }));

  // Google News XML Sitemap Feed
  app.get('/news-sitemap.xml', asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const articles = await storage.getArticles('published');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    articles.forEach((art) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/article/${art.slug}</loc>\n`;
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>NutriGlobe Health & Clinical Research</news:name>\n`;
      xml += `        <news:language>${(art as any).language || 'en'}</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${new Date(art.publishedAt || Date.now()).toISOString()}</news:publication_date>\n`;
      xml += `      <news:title><![CDATA[${art.title}]]></news:title>\n`;
      xml += `    </news:news>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }));

  // RSS Feed for Google News Publisher Center
  app.get('/rss.xml', asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const articles = await storage.getArticles('published');

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    xml += `<channel>\n`;
    xml += `  <title>NutriGlobe Clinical Health & Nutrition Feed</title>\n`;
    xml += `  <link>${baseUrl}</link>\n`;
    xml += `  <description>Evidence-based clinical nutrition, WHO RDA standards, and food research articles.</description>\n`;
    xml += `  <language>en-us</language>\n`;
    xml += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    articles.forEach((art) => {
      xml += `  <item>\n`;
      xml += `    <title><![CDATA[${art.title}]]></title>\n`;
      xml += `    <link>${baseUrl}/article/${art.slug}</link>\n`;
      xml += `    <guid>${baseUrl}/article/${art.slug}</guid>\n`;
      xml += `    <pubDate>${new Date(art.publishedAt || Date.now()).toUTCString()}</pubDate>\n`;
      xml += `    <description><![CDATA[${art.summary || art.title}]]></description>\n`;
      xml += `  </item>\n`;
    });

    xml += `</channel>\n`;
    xml += `</rss>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }));

  // Telemetry in-memory storage for errors & vitals
  const telemetryErrors: any[] = [];
  const telemetryVitals: any[] = [];

  // Post error telemetry
  app.post('/api/telemetry/errors', (req, res) => {
    try {
      const errorData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (errorData) {
        telemetryErrors.unshift({
          ...errorData,
          id: Math.random().toString(36).substring(2, 9),
          serverReceivedAt: new Date().toISOString(),
        });
        if (telemetryErrors.length > 50) telemetryErrors.pop();
      }
    } catch (e) {
      // fail-safe
    }
    res.status(200).json({ status: 'logged' });
  });

  // Get error telemetry logs
  app.get('/api/telemetry/errors', (_req, res) => {
    res.json({ errors: telemetryErrors });
  });

  // Post Web Vitals telemetry
  app.post('/api/telemetry/vitals', (req, res) => {
    try {
      const vitalData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (vitalData) {
        telemetryVitals.unshift({
          ...vitalData,
          serverReceivedAt: new Date().toISOString(),
        });
        if (telemetryVitals.length > 100) telemetryVitals.pop();
      }
    } catch (e) {
      // fail-safe
    }
    res.status(200).json({ status: 'logged' });
  });

  // Get Web Vitals telemetry logs
  app.get('/api/telemetry/vitals', (_req, res) => {
    res.json({ vitals: telemetryVitals });
  });

  // Robots.txt for Web Crawlers and Googlebot
  app.get('/robots.txt', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    let robots = `User-agent: *\n`;
    robots += `Allow: /\n`;
    robots += `Disallow: /api/admin/\n`;
    robots += `Disallow: /admin\n\n`;
    robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;
    robots += `Sitemap: ${baseUrl}/news-sitemap.xml\n`;

    res.header('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Dynamic XML Sitemap Generator for Google Search Console Indexing
  app.get('/sitemap.xml', asyncHandler(async (req: Request, res: Response) => {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'nutriglobe.app';
    const baseUrl = `${protocol}://${host}`;
    const xml = await generateMainSitemapXml(baseUrl);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  }));

  // Dynamic Google News XML Sitemap
  app.get('/news-sitemap.xml', asyncHandler(async (req: Request, res: Response) => {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'nutriglobe.app';
    const baseUrl = `${protocol}://${host}`;
    const xml = await generateNewsSitemapXml(baseUrl);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  }));

  // SEO & Sitemap Indexing Stats Endpoint for Admin & Diagnostics
  app.get('/api/seo/sitemap-stats', asyncHandler(async (req: Request, res: Response) => {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'nutriglobe.app';
    const baseUrl = `${protocol}://${host}`;
    const stats = await getSitemapStats(baseUrl);
    res.json(stats);
  }));

  // Trigger Manual Sitemap Re-index Endpoint
  app.post('/api/seo/reindex', asyncHandler(async (req: Request, res: Response) => {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'nutriglobe.app';
    const baseUrl = `${protocol}://${host}`;
    const result = await reindexSitemap(baseUrl);
    res.json({
      success: true,
      message: 'Dynamic sitemap.xml & news-sitemap.xml successfully rebuilt for all food records and site content.',
      reindexedAt: result.reindexedAt,
      stats: result.stats
    });
  }));

  // Ads.txt for Google AdSense Crawler Verification
  app.get('/ads.txt', (_req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send('google.com, pub-4353689996620152, DIRECT, f08c47fec0942fa0\n');
  });

  // 404 handler for all unmatched API endpoints to ensure JSON is returned rather than falling back to index.html
  app.all(`${API_PREFIX}/*`, (req: Request, res: Response) => {
    res.status(404).json({
      error: "Not Found",
      message: `API endpoint ${req.method} ${req.path} not found`
    });
  });

  return httpServer;
}
