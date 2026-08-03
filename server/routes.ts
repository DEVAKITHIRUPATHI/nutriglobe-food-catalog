import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { Language, FoodItemClient } from "../shared/schema";
import { generateCompleteFoodItem } from "./utils/anthropicHelper";
import { askGeminiNutritionAssistant, generateGeminiFoodItem } from "./utils/geminiHelper";
import { auditFoodImage, generateFoodImageEngineMetadata } from "./imageAuditService";
import { generateFoodStudioImage, editFoodStudioImage } from "./foodImageStudioService";
import { generateAITopic, generateAIArticle } from "./utils/editorialEngine";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes prefix
  const API_PREFIX = "/api";

  // Error handling middleware
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Get all food items
  app.get(`${API_PREFIX}/foods`, asyncHandler(async (req: Request, res: Response) => {
    const foodItems = await storage.getAllFoodItems();
    res.json(foodItems);
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

  // Dynamic XML Sitemap for Google Search Console & Indexing
  app.get('/sitemap.xml', asyncHandler(async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host') || 'nutriglobe.app'}`;
    const foods = await storage.getAllFoodItems();
    const articles = await storage.getArticles('published');

    const staticPages = [
      '',
      '/foods',
      '/nutrition',
      '/calculator',
      '/blog',
      '/feed',
      '/about',
      '/editorial-policy',
      '/privacy',
      '/terms',
      '/contact',
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    // Static Pages
    staticPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic Foods
    foods.forEach((food) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/foods?id=${food.id}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic Editorial Articles
    articles.forEach((art) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/article/${art.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(art.publishedAt || Date.now()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
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
      xml += `        <news:language>${art.language || 'en'}</news:language>\n`;
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

  // Ads.txt for Google AdSense Crawler Verification
  app.get('/ads.txt', (_req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send('google.com, pub-4353689996620152, DIRECT, f08c47fec0942fa0\n');
  });

  return httpServer;
}
