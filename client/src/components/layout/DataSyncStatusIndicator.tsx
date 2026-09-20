import { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { getSettings, updateSettings, getFoodItems } from '@/lib/idb';
import { 
  Cloud, HardDrive, RefreshCw, Wifi, WifiOff, CheckCircle2, 
  Database, ShieldCheck, Zap, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface DataSyncStatusIndicatorProps {
  variant?: 'compact' | 'card' | 'badge';
  className?: string;
}

export function DataSyncStatusIndicator({ 
  variant = 'compact', 
  className = '' 
}: DataSyncStatusIndicatorProps) {
  const { 
    offlineStatus, 
    toggleOfflineMode, 
    syncStatus, 
    lastSyncStats, 
    triggerSync 
  } = useContext(AppContext);

  const [lastSyncTime, setLastSyncTime] = useState<number>(() => lastSyncStats?.timestamp || Date.now());
  const [cachedItemsCount, setCachedItemsCount] = useState<number>(() => lastSyncStats?.syncedCount || 100);

  // Sync state determination
  const isOnline = offlineStatus === 'online' && typeof navigator !== 'undefined' && navigator.onLine;
  const isActivelySyncing = syncStatus === 'syncing';

  const loadSyncMetadata = async () => {
    try {
      const settings = await getSettings();
      if (settings.lastSync) {
        setLastSyncTime(settings.lastSync);
      }
      const items = await getFoodItems();
      if (items && items.length > 0) {
        setCachedItemsCount(items.length);
      }
    } catch (e) {
      console.warn('Failed to load sync metadata:', e);
    }
  };

  useEffect(() => {
    loadSyncMetadata();
  }, [offlineStatus, lastSyncStats]);

  const handleManualSync = async () => {
    if (isActivelySyncing) return;
    try {
      if (isOnline) {
        const stats = await triggerSync();
        if (stats?.timestamp) {
          setLastSyncTime(stats.timestamp);
        }
      } else {
        await loadSyncMetadata();
      }
    } catch (e) {
      console.error('Manual sync failed:', e);
    }
  };

  const formattedLastSync = () => {
    const diffMs = Date.now() - lastSyncTime;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  // 1. Compact Variant (For Navbar, Headers, Footers)
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              onClick={handleManualSync}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm select-none ${
                isActivelySyncing 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : isOnline
                  ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 border-amber-400/30 text-amber-300 hover:bg-amber-500/25'
              } ${className}`}
            >
              {isActivelySyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Syncing with DB...</span>
                </>
              ) : isOnline ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Synced with DB</span>
                  <span className="sm:hidden">Synced</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Local Offline Cache</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-white border-slate-700 text-xs p-3 space-y-1">
            <p className="font-extrabold flex items-center gap-1.5">
              {isOnline ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Database className="w-4 h-4 text-amber-400" />
              )}
              {isOnline ? 'Cloud Server Synchronization Active' : 'Offline Cache Mode'}
            </p>
            <p className="text-slate-300 text-[11px]">
              {isOnline 
                ? `Nutrition data is fully synchronized with server API. Last synced: ${formattedLastSync()}`
                : `Using IndexedDB offline store (${cachedItemsCount}+ items cached). Changes will sync when online.`
              }
            </p>
            <p className="text-slate-400 text-[10px] italic">Click indicator to re-verify sync state</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 2. Badge Variant (Minimal pill)
  if (variant === 'badge') {
    return (
      <Badge 
        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 border shadow-sm ${
          isOnline 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        } ${className}`}
      >
        {isOnline ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Synced
          </>
        ) : (
          <>
            <HardDrive className="w-3 h-3 text-amber-500" />
            Local Cache
          </>
        )}
      </Badge>
    );
  }

  // 3. Card Variant (Detailed Diagnostic Panel for Calculator & Nutrition Pages)
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isOnline 
        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60' 
        : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
    } ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isOnline 
              ? 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-300' 
              : 'bg-amber-500/10 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-300'
          }`}>
            {isOnline ? (
              <Cloud className="w-5 h-5" />
            ) : (
              <HardDrive className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Data Storage Status:
              </h4>
              <Badge variant="outline" className={`text-[10px] font-extrabold ${
                isOnline 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-amber-600 text-white border-amber-500'
              }`}>
                {isOnline ? 'Synced with Cloud Server' : 'Available in Local Offline Cache'}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isOnline ? (
                <>Your nutrition calculations, food items, and logs are actively synchronized with the server database. Last synced <strong>{formattedLastSync()}</strong>.</>
              ) : (
                <>Offline mode active. Your custom logs and food database are serving instantly from local <strong>IndexedDB cache</strong> ({cachedItemsCount}+ cached items).</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleManualSync}
            disabled={isActivelySyncing}
            size="sm"
            variant="outline"
            className={`text-xs font-bold rounded-xl gap-1.5 border shadow-sm ${
              isOnline
                ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50'
                : 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isActivelySyncing ? 'animate-spin' : ''}`} />
            {isActivelySyncing ? 'Syncing with DB...' : 'Re-Sync Now'}
          </Button>

          <Button
            onClick={toggleOfflineMode}
            size="sm"
            variant="ghost"
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            {isOnline ? 'Test Offline' : 'Go Online'}
          </Button>
        </div>
      </div>
    </div>
  );
}
