import { Request, Response, NextFunction } from "express";

// In-memory rate limiting store (IP -> timestamp array)
interface RateLimitRecord {
  timestamps: number[];
  blockedUntil?: number;
}

const apiRateLimitStore = new Map<string, RateLimitRecord>();
const aiRateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  
  [apiRateLimitStore, aiRateLimitStore].forEach(store => {
    store.forEach((record, ip) => {
      record.timestamps = record.timestamps.filter(t => now - t < windowMs);
      if (record.timestamps.length === 0 && (!record.blockedUntil || record.blockedUntil < now)) {
        store.delete(ip);
      }
    });
  });
}, 5 * 60 * 1000);

// Suspicious bot & vulnerability scanner user agents
const SUSPICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /zgrab/i,
  /masscan/i,
  /dirbuster/i,
  /nmap/i,
  /w3af/i,
  /acunetix/i,
  /havij/i,
  /absinthe/i,
  /netsparker/i
];

// Dangerous SQLi/XSS attack patterns in query parameters
const MALICIOUS_PATTERNS = [
  /<\s*script/i,
  /javascript\s*:/i,
  /UNION\s+ALL\s+SELECT/i,
  /SELECT\s+.*\s+FROM/i,
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /INFORMATION_SCHEMA/i,
  /--\s*$/
];

/**
 * Enterprise Security & Protection Middleware
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Remove tech stack exposure
  res.removeHeader("X-Powered-By");

  // Essential HTTP Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Omit X-Frame-Options to allow embedding in AI Studio live preview iframe
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=()"
  );

  // Serve strict robots.txt for bot scraping protection
  if (req.path === "/robots.txt") {
    res.type("text/plain");
    return res.send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml\n`
    );
  }

  // Security Check 1: Malicious Bot User-Agent Filter
  const userAgent = req.get("User-Agent") || "";
  for (const pattern of SUSPICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      console.warn(`[SECURITY] Blocked suspicious bot UA (${userAgent}) from IP: ${req.ip}`);
      return res.status(403).json({ error: "Access Denied: Malicious payload or automated scanner detected." });
    }
  }

  // Security Check 2: Malicious Input Vector Scan (Query String & URL)
  const fullUrl = req.originalUrl || req.url;
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(fullUrl)) {
      console.warn(`[SECURITY] Blocked malicious payload attempt from IP: ${req.ip}`);
      return res.status(400).json({ error: "Bad Request: Invalid or unsafe characters detected." });
    }
  }

  next();
}

/**
 * Rate Limiting Middleware for API Endpoints
 * Prevents DDoS, brute-force & API scraping
 */
export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply rate limiting to /api/* routes
  if (!req.path.startsWith("/api")) {
    return next();
  }

  const clientIp = req.ip || req.headers["x-forwarded-for"] as string || "127.0.0.1";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const isAiRoute = req.path.includes("/ai-") || req.path.includes("/generate");

  const maxRequests = isAiRoute ? 20 : 120; // 20 AI requests/min, 120 standard API requests/min
  const store = isAiRoute ? aiRateLimitStore : apiRateLimitStore;

  let record = store.get(clientIp);
  if (!record) {
    record = { timestamps: [] };
    store.set(clientIp, record);
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
    });
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    record.blockedUntil = now + 60 * 1000; // Block for 1 minute
    res.setHeader("Retry-After", 60);
    return res.status(429).json({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Maximum ${maxRequests} requests per minute allowed.`,
    });
  }

  record.timestamps.push(now);
  next();
}

/**
 * Safe Error Handler - Prevents internal stack trace & key leaks
 */
export function safeErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";
  
  // Sanitize error message to ensure secrets/keys aren't leaked
  let message = err.message || "An unexpected server error occurred.";
  if (message.includes("GEMINI_API_KEY") || message.includes("AI_STUDIO") || message.includes("secret")) {
    message = "Internal AI Service Configuration Error. Please contact support.";
  }

  res.status(status).json({
    status: "error",
    statusCode: status,
    message,
    ...(isProd ? {} : { debug: err.stack }),
  });
}
