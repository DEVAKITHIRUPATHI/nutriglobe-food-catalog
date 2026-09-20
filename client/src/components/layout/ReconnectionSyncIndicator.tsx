import React, { useState, useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, RefreshCw, Cloud, Database, HardDrive, 
  Wifi, X, ChevronDown, ChevronUp, Zap, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ReconnectionSyncIndicator() {
  const { 
    offlineStatus, 
    syncStatus, 
    syncStage, 
    lastSyncStats, 
    triggerSync, 
    dismissSyncNotification, 
    showSyncBanner 
  } = useContext(AppContext);

  const [showDetails, setShowDetails] = useState(false);

  // If offline or banner is dismissed and not actively syncing/synced, hide
  if (offlineStatus === 'offline' || !showSyncBanner) {
    return null;
  }

  const stageDescriptions: Record<string, string> = {
    checking: 'Checking remote database connection & health...',
    uploading: 'Uploading offline changes & pending food updates...',
    downloading: 'Retrieving latest verified food catalog from remote database...',
    persisting: 'Reconciling & saving synchronized records into IndexedDB cache...'
  };

  const currentStageText = syncStage ? stageDescriptions[syncStage] || 'Synchronizing food data...' : 'Synchronizing food data...';

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        aria-live="polite"
        aria-label="Food Database Synchronization Status"
        initial={{ opacity: 0, y: -24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full bg-slate-900/95 border-b border-emerald-500/40 text-white shadow-xl backdrop-blur-md relative z-50 overflow-hidden"
      >
        {/* Top Glowing Accent Line */}
        <div 
          className={`h-1 w-full transition-all duration-500 ${
            syncStatus === 'syncing'
              ? 'bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 animate-pulse'
              : syncStatus === 'synced'
              ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
              : 'bg-gradient-to-r from-red-500 to-amber-500'
          }`} 
        />

        <div className="container mx-auto px-4 py-3 sm:py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Icon & Main Message */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              {/* Icon Container with Animated Halo */}
              <div className="relative shrink-0 mt-0.5 sm:mt-0">
                {syncStatus === 'syncing' ? (
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                ) : syncStatus === 'synced' ? (
                  <div className="relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-emerald-400 opacity-40"></span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-sm shadow-emerald-500/30">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Text content */}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                    {syncStatus === 'syncing' ? (
                      <>
                        <span>Reconnected</span>
                        <span className="text-slate-400 font-normal">|</span>
                        <span className="text-amber-300">Synchronizing Offline Data</span>
                      </>
                    ) : syncStatus === 'synced' ? (
                      <>
                        <span className="text-emerald-400 font-extrabold">Data Synchronized</span>
                        <span className="text-slate-400 font-normal">|</span>
                        <span className="text-slate-200">Remote Database Connected</span>
                      </>
                    ) : (
                      <span className="text-rose-400">Synchronization Warning</span>
                    )}
                  </h3>

                  {/* Informational Status Badges */}
                  {syncStatus === 'synced' && lastSyncStats && (
                    <div className="inline-flex items-center gap-1.5">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold py-0.5 px-2">
                        <Cloud className="w-3 h-3 mr-1 text-emerald-400" />
                        {lastSyncStats.syncedCount.toLocaleString()} Foods In-Sync
                      </Badge>

                      {lastSyncStats.pendingAppliedCount > 0 && (
                        <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/40 text-[10px] font-bold py-0.5 px-2">
                          <Zap className="w-3 h-3 mr-1 text-sky-400" />
                          {lastSyncStats.pendingAppliedCount} Offline Edits Pushed
                        </Badge>
                      )}

                      <Badge className="hidden sm:inline-flex bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-medium py-0.5 px-2">
                        {lastSyncStats.durationMs}ms latency
                      </Badge>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-snug">
                  {syncStatus === 'syncing' ? (
                    <span className="flex items-center gap-1.5 text-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                      {currentStageText}
                    </span>
                  ) : syncStatus === 'synced' ? (
                    <span>
                      Offline-cached food data has been reconciled with the remote database. Local IndexedDB cache and application state are completely up to date.
                    </span>
                  ) : (
                    <span>
                      Could not complete synchronization with remote database. Serving from local IndexedDB cache.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8 px-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg gap-1"
                aria-expanded={showDetails}
                aria-label="Toggle sync diagnostic details"
              >
                <span>{showDetails ? 'Hide Details' : 'Sync Details'}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => triggerSync()}
                disabled={syncStatus === 'syncing'}
                className="h-8 px-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-600/50 hover:border-emerald-500 rounded-lg gap-1.5 shadow-xs"
                title="Force re-verification of remote database synchronization"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Re-Sync</span>
              </Button>

              <button
                type="button"
                onClick={dismissSyncNotification}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Dismiss synchronization notification"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Diagnostic & Metadata Panel */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3 pt-3 border-t border-slate-800"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Remote Database</span>
                    </div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Connected & Verified</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Endpoint: /api/foods/sync</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                      <span>Local IndexedDB Cache</span>
                    </div>
                    <p className="font-bold text-white">
                      {lastSyncStats?.syncedCount ? `${lastSyncStats.syncedCount.toLocaleString()} Records Stored` : 'Active'}
                    </p>
                    <p className="text-[10px] text-slate-400">Store: nutriglobe-db / foodItems</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Offline Mutated Items</span>
                    </div>
                    <p className="font-bold text-white">
                      {lastSyncStats?.pendingAppliedCount 
                        ? `${lastSyncStats.pendingAppliedCount} queued edits reconciled`
                        : '0 pending mutations'}
                    </p>
                    <p className="text-[10px] text-slate-400">Bidirectional Sync Active</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cache Verification</span>
                    </div>
                    <p className="font-bold text-white">100% In-Memory Synced</p>
                    <p className="text-[10px] text-slate-400">
                      {lastSyncStats?.timestamp ? new Date(lastSyncStats.timestamp).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
