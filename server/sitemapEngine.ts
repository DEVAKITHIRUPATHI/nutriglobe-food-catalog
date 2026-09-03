import { storage } from './storage';

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

// 45 Supported Language Codes for Multi-Language SEO
export const SEO_LANGUAGES = [
  'en', 'ta', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 
  'ru', 'pt', 'te', 'mr', 'bn', 'pa', 'gu', 'kn', 'ml', 'ur', 
  'it', 'nl', 'sv', 'tr', 'pl', 'da', 'fi', 'no', 'cs', 'hu', 
  'el', 'ro', 'sk', 'uk', 'bg', 'hr', 'sr', 'vi', 'id', 'ms', 
  'th', 'fa', 'he', 'sw', 'af'
];

export async function generateMainSitemapXml(baseUrl: string): Promise<string> {
  const host = baseUrl.replace(/\/$/, '');
  const foods = await storage.getAllFoodItems();
  const articles = await storage.getArticles('published');

  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/foods', priority: '0.9', changefreq: 'daily' },
    { path: '/nutrition', priority: '0.9', changefreq: 'daily' },
    { path: '/calculator', priority: '0.9', changefreq: 'weekly' },
    { path: '/blog', priority: '0.8', changefreq: 'daily' },
    { path: '/feed', priority: '0.8', changefreq: 'daily' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/editorial-policy', priority: '0.4', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'monthly' },
  ];

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Static Pages with Multi-Language Hreflangs
  for (const page of staticPages) {
    const loc = `${host}${page.path}`;
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;

    // Multi-Language hreflangs
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}" />\n`;
    for (const lang of SEO_LANGUAGES) {
      const langUrl = `${loc}${loc.includes('?') ? '&' : '?'}lang=${lang}`;
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(langUrl)}" />\n`;
    }
    xml += `  </url>\n`;
  }

  // 2. Food Item Pages with Image Metadata and Multi-Language Hreflangs
  for (const food of foods) {
    const foodPath = `/foods?item=${encodeURIComponent(food.id)}`;
    const loc = `${host}${foodPath}`;
    const foodName = food.name?.en || food.id;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;

    // Image tag for Google Image Search indexing
    if (food.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(food.image)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(foodName)} Nutrition Facts & Calorie Counter</image:title>\n`;
      xml += `    </image:image>\n`;
    }

    // Multi-Language hreflangs for foods
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}" />\n`;
    for (const lang of SEO_LANGUAGES) {
      const langUrl = `${loc}&amp;lang=${lang}`;
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(langUrl)}" />\n`;
    }

    xml += `  </url>\n`;
  }

  // 3. Article Pages
  for (const article of articles) {
    const articlePath = `/article/${encodeURIComponent(article.slug)}`;
    const loc = `${host}${articlePath}`;

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${article.updatedAt || article.publishedAt || now}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;

    if (article.imageUrl) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(article.imageUrl)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(article.title)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}" />\n`;
    for (const lang of SEO_LANGUAGES) {
      const langUrl = `${loc}?lang=${lang}`;
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(langUrl)}" />\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

export async function generateNewsSitemapXml(baseUrl: string): Promise<string> {
  const host = baseUrl.replace(/\/$/, '');
  const articles = await storage.getArticles('published');
  const publicationName = "NutriGlobe Clinical Health Journal";
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const article of articles.slice(0, 50)) {
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

export async function reindexSitemap(baseUrl: string) {
  const mainSitemap = await generateMainSitemapXml(baseUrl);
  const newsSitemap = await generateNewsSitemapXml(baseUrl);
  lastReindexedAt = new Date().toISOString();
  const stats = await getSitemapStats(baseUrl);
  return { mainSitemap, newsSitemap, stats, reindexedAt: lastReindexedAt };
}

export async function getSitemapStats(baseUrl: string) {
  const foods = await storage.getAllFoodItems();
  const articles = await storage.getArticles('published');
  const staticCount = 9;
  const foodCount = foods.length;
  const articleCount = articles.length;
  const totalBaseUrls = staticCount + foodCount + articleCount;
  const totalIndexedHreflangs = totalBaseUrls * SEO_LANGUAGES.length;

  const currentIso = lastReindexedAt || new Date().toISOString();

  return {
    staticPageCount: staticCount,
    foodItemCount: foodCount,
    articleCount: articleCount,
    totalBaseUrls,
    supportedLanguagesCount: SEO_LANGUAGES.length,
    totalIndexedHreflangs,
    lastGeneratedAt: currentIso,
    lastReindexedAt: currentIso,
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    newsSitemapUrl: `${baseUrl}/news-sitemap.xml`,
  };
}
