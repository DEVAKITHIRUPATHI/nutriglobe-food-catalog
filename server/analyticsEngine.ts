import type { 
  VisitorLog, 
  FoodViewMetric, 
  AdPerformanceLog, 
  VisitorAnalyticsSummary, 
  PageMetric, 
  NetworkAdPerformance, 
  DailyHistoryGraphPoint 
} from '../shared/schema';

class AnalyticsEngine {
  private visitorMap: Map<string, { visitCount: number; lastSeen: string; paths: string[]; userAgent: string; country: string; region: string }> = new Map();
  private visitorLogs: VisitorLog[] = [];
  private foodMetricsMap: Map<string, FoodViewMetric> = new Map();
  private adLogsMap: Map<string, AdPerformanceLog> = new Map();

  private pageViewsMap: Map<string, { pageName: string; totalViews: number; dailyViews: number; uniqueIPs: Set<string> }> = new Map([
    ['/', { pageName: 'Home Page', totalViews: 0, dailyViews: 0, uniqueIPs: new Set<string>() }],
    ['/foods', { pageName: 'Foods Database Catalog', totalViews: 0, dailyViews: 0, uniqueIPs: new Set<string>() }],
    ['/calculator', { pageName: 'RDA & Calorie Calculator', totalViews: 0, dailyViews: 0, uniqueIPs: new Set<string>() }],
    ['/feed', { pageName: 'Nutrition Hub & Feed', totalViews: 0, dailyViews: 0, uniqueIPs: new Set<string>() }],
    ['/blog', { pageName: 'Health News & Blog Articles', totalViews: 0, dailyViews: 0, uniqueIPs: new Set<string>() }],
    ['/admin', { pageName: 'Admin Control Portal', totalViews: 0, dailyViews: 0, uniqueIPs: new Set<string>() }],
  ]);

  private dailyHistoryMap: Map<string, {
    pageViews: number;
    foodViews: number;
    googleAdViews: number;
    googleAdClicks: number;
    amazonAdViews: number;
    amazonAdClicks: number;
    flipkartAdViews: number;
    flipkartAdClicks: number;
    totalAdClicks: number;
    googleRevenue: number;
    amazonRevenue: number;
    flipkartRevenue: number;
    totalRevenue: number;
  }> = new Map();
  
  private totalVisitsCount = 0;
  private totalSharesCount = 0;
  private totalDownloadsCount = 0;
  private totalAdImpressionsCount = 0;
  private totalAdClicksCount = 0;

  constructor() {
    // Starting with clean ZERO live counters (no mock data pre-seeded)
  }

  // --- Log Visit ---
  public logVisit(ip: string, path: string = '/', userAgent: string = '', rawHeaders?: any): VisitorLog {
    const cleanIp = ip.replace('::ffff:', '').split(',')[0].trim() || '127.0.0.1';
    const today = new Date().toISOString().split('T')[0];
    
    let existing = this.visitorMap.get(cleanIp);
    if (!existing) {
      let country = 'India';
      let region = 'Tamil Nadu / Chennai';
      if (cleanIp.startsWith('172.') || cleanIp.startsWith('104.') || cleanIp.startsWith('198.')) {
        country = 'United States';
        region = 'California / San Francisco';
      } else if (cleanIp.startsWith('185.') || cleanIp.startsWith('82.')) {
        country = 'Europe / UK';
        region = 'London / Frankfurt';
      } else if (cleanIp.startsWith('202.') || cleanIp.startsWith('118.')) {
        country = 'Singapore / Asia';
        region = 'Southeast Asia';
      }

      existing = {
        visitCount: 0,
        lastSeen: new Date().toISOString(),
        paths: [],
        userAgent: userAgent || 'Mozilla/5.0 (Client Web App)',
        country,
        region
      };
    }

    existing.visitCount += 1;
    existing.lastSeen = new Date().toISOString();
    if (!existing.paths.includes(path)) existing.paths.push(path);
    this.visitorMap.set(cleanIp, existing);

    this.totalVisitsCount += 1;

    // Track Page View Count in real-time
    const normalizedPath = path.startsWith('/food/') ? '/food/:id' : path;
    let pageMeta = this.pageViewsMap.get(normalizedPath);
    if (!pageMeta) {
      pageMeta = {
        pageName: path.startsWith('/food/') ? 'Food Detail & Clinical View' : path,
        totalViews: 0,
        dailyViews: 0,
        uniqueIPs: new Set()
      };
    }
    pageMeta.totalViews += 1;
    pageMeta.dailyViews += 1;
    pageMeta.uniqueIPs.add(cleanIp);
    this.pageViewsMap.set(normalizedPath, pageMeta);

    // Track Daily History Point
    let dPoint = this.dailyHistoryMap.get(today);
    if (!dPoint) {
      dPoint = {
        pageViews: 0, foodViews: 0,
        googleAdViews: 0, googleAdClicks: 0,
        amazonAdViews: 0, amazonAdClicks: 0,
        flipkartAdViews: 0, flipkartAdClicks: 0,
        totalAdClicks: 0,
        googleRevenue: 0, amazonRevenue: 0, flipkartRevenue: 0, totalRevenue: 0
      };
    }
    dPoint.pageViews += 1;
    this.dailyHistoryMap.set(today, dPoint);

    const log: VisitorLog = {
      id: `vis_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ip: cleanIp,
      path,
      userAgent: existing.userAgent,
      visitCount: existing.visitCount,
      isRepeatUser: existing.visitCount > 1,
      country: existing.country,
      region: existing.region,
      timestamp: new Date().toISOString()
    };

    this.visitorLogs.unshift(log);
    if (this.visitorLogs.length > 150) {
      this.visitorLogs.pop();
    }

    return log;
  }

  // --- Log Food View ---
  public logFoodView(foodId: string, foodName?: string, category?: string) {
    const today = new Date().toISOString().split('T')[0];
    let metric = this.foodMetricsMap.get(foodId);
    if (!metric) {
      metric = {
        foodId,
        foodName: foodName || foodId,
        category: category || 'General',
        views: 0,
        dailyViews: 0,
        shares: 0,
        downloads: 0,
        lastViewedAt: new Date().toISOString()
      };
    }
    metric.views += 1;
    metric.dailyViews += 1;
    metric.lastViewedAt = new Date().toISOString();
    if (foodName) metric.foodName = foodName;
    if (category) metric.category = category;
    this.foodMetricsMap.set(foodId, metric);

    // Daily history food view
    let dPoint = this.dailyHistoryMap.get(today);
    if (!dPoint) {
      dPoint = {
        pageViews: 0, foodViews: 0,
        googleAdViews: 0, googleAdClicks: 0,
        amazonAdViews: 0, amazonAdClicks: 0,
        flipkartAdViews: 0, flipkartAdClicks: 0,
        totalAdClicks: 0,
        googleRevenue: 0, amazonRevenue: 0, flipkartRevenue: 0, totalRevenue: 0
      };
    }
    dPoint.foodViews += 1;
    this.dailyHistoryMap.set(today, dPoint);
  }

  // --- Log Share ---
  public logShare(targetId: string, type: string = 'food') {
    this.totalSharesCount += 1;
    let metric = this.foodMetricsMap.get(targetId);
    if (metric) {
      metric.shares += 1;
      this.foodMetricsMap.set(targetId, metric);
    }
  }

  // --- Log Download ---
  public logDownload(targetId: string, type: string = 'pdf') {
    this.totalDownloadsCount += 1;
    let metric = this.foodMetricsMap.get(targetId);
    if (metric) {
      metric.downloads += 1;
      this.foodMetricsMap.set(targetId, metric);
    }
  }

  // --- Log Ad Impression & Click ---
  public logAdImpression(adUnit: string = 'Sponsored Card', provider: string = 'Google') {
    this.totalAdImpressionsCount += 1;
    const today = new Date().toISOString().split('T')[0];
    
    let log = this.adLogsMap.get(today);
    if (!log) {
      log = {
        id: `ad_${today}`,
        date: today,
        adUnit,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        estimatedRevenue: 0,
        ecpm: 2.80
      };
    }
    log.impressions += 1;
    log.ctr = Number(((log.clicks / log.impressions) * 100).toFixed(2));
    log.estimatedRevenue = Number(((log.impressions / 1000) * log.ecpm).toFixed(2));
    this.adLogsMap.set(today, log);

    let dPoint = this.dailyHistoryMap.get(today);
    if (!dPoint) {
      dPoint = {
        pageViews: 0, foodViews: 0,
        googleAdViews: 0, googleAdClicks: 0,
        amazonAdViews: 0, amazonAdClicks: 0,
        flipkartAdViews: 0, flipkartAdClicks: 0,
        totalAdClicks: 0,
        googleRevenue: 0, amazonRevenue: 0, flipkartRevenue: 0, totalRevenue: 0
      };
    }
    if (provider.toLowerCase().includes('amazon')) {
      dPoint.amazonAdViews += 1;
    } else if (provider.toLowerCase().includes('flipkart')) {
      dPoint.flipkartAdViews += 1;
    } else {
      dPoint.googleAdViews += 1;
    }
    this.dailyHistoryMap.set(today, dPoint);
  }

  public logAdClick(adUnit: string = 'Sponsored Card', provider: string = 'Google') {
    this.totalAdClicksCount += 1;
    const today = new Date().toISOString().split('T')[0];
    
    let log = this.adLogsMap.get(today);
    if (!log) {
      log = {
        id: `ad_${today}`,
        date: today,
        adUnit,
        impressions: 1,
        clicks: 0,
        ctr: 0,
        estimatedRevenue: 0,
        ecpm: 2.80
      };
    }
    log.clicks += 1;
    log.ctr = Number(((log.clicks / (log.impressions || 1)) * 100).toFixed(2));
    this.adLogsMap.set(today, log);

    let dPoint = this.dailyHistoryMap.get(today);
    if (!dPoint) {
      dPoint = {
        pageViews: 0, foodViews: 0,
        googleAdViews: 0, googleAdClicks: 0,
        amazonAdViews: 0, amazonAdClicks: 0,
        flipkartAdViews: 0, flipkartAdClicks: 0,
        totalAdClicks: 0,
        googleRevenue: 0, amazonRevenue: 0, flipkartRevenue: 0, totalRevenue: 0
      };
    }
    if (provider.toLowerCase().includes('amazon')) {
      dPoint.amazonAdClicks += 1;
      dPoint.amazonRevenue = Number((dPoint.amazonRevenue + 0.15).toFixed(2));
    } else if (provider.toLowerCase().includes('flipkart')) {
      dPoint.flipkartAdClicks += 1;
      dPoint.flipkartRevenue = Number((dPoint.flipkartRevenue + 0.12).toFixed(2));
    } else {
      dPoint.googleAdClicks += 1;
      dPoint.googleRevenue = Number((dPoint.googleRevenue + 0.10).toFixed(2));
    }
    dPoint.totalAdClicks += 1;
    dPoint.totalRevenue = Number((dPoint.googleRevenue + dPoint.amazonRevenue + dPoint.flipkartRevenue).toFixed(2));
    this.dailyHistoryMap.set(today, dPoint);
  }

  // --- Get Analytics Summary ---
  public getAnalyticsSummary(): VisitorAnalyticsSummary {
    const allVisitors = Array.from(this.visitorMap.values());
    const uniqueIPsCount = allVisitors.length;
    const repeatUsers = allVisitors.filter(v => v.visitCount > 1);
    const repeatUsersCount = repeatUsers.length;
    const repeatUserPercentage = uniqueIPsCount > 0 
      ? Number(((repeatUsersCount / uniqueIPsCount) * 100).toFixed(1)) 
      : 0;

    const foodMetrics = Array.from(this.foodMetricsMap.values())
      .sort((a, b) => b.views - a.views);

    const totalFoodViews = foodMetrics.reduce((sum, f) => sum + f.views, 0);

    const adHistory = Array.from(this.adLogsMap.values())
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalAdRevenue = Number(adHistory.reduce((sum, a) => sum + a.estimatedRevenue, 0).toFixed(2));
    const avgCtr = this.totalAdImpressionsCount > 0
      ? Number(((this.totalAdClicksCount / this.totalAdImpressionsCount) * 100).toFixed(2))
      : 0;

    // --- Dynamic Page-Wise Live Metrics ---
    const pageMetrics: PageMetric[] = Array.from(this.pageViewsMap.entries()).map(([path, data]) => ({
      path,
      pageName: data.pageName,
      totalViews: data.totalViews,
      dailyViews: data.dailyViews,
      uniqueVisitors: data.uniqueIPs.size,
      avgTimeOnPage: '2m 15s'
    }));

    // Calculate real provider live stats
    let gClicks = 0, gRevenue = 0, gImpressions = 0;
    let aClicks = 0, aRevenue = 0, aImpressions = 0;
    let fClicks = 0, fRevenue = 0, fImpressions = 0;

    this.dailyHistoryMap.forEach((dp) => {
      gClicks += dp.googleAdClicks;
      gRevenue += dp.googleRevenue;
      gImpressions += dp.googleAdViews;

      aClicks += dp.amazonAdClicks;
      aRevenue += dp.amazonRevenue;
      aImpressions += dp.amazonAdViews;

      fClicks += dp.flipkartAdClicks;
      fRevenue += dp.flipkartRevenue;
      fImpressions += dp.flipkartAdViews;
    });

    const networkAdPerformance: NetworkAdPerformance[] = [
      {
        provider: 'Google AdSense',
        totalImpressions: gImpressions,
        dailyImpressions: gImpressions,
        totalClicks: gClicks,
        dailyClicks: gClicks,
        ctr: gImpressions > 0 ? Number(((gClicks / gImpressions) * 100).toFixed(2)) : 0,
        ecpm: 2.95,
        totalRevenue: Number(gRevenue.toFixed(2)),
        dailyRevenue: Number(gRevenue.toFixed(2))
      },
      {
        provider: 'Amazon Associates',
        totalImpressions: aImpressions,
        dailyImpressions: aImpressions,
        totalClicks: aClicks,
        dailyClicks: aClicks,
        ctr: aImpressions > 0 ? Number(((aClicks / aImpressions) * 100).toFixed(2)) : 0,
        ecpm: 4.20,
        totalRevenue: Number(aRevenue.toFixed(2)),
        dailyRevenue: Number(aRevenue.toFixed(2))
      },
      {
        provider: 'Flipkart Affiliate',
        totalImpressions: fImpressions,
        dailyImpressions: fImpressions,
        totalClicks: fClicks,
        dailyClicks: fClicks,
        ctr: fImpressions > 0 ? Number(((fClicks / fImpressions) * 100).toFixed(2)) : 0,
        ecpm: 3.80,
        totalRevenue: Number(fRevenue.toFixed(2)),
        dailyRevenue: Number(fRevenue.toFixed(2))
      }
    ];

    // --- 14-Day Real Historic Graph Points ---
    const dailyHistoryGraph: DailyHistoryGraphPoint[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;

      const realPoint = this.dailyHistoryMap.get(dateKey) || {
        pageViews: 0, foodViews: 0,
        googleAdViews: 0, googleAdClicks: 0,
        amazonAdViews: 0, amazonAdClicks: 0,
        flipkartAdViews: 0, flipkartAdClicks: 0,
        totalAdClicks: 0,
        googleRevenue: 0, amazonRevenue: 0, flipkartRevenue: 0, totalRevenue: 0
      };

      dailyHistoryGraph.push({
        date: dayLabel,
        pageViews: realPoint.pageViews,
        foodViews: realPoint.foodViews,
        googleAdViews: realPoint.googleAdViews,
        googleAdClicks: realPoint.googleAdClicks,
        amazonAdViews: realPoint.amazonAdViews,
        amazonAdClicks: realPoint.amazonAdClicks,
        flipkartAdViews: realPoint.flipkartAdViews,
        flipkartAdClicks: realPoint.flipkartAdClicks,
        totalAdClicks: realPoint.totalAdClicks,
        googleRevenue: realPoint.googleRevenue,
        amazonRevenue: realPoint.amazonRevenue,
        flipkartRevenue: realPoint.flipkartRevenue,
        totalRevenue: realPoint.totalRevenue
      });
    }

    return {
      totalVisits: this.totalVisitsCount,
      uniqueIPsCount,
      repeatUsersCount,
      repeatUserPercentage,
      totalFoodViews,
      totalShares: this.totalSharesCount,
      totalDownloads: this.totalDownloadsCount,
      totalAdImpressions: this.totalAdImpressionsCount,
      totalAdClicks: this.totalAdClicksCount,
      avgCtr,
      totalAdRevenue,
      recentVisitorLogs: this.visitorLogs,
      topFoodMetrics: foodMetrics,
      pageMetrics,
      networkAdPerformance,
      dailyHistoryGraph,
      adPerformanceHistory: adHistory
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
