import { onLCP, onCLS, onFCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface VitalsReport {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  timestamp: number;
}

type VitalsListener = (report: VitalsReport) => void;

class WebVitalsMonitor {
  private listeners: Set<VitalsListener> = new Set();
  private metricsMap: Map<string, VitalsReport> = new Map();

  constructor() {
    this.init();
  }

  public subscribe(listener: VitalsListener) {
    this.listeners.add(listener);
    // Send existing metrics
    this.metricsMap.forEach((report) => listener(report));
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getMetrics(): VitalsReport[] {
    return Array.from(this.metricsMap.values());
  }

  private init() {
    if (typeof window === 'undefined') return;

    const sendMetric = (metric: Metric) => {
      const report: VitalsReport = {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating || this.getRating(metric.name, metric.value),
        delta: metric.delta,
        navigationType: metric.navigationType || 'navigate',
        timestamp: Date.now(),
      };

      this.metricsMap.set(metric.name, report);

      // Notify internal subscribers
      this.listeners.forEach((fn) => fn(report));

      // Post to server telemetry endpoint safely
      this.sendToServer(report);
    };

    try {
      onLCP(sendMetric);
      onCLS(sendMetric);
      onFCP(sendMetric);
      onTTFB(sendMetric);
      if (typeof onINP === 'function') {
        onINP(sendMetric);
      }
    } catch (e) {
      console.warn('[Web Vitals] Initialization error:', e);
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    switch (name) {
      case 'LCP':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'CLS':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'FID':
      case 'INP':
        return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
      case 'FCP':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      case 'TTFB':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      default:
        return 'good';
    }
  }

  private sendToServer(report: VitalsReport) {
    try {
      const body = JSON.stringify(report);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/telemetry/vitals', body);
      } else {
        fetch('/api/telemetry/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      // Ignore network reporting failures
    }
  }
}

export const vitalsMonitor = new WebVitalsMonitor();

export function reportWebVitals(onPerfEntry?: (metric: VitalsReport) => void) {
  if (onPerfEntry) {
    return vitalsMonitor.subscribe(onPerfEntry);
  }
}
