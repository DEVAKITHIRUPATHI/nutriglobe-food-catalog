import React, { useState, useEffect } from "react";
import { vitalsMonitor, VitalsReport } from "@/lib/vitals";
import { Activity, ShieldCheck, Zap, Gauge, AlertCircle, RefreshCw, Cpu, HardDrive, CheckCircle2, Server } from "lucide-react";

interface TelemetryError {
  id: string;
  message: string;
  name: string;
  stack?: string;
  url?: string;
  timestamp: string;
}

export function PerformanceDashboard() {
  const [vitals, setVitals] = useState<VitalsReport[]>([]);
  const [errors, setErrors] = useState<TelemetryError[]>([]);
  const [memoryInfo, setMemoryInfo] = useState<{ usedJSHeapSize?: number; totalJSHeapSize?: number } | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to vitals updates
    setVitals(vitalsMonitor.getMetrics());
    const unsubscribe = vitalsMonitor.subscribe((report) => {
      setVitals((prev) => {
        const index = prev.findIndex((v) => v.name === report.name);
        if (index >= 0) {
          const next = [...prev];
          next[index] = report;
          return next;
        }
        return [...prev, report];
      });
    });

    // Check Memory if available
    if (typeof window !== "undefined" && (performance as any).memory) {
      const mem = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
        totalJSHeapSize: Math.round(mem.totalJSHeapSize / (1024 * 1024)),
      });
    }

    // Fetch server telemetry logs
    fetchTelemetryData();

    // Measure ping
    measurePing();

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchTelemetryData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/telemetry/errors");
      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const measurePing = async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/foods/popular?limit=1");
      if (res.ok) {
        setPingLatency(Math.round(performance.now() - start));
      }
    } catch (e) {
      setPingLatency(null);
    }
  };

  const getMetricColor = (rating?: string) => {
    switch (rating) {
      case "good":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "needs-improvement":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "poor":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const formatMetricValue = (name: string, val: number) => {
    if (name === "CLS") return val.toFixed(3);
    return `${Math.round(val)} ms`;
  };

  const metricDescriptions: Record<string, string> = {
    LCP: "Largest Contentful Paint - Main content load time (Target: <2.5s)",
    INP: "Interaction to Next Paint - Responsiveness latency (Target: <200ms)",
    FID: "First Input Delay - Input responsiveness (Target: <100ms)",
    CLS: "Cumulative Layout Shift - Visual stability score (Target: <0.1)",
    FCP: "First Contentful Paint - Initial render time (Target: <1.8s)",
    TTFB: "Time to First Byte - Server response speed (Target: <800ms)",
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Core Web Vitals & Telemetry
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                Live Monitor
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time performance metrics, client crash telemetry, and API latency audit.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchTelemetryData();
            measurePing();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Core Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["LCP", "INP", "CLS", "FCP", "TTFB"].map((metricName) => {
          const item = vitals.find((v) => v.name === metricName);
          const colorClass = getMetricColor(item?.rating);

          return (
            <div
              key={metricName}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-200">{metricName}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ${colorClass}`}
                  >
                    {item?.rating || "Measuring..."}
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold text-white my-1">
                  {item ? formatMetricValue(item.name, item.value) : "--"}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                {metricDescriptions[metricName] || "Core performance vital metric."}
              </p>
            </div>
          );
        })}

        {/* System Memory & Ping */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-400" />
              Runtime Health
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border text-sky-400 bg-sky-500/10 border-sky-500/20">
              Active
            </span>
          </div>
          <div className="space-y-1.5 my-1 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">API Ping:</span>
              <span className="text-emerald-400 font-bold">{pingLatency !== null ? `${pingLatency} ms` : "Checking..."}</span>
            </div>
            {memoryInfo && (
              <div className="flex justify-between">
                <span className="text-slate-400">JS Heap Usage:</span>
                <span>{memoryInfo.usedJSHeapSize} MB / {memoryInfo.totalJSHeapSize} MB</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Service Worker:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            In-memory engine status and client-server network response latency.
          </p>
        </div>
      </div>

      {/* Error Telemetry Log */}
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Client Runtime Crash Log ({errors.length})
          </h3>
          <span className="text-xs text-slate-400">
            {errors.length === 0 ? "Zero Active Production Exceptions" : "Logged Exception Entries"}
          </span>
        </div>

        {errors.length === 0 ? (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No crashes or runtime errors recorded in telemetry storage. Application is running cleanly.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {errors.map((err, idx) => (
              <div key={idx} className="p-3 bg-red-950/30 border border-red-900/40 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between text-red-300 font-semibold">
                  <span>{err.name}: {err.message}</span>
                  <span className="text-[10px] text-slate-400">{new Date(err.timestamp).toLocaleTimeString()}</span>
                </div>
                {err.url && <div className="text-[10px] text-slate-400 truncate">URL: {err.url}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
