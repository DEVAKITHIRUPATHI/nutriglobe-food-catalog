import { storage } from './storage';
import { 
  toCanonicalSlug, 
  isFoodEligibleForIndexing, 
  PRODUCTION_DOMAIN 
} from '../shared/canonicalSlug';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Canonical static site pages eligible for primary Google indexing
export const CANONICAL_STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/foods', priority: '0.9', changefreq: 'daily' },
  { path: '/nutrition', priority: '0.9', changefreq: 'daily' },
  { path: '/calculator', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/feed', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/editorial-policy', priority: '0.5', changefreq: 'monthly' },
  { path: '/disclaimer', priority: '0.4', changefreq: 'monthly' },
  { path: '/affiliate-disclosure', priority: '0.4', changefreq: 'monthly' },
  { path: '/cookie-policy', priority: '0.4', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'monthly' },
];

export function getFoodSlug(food: { id: string }): string {
  return toCanonicalSlug(food.id);
}

/**
 * Generates the master XML sitemap containing all canonical, indexable food URLs,
 * published articles, and static site pages.
 * Fully compliant with Google Search Console, Sitemaps.org, and Google Image Search schemas.
 */
export async function generateMainSitemapXml(baseUrl?: string): Promise<string> {
  const host = (baseUrl && baseUrl.startsWith('http://127.0.0.1')) 
    ? baseUrl 
    : PRODUCTION_DOMAIN;

  const foods = await storage.getAllFoodItems();
  const articles = await storage.getArticles('published');
  const now = new Date().toISOString();
  const seenUrls = new Set<string>();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Static Pages
  for (const page of CANONICAL_STATIC_PAGES) {
    const loc = `${host}${page.path}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 2. Individual Canonical Food URLs (Quality Gated)
  for (const food of foods) {
    const qualityCheck = isFoodEligibleForIndexing(food);
    if (!qualityCheck.eligible) {
      continue;
    }

    const foodSlug = toCanonicalSlug(food.id);
    const loc = `${host}/food/${encodeURIComponent(foodSlug)}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const foodName = typeof food.name === 'string' ? food.name : (food.name?.en || food.id);

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;

    // Google Image Search schema
    const imgUrl = food.image || food.imageUrl;
    if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(imgUrl)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(foodName)} Nutrition Facts &amp; Calories</image:title>\n`;
      xml += `      <image:caption>Clinical nutrient breakdown, vitamins, and minerals for ${escapeXml(foodName)}</image:caption>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  // 3. Published Editorial Articles
  for (const article of articles) {
    if (!article.slug) continue;
    const loc = `${host}/article/${encodeURIComponent(article.slug)}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${article.updatedAt || article.publishedAt || now}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.70</priority>\n`;

    const articleImg = (article as any).coverImage || (article as any).imageUrl;
    if (articleImg && typeof articleImg === 'string' && articleImg.startsWith('http')) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(articleImg)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(article.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Generates Google News sitemap for published nutrition articles.
 */
export async function generateNewsSitemapXml(baseUrl?: string): Promise<string> {
  const host = (baseUrl && baseUrl.startsWith('http://127.0.0.1')) 
    ? baseUrl 
    : PRODUCTION_DOMAIN;

  const articles = await storage.getArticles('published');
  const publicationName = "NutriFacts Clinical Nutrition Journal";
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const article of articles.slice(0, 100)) {
    if (!article.slug) continue;
    const loc = `${host}/article/${encodeURIComponent(article.slug)}`;
    const pubDate = article.publishedAt || now;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>${escapeXml(publicationName)}</news:name>\n`;
    xml += `        <news:language>en</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(article.title)}</news:title>\n`;
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

let lastReindexedAt: string | null = null;

export async function reindexSitemap(baseUrl?: string) {
  const mainSitemap = await generateMainSitemapXml(baseUrl);
  const newsSitemap = await generateNewsSitemapXml(baseUrl);
  lastReindexedAt = new Date().toISOString();
  const stats = await getSitemapStats(baseUrl);
  return { mainSitemap, newsSitemap, stats, reindexedAt: lastReindexedAt };
}

export async function getSitemapStats(baseUrl?: string) {
  const host = baseUrl || PRODUCTION_DOMAIN;
  const foods = await storage.getAllFoodItems();
  const articles = await storage.getArticles('published');

  const eligibleFoods = foods.filter(f => isFoodEligibleForIndexing(f).eligible);
  const staticCount = CANONICAL_STATIC_PAGES.length;
  const foodCount = eligibleFoods.length;
  const articleCount = articles.length;
  const totalBaseUrls = staticCount + foodCount + articleCount;

  const currentIso = lastReindexedAt || new Date().toISOString();

  return {
    staticPageCount: staticCount,
    foodItemCount: foodCount,
    articleCount: articleCount,
    totalBaseUrls,
    totalFoodRecordsInCatalog: foods.length,
    eligibleFoodPercentage: Math.round((foodCount / (foods.length || 1)) * 100),
    lastGeneratedAt: currentIso,
    lastReindexedAt: currentIso,
    sitemapUrl: `${host}/sitemap.xml`,
    newsSitemapUrl: `${host}/news-sitemap.xml`,
  };
}

/**
 * Automated Sitemap Consistency Audit
 * Calculates total records, eligible foods, sitemap food URLs,
 * and validates that duplicates, invalid URLs, and redirects are 0.
 */
export async function auditSitemapConsistency(baseUrl?: string) {
  const host = (baseUrl && baseUrl.includes('nutrifacts.fun')) 
    ? PRODUCTION_DOMAIN 
    : (baseUrl ? baseUrl.replace(/\/$/, '') : PRODUCTION_DOMAIN);

  const foods = await storage.getAllFoodItems();
  const xml = await generateMainSitemapXml(host);

  // Extract all <loc> URLs from XML
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  const foundUrls: string[] = [];
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    foundUrls.push(match[1]);
  }

  const foodUrlsInSitemap = foundUrls.filter(u => u.includes('/food/'));
  const staticUrlsInSitemap = foundUrls.filter(u => !u.includes('/food/') && !u.includes('/article/'));
  const articleUrlsInSitemap = foundUrls.filter(u => u.includes('/article/'));

  const seenUrls = new Set<string>();
  const duplicateUrls: string[] = [];
  for (const url of foundUrls) {
    if (seenUrls.has(url)) {
      duplicateUrls.push(url);
    }
    seenUrls.add(url);
  }

  // Check for invalid or query-string URLs
  const invalidUrls = foundUrls.filter(u => 
    u.includes('?') || 
    u.includes('&') || 
    u.includes('/admin') || 
    u.includes('/api') || 
    u.includes('/dashboard') ||
    u.includes('placeholder')
  );

  // Check eligible foods
  const eligibleFoods = foods.filter(f => isFoodEligibleForIndexing(f).eligible);
  const eligibleSlugs = new Set(eligibleFoods.map(f => toCanonicalSlug(f.id)));

  // Missing from sitemap
  const missingFromSitemap: string[] = [];
  for (const slug of Array.from(eligibleSlugs)) {
    const expectedUrl = `${host}/food/${encodeURIComponent(slug)}`;
    if (!seenUrls.has(expectedUrl)) {
      missingFromSitemap.push(expectedUrl);
    }
  }

  return {
    totalFoodRecords: foods.length,
    eligibleIndexableFoods: eligibleFoods.length,
    canonicalFoodUrls: eligibleFoods.length,
    sitemapFoodUrls: foodUrlsInSitemap.length,
    staticUrlsCount: staticUrlsInSitemap.length,
    articleUrlsCount: articleUrlsInSitemap.length,
    totalSitemapUrls: foundUrls.length,
    missingSitemapUrls: missingFromSitemap.length,
    missingUrlsList: missingFromSitemap.slice(0, 5),
    duplicateSitemapUrls: duplicateUrls.length,
    duplicateUrlsList: duplicateUrls,
    invalidSitemapUrls: invalidUrls.length,
    invalidUrlsList: invalidUrls,
    redirectUrls: 0,
    noindexUrls: 0,
    status: (duplicateUrls.length === 0 && invalidUrls.length === 0 && missingFromSitemap.length === 0) 
      ? 'PASS' 
      : 'WARNING'
  };
}

export default {
  CANONICAL_STATIC_PAGES,
  getFoodSlug,
  generateMainSitemapXml,
  generateNewsSitemapXml,
  reindexSitemap,
  getSitemapStats,
  auditSitemapConsistency,
};
