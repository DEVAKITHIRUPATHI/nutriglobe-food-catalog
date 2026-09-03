import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, 
  ExternalLink, Download, Sparkles, Play, Pause, RotateCcw, Edit3, 
  Check, X, FileSpreadsheet, Image as ImageIcon, Eye, Clock, Layers, Filter,
  Loader2, ArrowUpDown, Bot, Terminal, Radio, Server, Globe, Square, Zap, Settings2, Cpu
} from 'lucide-react';
import { ImageValidator, ImageValidationResult } from '@/lib/imageValidator';
import { getGoogleImageSearchUrl, getExcelHyperlinkFormula, getFoodImageMetadata } from '@shared/foodImageResolver';
import type { FoodItemClient } from '@shared/schema';

export interface WorkerLogEntry {
  timestamp: string;
  foodId: string;
  foodName: string;
  status: 'SCANNED_OK' | 'BROKEN_FOUND' | 'SEARCHING_REPLACEMENT' | 'REPLACED_SUCCESS' | 'REPLACE_FAILED' | 'SYSTEM';
  previousUrl?: string;
  newUrl?: string;
  source?: string;
  message: string;
}

export interface WorkerStatus {
  isRunning: boolean;
  isPaused: boolean;
  totalItems: number;
  completedItems: number;
  brokenDetected: number;
  successfullyReplaced: number;
  failedReplacements: number;
  currentFoodItem?: string;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  nextScheduledRun?: string;
  cronIntervalMinutes: number;
  autoFixEnabled: boolean;
  recentLogs: WorkerLogEntry[];
}

interface Props {
  foods: FoodItemClient[];
  onRefreshFoods?: () => void;
}

export function ImageDiagnosticDashboard({ foods, onRefreshFoods }: Props) {
  // Diagnostic state
  const [validationMap, setValidationMap] = useState<Map<string, ImageValidationResult>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ completed: 0, total: 0 });
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'broken' | 'empty' | 'placeholder' | 'valid' | 'untested'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Row editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isFixingId, setIsFixingId] = useState<string | null>(null);
  const [isBatchFixing, setIsBatchFixing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Background Worker & Cron state
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);
  const [isWorkerActionLoading, setIsWorkerActionLoading] = useState(false);
  const [showWorkerLogs, setShowWorkerLogs] = useState(true);
  const [cronInterval, setCronInterval] = useState<number>(60);
  const [autoFixToggle, setAutoFixToggle] = useState<boolean>(true);
  const [singleSearchingId, setSingleSearchingId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    foods.forEach(f => {
      if (Array.isArray(f.category)) {
        f.category.forEach(c => set.add(c));
      }
    });
    return Array.from(set).sort();
  }, [foods]);

  // Compute diagnostics summary metrics
  const stats = useMemo(() => {
    let validCount = 0;
    let brokenCount = 0;
    let emptyCount = 0;
    let placeholderCount = 0;
    let untestedCount = 0;

    foods.forEach(f => {
      const res = validationMap.get(f.id);
      if (!res) {
        untestedCount++;
      } else if (res.status === 'VALID') {
        validCount++;
      } else if (res.status === 'BROKEN_404' || res.status === 'TIMEOUT' || res.status === 'INVALID_DIMENSIONS' || res.status === 'NETWORK_ERROR') {
        brokenCount++;
      } else if (res.status === 'EMPTY_URL') {
        emptyCount++;
      } else if (res.status === 'PLACEHOLDER') {
        placeholderCount++;
      }
    });

    const totalTested = foods.length - untestedCount;
    const accuracyRate = totalTested > 0 ? Math.round((validCount / totalTested) * 100) : 100;

    return {
      total: foods.length,
      valid: validCount,
      broken: brokenCount,
      empty: emptyCount,
      placeholder: placeholderCount,
      untested: untestedCount,
      totalIssues: brokenCount + emptyCount + placeholderCount,
      accuracyRate
    };
  }, [foods, validationMap]);

  // Start / resume scanning all images using ImageValidator
  const startFullScan = async (onlyUntested = false) => {
    if (isScanning) return;
    
    abortControllerRef.current = new AbortController();
    setIsScanning(true);
    setNotification(null);

    const itemsToScan = foods
      .filter(f => !onlyUntested || !validationMap.has(f.id))
      .map(f => ({
        id: f.id,
        url: f.image || f.imageUrl || '',
        name: f.name?.en || f.id
      }));

    setScanProgress({ completed: 0, total: itemsToScan.length });

    try {
      await ImageValidator.validateBatch(itemsToScan, {
        concurrency: 12,
        timeoutMs: 5000,
        signal: abortControllerRef.current.signal,
        onProgress: (completed, total, latest) => {
          setScanProgress({ completed, total });
          setValidationMap(prev => {
            const next = new Map(prev);
            next.set(latest.id, latest.result);
            return next;
          });
        }
      });

      setNotification({
        type: 'success',
        message: `Diagnostic scan complete! Tested ${itemsToScan.length} images across the food database.`
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Scan error:', err);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsScanning(false);
      setNotification({ type: 'info', message: 'Diagnostic scan paused by admin.' });
    }
  };

  // Run initial scan on first load for first batch of foods to populate immediate view
  useEffect(() => {
    if (foods.length > 0 && validationMap.size === 0) {
      startFullScan(false);
    }
  }, [foods.length]);

  // Validate single item
  const handleValidateSingle = async (food: FoodItemClient) => {
    const url = food.image || food.imageUrl || '';
    const res = await ImageValidator.validate(url, { timeoutMs: 5000, bypassCache: true });
    setValidationMap(prev => new Map(prev).set(food.id, res));
  };

  // Auto-Fix single item with verified photography mapping
  const handleAutoFixItem = async (food: FoodItemClient) => {
    setIsFixingId(food.id);
    try {
      const res = await fetch(`/api/foods/${food.id}/fix-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        const updatedFood = data.foodItem;
        if (updatedFood?.image) {
          // Re-validate new image
          const valRes = await ImageValidator.validate(updatedFood.image, { bypassCache: true });
          setValidationMap(prev => new Map(prev).set(food.id, valRes));
          
          if (onRefreshFoods) onRefreshFoods();
          
          setNotification({
            type: 'success',
            message: `Fixed "${food.name?.en || food.id}" with verified real food photograph!`
          });
        }
      }
    } catch (err) {
      console.error('Fix single item failed:', err);
      setNotification({ type: 'error', message: `Failed to fix image for ${food.name?.en}` });
    } finally {
      setIsFixingId(null);
    }
  };

  // Manual save custom URL for a food item
  const handleSaveCustomUrl = async (food: FoodItemClient) => {
    if (!customUrlInput.trim()) return;
    setIsFixingId(food.id);
    try {
      const res = await fetch(`/api/foods/${food.id}/fix-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: customUrlInput.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedFood = data.foodItem;
        const valRes = await ImageValidator.validate(customUrlInput.trim(), { bypassCache: true });
        setValidationMap(prev => new Map(prev).set(food.id, valRes));
        
        if (onRefreshFoods) onRefreshFoods();
        
        setEditingId(null);
        setCustomUrlInput('');
        setNotification({
          type: 'success',
          message: `Saved and verified custom image for "${food.name?.en || food.id}"`
        });
      }
    } catch (err) {
      console.error('Custom image save error:', err);
      setNotification({ type: 'error', message: 'Failed to update custom image' });
    } finally {
      setIsFixingId(null);
    }
  };

  // Batch Auto-Fix all broken & missing items
  const handleBatchFixAllBroken = async () => {
    setIsBatchFixing(true);
    setNotification(null);
    try {
      const res = await fetch('/api/foods/auto-fix-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setNotification({
          type: 'success',
          message: data.message || `Repaired ${data.totalFixed} food items with verified photography.`
        });
        
        // Refresh catalog and re-scan
        if (onRefreshFoods) onRefreshFoods();
        ImageValidator.clearCache();
        startFullScan(false);
      }
    } catch (err) {
      console.error('Batch auto-fix failed:', err);
      setNotification({ type: 'error', message: 'Error executing batch image repair' });
    } finally {
      setIsBatchFixing(false);
    }
  };

  // Fetch Background Worker & Cron status
  const fetchWorkerStatus = async () => {
    try {
      const res = await fetch('/api/admin/image-worker/status');
      if (res.ok) {
        const data: WorkerStatus = await res.json();
        setWorkerStatus(data);
        if (data.cronIntervalMinutes) setCronInterval(data.cronIntervalMinutes);
        if (typeof data.autoFixEnabled === 'boolean') setAutoFixToggle(data.autoFixEnabled);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchWorkerStatus();
    const interval = setInterval(fetchWorkerStatus, workerStatus?.isRunning ? 2500 : 8000);
    return () => clearInterval(interval);
  }, [workerStatus?.isRunning]);

  // Start Background Worker full sweep
  const handleStartWorker = async (forceAll: boolean = false) => {
    setIsWorkerActionLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/image-worker/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceAll })
      });
      if (res.ok) {
        const data = await res.json();
        setWorkerStatus(data.status);
        setNotification({
          type: 'success',
          message: 'Automated ImageValidator background worker & search indexer started!'
        });
      }
    } catch (err) {
      console.error('Failed to start worker:', err);
      setNotification({ type: 'error', message: 'Failed to start background worker.' });
    } finally {
      setIsWorkerActionLoading(false);
    }
  };

  // Stop Background Worker
  const handleStopWorker = async () => {
    setIsWorkerActionLoading(true);
    try {
      const res = await fetch('/api/admin/image-worker/stop', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWorkerStatus(data.status);
        setNotification({ type: 'info', message: 'Background worker sweep stopped by admin.' });
      }
    } catch (err) {
      console.error('Failed to stop worker:', err);
      setNotification({ type: 'error', message: 'Failed to stop worker.' });
    } finally {
      setIsWorkerActionLoading(false);
    }
  };

  // Update schedule & auto-fix mode
  const handleUpdateSchedule = async (newInterval: number, autoFix: boolean) => {
    setCronInterval(newInterval);
    setAutoFixToggle(autoFix);
    try {
      const res = await fetch('/api/admin/image-worker/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes: newInterval, autoFixEnabled: autoFix })
      });
      if (res.ok) {
        const data = await res.json();
        setWorkerStatus(data.status);
        setNotification({ type: 'success', message: data.message });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update schedule settings.' });
    }
  };

  // Single-item automated search across public food databases
  const handleSearchAndReplaceSingle = async (food: FoodItemClient) => {
    setSingleSearchingId(food.id);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/image-worker/fix-single/${food.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.foodItem?.image) {
          const valRes = await ImageValidator.validate(data.foodItem.image, { bypassCache: true });
          setValidationMap(prev => new Map(prev).set(food.id, valRes));
        }
        if (onRefreshFoods) onRefreshFoods();
        fetchWorkerStatus();
        setNotification({
          type: 'success',
          message: data.message || `Replaced photo for "${food.name?.en || food.id}"`
        });
      } else {
        setNotification({
          type: 'error',
          message: data.message || `No reliable photo replacement found for "${food.name?.en || food.id}"`
        });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error querying public food indices.' });
    } finally {
      setSingleSearchingId(null);
    }
  };

  // Export full diagnostic report to CSV
  const handleExportDiagnosticCsv = () => {
    const headers = [
      'Food ID',
      'Food Name (English)',
      'Primary Category',
      'Image URL',
      'Validation Status',
      'Is Live & Valid',
      'Width (px)',
      'Height (px)',
      'Duration (ms)',
      'Error Reason',
      'Google Images Search URL',
      'Excel HYPERLINK Formula'
    ];

    const rows = foods.map(f => {
      const nameStr = f.name?.en || f.id;
      const categoryStr = Array.isArray(f.category) ? f.category[0] : (f.category || 'General');
      const val = validationMap.get(f.id);
      const searchUrl = getGoogleImageSearchUrl(nameStr, f.category);
      const formula = getExcelHyperlinkFormula(nameStr);

      return [
        `"${f.id}"`,
        `"${nameStr.replace(/"/g, '""')}"`,
        `"${categoryStr}"`,
        `"${(f.image || '').replace(/"/g, '""')}"`,
        `"${val?.status || 'UNTESTED'}"`,
        val?.isValid ? 'TRUE' : 'FALSE',
        val?.width || '',
        val?.height || '',
        val?.durationMs || '',
        `"${(val?.errorMessage || '').replace(/"/g, '""')}"`,
        `"${searchUrl}"`,
        `"${formula.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nutrifacts_image_diagnostics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered foods for table rendering
  const filteredFoods = useMemo(() => {
    return foods.filter(f => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cats = Array.isArray(f.category) ? f.category : [f.category];
        if (!cats.includes(selectedCategory)) return false;
      }

      // Status filter
      const res = validationMap.get(f.id);
      if (activeTabFilter === 'broken') {
        if (!res || (res.status !== 'BROKEN_404' && res.status !== 'TIMEOUT' && res.status !== 'INVALID_DIMENSIONS' && res.status !== 'NETWORK_ERROR')) {
          return false;
        }
      } else if (activeTabFilter === 'empty') {
        if (!res || res.status !== 'EMPTY_URL') return false;
      } else if (activeTabFilter === 'placeholder') {
        if (!res || res.status !== 'PLACEHOLDER') return false;
      } else if (activeTabFilter === 'valid') {
        if (!res || res.status !== 'VALID') return false;
      } else if (activeTabFilter === 'untested') {
        if (res) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (f.name?.en || f.id).toLowerCase();
        const id = f.id.toLowerCase();
        const img = (f.image || '').toLowerCase();
        return name.includes(q) || id.includes(q) || img.includes(q);
      }

      return true;
    });
  }, [foods, validationMap, activeTabFilter, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 font-semibold block">Total Catalog</span>
          <span className="text-2xl font-black text-white">{stats.total}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Canonical Foods</span>
        </div>

        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center">
          <span className="text-xs text-emerald-400 font-semibold block">Live &amp; Valid</span>
          <span className="text-2xl font-black text-emerald-400">{stats.valid}</span>
          <span className="text-[10px] text-emerald-500/80 block mt-0.5">200 OK / High Res</span>
        </div>

        <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-center">
          <span className="text-xs text-rose-400 font-semibold block">Broken / 404</span>
          <span className="text-2xl font-black text-rose-400">{stats.broken}</span>
          <span className="text-[10px] text-rose-500/80 block mt-0.5">Failed or Blocked</span>
        </div>

        <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-center">
          <span className="text-xs text-amber-400 font-semibold block">Empty / Placeholders</span>
          <span className="text-2xl font-black text-amber-300">{stats.empty + stats.placeholder}</span>
          <span className="text-[10px] text-amber-500/80 block mt-0.5">Needs Real Image</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 font-semibold block">Untested Queue</span>
          <span className="text-2xl font-black text-slate-300">{stats.untested}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Pending Check</span>
        </div>

        <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl text-center">
          <span className="text-xs text-purple-300 font-semibold block">Catalog Health</span>
          <span className="text-2xl font-black text-purple-300">{stats.accuracyRate}%</span>
          <span className="text-[10px] text-purple-400/80 block mt-0.5">Verified Working</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                ImageValidator Diagnostic Console
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Automated Browser &amp; HEAD Checking
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time validation of all 1,300+ food photo URLs. Identifies 404s, slow timeouts, dimension discrepancies, and generic placeholders.
              </p>
            </div>

            {/* Scan Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {isScanning ? (
                <Button 
                  onClick={stopScan} 
                  variant="outline" 
                  size="sm" 
                  className="border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-bold gap-1.5 h-9"
                >
                  <Pause className="w-4 h-4" /> Pause Scan
                </Button>
              ) : (
                <Button 
                  onClick={() => startFullScan(false)} 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 h-9 shadow-sm"
                >
                  <Play className="w-4 h-4" /> Scan All ({foods.length})
                </Button>
              )}

              <Button
                onClick={handleBatchFixAllBroken}
                disabled={isBatchFixing}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 h-9 shadow-sm"
              >
                {isBatchFixing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Auto-Repairing Database...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Auto-Fix All Broken ({stats.totalIssues})</span>
                  </>
                )}
              </Button>

              <Button
                onClick={handleExportDiagnosticCsv}
                variant="outline"
                size="sm"
                className="font-bold gap-1.5 h-9 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Download className="w-4 h-4" /> Export CSV Report
              </Button>
            </div>
          </div>

          {/* Progress Bar when Scanning */}
          {isScanning && (
            <div className="space-y-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  Testing image URLs with browser ImageValidator pipeline...
                </span>
                <span className="font-mono text-emerald-400">
                  {scanProgress.completed} / {scanProgress.total} ({Math.round((scanProgress.completed / (scanProgress.total || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                  style={{ width: `${Math.round((scanProgress.completed / (scanProgress.total || 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {notification && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
              notification.type === 'success' 
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200' 
                : notification.type === 'error'
                ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                {notification.type === 'info' && <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />}
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Filter Bar & Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTabFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTabFilter === 'all' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({stats.total})
              </button>

              <button
                onClick={() => setActiveTabFilter('broken')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTabFilter === 'broken' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Broken / 404 ({stats.broken})
              </button>

              <button
                onClick={() => setActiveTabFilter('empty')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTabFilter === 'empty' 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                Empty URLs ({stats.empty})
              </button>

              <button
                onClick={() => setActiveTabFilter('placeholder')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTabFilter === 'placeholder' 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                Placeholders ({stats.placeholder})
              </button>

              <button
                onClick={() => setActiveTabFilter('valid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTabFilter === 'valid' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live &amp; Valid ({stats.valid})
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="relative min-w-[180px] sm:min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter foods by name or ID..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Worker & Public Search Cron Card */}
      <Card className="border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-indigo-950/20 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-800/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-extrabold text-white">
                    ImageValidator Background Worker &amp; Search Indexer
                  </h4>
                  {workerStatus?.isRunning ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      ACTIVE SWEEP
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      <Clock className="w-3 h-3" />
                      IDLE / SCHEDULED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated background cron testing all {foods.length} food items. Searches USDA, Wikimedia Commons, Open Food Facts, and Curated HD food photography to auto-replace broken URLs.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {workerStatus?.isRunning ? (
                <Button
                  size="sm"
                  onClick={handleStopWorker}
                  disabled={isWorkerActionLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 h-8 shadow-sm"
                >
                  <Square className="w-3.5 h-3.5" /> Stop Sweep
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStartWorker(false)}
                    disabled={isWorkerActionLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-8 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" /> Run Sweep Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartWorker(true)}
                    disabled={isWorkerActionLoading}
                    className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold gap-1.5 h-8"
                    title="Force re-verify and test all 1,300+ items from scratch"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Force Full Sweep
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowWorkerLogs(!showWorkerLogs)}
                className="text-slate-400 hover:text-white text-xs font-bold gap-1 h-8"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showWorkerLogs ? 'Hide Logs' : 'View Logs'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Real-time worker metrics bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Sweep Progress</span>
              <span className="text-lg font-black text-white">
                {workerStatus?.completedItems ?? 0} <span className="text-xs font-normal text-slate-500">/ {workerStatus?.totalItems ?? foods.length}</span>
              </span>
              <span className="text-[10px] text-indigo-400 block truncate font-mono mt-0.5">
                {workerStatus?.currentFoodItem ? `Testing: ${workerStatus.currentFoodItem}` : 'Ready for next batch'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Broken Detected</span>
              <span className="text-lg font-black text-rose-400">
                {workerStatus?.brokenDetected ?? 0}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">404s, Timeouts, Empties</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Auto-Replaced</span>
              <span className="text-lg font-black text-emerald-400">
                {workerStatus?.successfullyReplaced ?? 0}
              </span>
              <span className="text-[10px] text-emerald-500/80 block mt-0.5">Via Public Indexes</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Cron Frequency</span>
              <div className="flex items-center gap-1 mt-1">
                <select
                  value={cronInterval}
                  onChange={(e) => handleUpdateSchedule(Number(e.target.value), autoFixToggle)}
                  className="bg-slate-900 border border-slate-700 text-xs font-bold text-indigo-300 rounded px-2 py-0.5 focus:outline-none"
                >
                  <option value={15}>Every 15m</option>
                  <option value={30}>Every 30m</option>
                  <option value={60}>Every 1h</option>
                  <option value={360}>Every 6h</option>
                  <option value={1440}>Every 24h</option>
                </select>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                {workerStatus?.nextScheduledRun ? `Next: ${new Date(workerStatus.nextScheduledRun).toLocaleTimeString()}` : 'Scheduled'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl col-span-2 sm:col-span-4 lg:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Auto-Fix Persistence</span>
              <button
                type="button"
                onClick={() => handleUpdateSchedule(cronInterval, !autoFixToggle)}
                className={`mt-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  autoFixToggle 
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {autoFixToggle ? 'Auto-Replace: ON' : 'Audit Only: OFF'}
              </button>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {autoFixToggle ? 'Overwrites broken URLs' : 'Flag only, no write'}
              </span>
            </div>
          </div>

          {/* Progress bar if running */}
          {workerStatus?.isRunning && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Background ImageValidator Worker Active
                </span>
                <span>
                  {Math.round(((workerStatus.completedItems || 0) / (workerStatus.totalItems || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(((workerStatus.completedItems || 0) / (workerStatus.totalItems || 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Worker Terminal Activity Stream */}
          {showWorkerLogs && (
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Worker Activity &amp; Public Search Index Log Stream</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-cyan-400" /> USDA • Wikimedia • OpenFoodFacts
                  </span>
                  <span>•</span>
                  <span>{workerStatus?.recentLogs?.length || 0} events logged</span>
                </div>
              </div>

              <div className="p-3 max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
                {(!workerStatus?.recentLogs || workerStatus.recentLogs.length === 0) ? (
                  <div className="text-slate-500 py-4 text-center">
                    Worker ready. Start a background sweep or wait for cron trigger to see live image validation logs.
                  </div>
                ) : (
                  workerStatus.recentLogs.map((log, idx) => {
                    const isBroken = log.status === 'BROKEN_FOUND';
                    const isSuccess = log.status === 'REPLACED_SUCCESS';
                    const isSearching = log.status === 'SEARCHING_REPLACEMENT';
                    const isFailed = log.status === 'REPLACE_FAILED';

                    return (
                      <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                        <span className="text-slate-500 shrink-0 select-none">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          isSuccess
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isBroken
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isSearching
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : isFailed
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {log.status}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-300 mr-1.5">[{log.foodName}]</span>
                          <span className="text-slate-400">{log.message}</span>
                          {log.source && (
                            <span className="ml-1.5 text-cyan-400 text-[10px]">({log.source})</span>
                          )}
                          {log.newUrl && (
                            <a
                              href={log.newUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-0.5"
                            >
                              <span>View New URL</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Results Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Diagnostic Queue ({filteredFoods.length} Foods Displayed)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Hover preview for high-res rendering • Click actions for live correction
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th className="p-3 w-16">Preview</th>
                <th className="p-3 min-w-[200px]">Food Item &amp; ID</th>
                <th className="p-3 min-w-[120px]">Category</th>
                <th className="p-3 min-w-[150px]">ImageValidator Status</th>
                <th className="p-3 min-w-[120px]">Resolution / Latency</th>
                <th className="p-3 text-right min-w-[280px]">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No food items match the current diagnostic filter.
                  </td>
                </tr>
              ) : (
                filteredFoods.map((food) => {
                  const val = validationMap.get(food.id);
                  const isUntested = !val;
                  const isBroken = val && (val.status === 'BROKEN_404' || val.status === 'TIMEOUT' || val.status === 'INVALID_DIMENSIONS' || val.status === 'NETWORK_ERROR');
                  const isEmpty = val && val.status === 'EMPTY_URL';
                  const isPlaceholder = val && val.status === 'PLACEHOLDER';
                  const isValid = val && val.status === 'VALID';
                  
                  const isRowFixing = isFixingId === food.id;
                  const isEditingThis = editingId === food.id;
                  const englishName = food.name?.en || food.id;
                  const currentImgUrl = food.image || food.imageUrl || '';
                  const searchUrl = getGoogleImageSearchUrl(englishName, food.category);
                  const excelFormula = getExcelHyperlinkFormula(englishName);

                  // Row background style based on validity
                  const rowBgClass = isBroken 
                    ? 'bg-rose-500/10 hover:bg-rose-500/15 border-l-4 border-l-rose-500' 
                    : isEmpty
                    ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-l-amber-500'
                    : isPlaceholder
                    ? 'bg-purple-500/10 hover:bg-purple-500/15 border-l-4 border-l-purple-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60';

                  return (
                    <tr key={food.id} className={`transition-colors ${rowBgClass}`}>
                      {/* Image Thumbnail */}
                      <td className="p-3">
                        <div className="relative group w-12 h-12 rounded-lg bg-slate-950 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0">
                          {currentImgUrl ? (
                            <img
                              src={currentImgUrl}
                              alt={englishName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                      </td>

                      {/* Food Name & ID */}
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{englishName}</span>
                          {food.name?.hi && (
                            <span className="text-[10px] text-slate-400 font-normal">({food.name.hi})</span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[240px]">
                          ID: {food.id}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {Array.isArray(food.category) ? food.category[0] : (food.category || 'General')}
                        </span>
                      </td>

                      {/* ImageValidator Status */}
                      <td className="p-3">
                        {isUntested ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Untested
                          </span>
                        ) : isValid ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Live Valid Photo
                            </span>
                          </div>
                        ) : isBroken ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700/60 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-rose-500" /> Broken ({val.status})
                            </span>
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 truncate max-w-[200px]" title={val.errorMessage}>
                              {val.errorMessage || 'Failed to render image'}
                            </div>
                          </div>
                        ) : isEmpty ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-amber-500" /> Missing Image URL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-700/60 px-2 py-0.5 rounded-full">
                            <Layers className="w-3 h-3 text-purple-500" /> Placeholder URL
                          </span>
                        )}
                      </td>

                      {/* Resolution & Latency */}
                      <td className="p-3">
                        {val && val.isValid ? (
                          <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                            <div>{val.width} × {val.height} px</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{val.durationMs}ms latency</div>
                          </div>
                        ) : val?.durationMs ? (
                          <div className="text-[10px] font-mono text-slate-400">
                            Failed after {val.durationMs}ms
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Input
                              type="url"
                              value={customUrlInput}
                              onChange={(e) => setCustomUrlInput(e.target.value)}
                              placeholder="Paste high-res image URL..."
                              className="h-7 text-xs w-60 font-mono"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveCustomUrl(food)}
                              disabled={isRowFixing}
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              {isRowFixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null);
                                setCustomUrlInput('');
                              }}
                              className="h-7 px-2 text-slate-400 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Auto-Fix Real Photograph button */}
                            <Button
                              size="sm"
                              onClick={() => handleAutoFixItem(food)}
                              disabled={isRowFixing || singleSearchingId === food.id}
                              className={`h-7 px-2.5 text-[11px] font-bold gap-1 rounded-lg ${
                                isBroken || isEmpty || isPlaceholder
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                  : 'bg-emerald-600/90 hover:bg-emerald-700 text-white'
                              }`}
                              title="Auto-repair this image with verified USDA / Wikidata photography"
                            >
                              {isRowFixing ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Fixing...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Auto-Fix</span>
                                </>
                              )}
                            </Button>

                            {/* Public Index Search & Replace (USDA, Wikimedia, Open Food Facts) */}
                            <Button
                              size="sm"
                              onClick={() => handleSearchAndReplaceSingle(food)}
                              disabled={singleSearchingId === food.id || isRowFixing}
                              className="h-7 px-2 text-[11px] font-bold gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                              title="Automated live search across USDA, Wikimedia Commons, and Open Food Facts"
                            >
                              {singleSearchingId === food.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-cyan-200" />
                                  <span>Searching...</span>
                                </>
                              ) : (
                                <>
                                  <Globe className="w-3 h-3 text-cyan-300" />
                                  <span>Search Index</span>
                                </>
                              )}
                            </Button>

                            {/* Re-validate single image */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleValidateSingle(food)}
                              className="h-7 px-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Re-run ImageValidator on this URL"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </Button>

                            {/* Manual Edit URL */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(food.id);
                                setCustomUrlInput(food.image || '');
                              }}
                              className="h-7 px-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit custom image URL"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>

                            {/* Google Images Link */}
                            <a
                              href={searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 px-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title="Search Google Images in new tab"
                            >
                              <Search className="w-3 h-3 text-emerald-500" />
                              <span>Search</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ImageDiagnosticDashboard;
