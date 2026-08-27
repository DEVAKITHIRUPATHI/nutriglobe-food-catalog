import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { AppContext } from '@/contexts/AppContext';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { isLoading: isAppLoading } = useContext(AppContext);

  const isGloballyActive = isFetching > 0 || isMutating > 0 || isAppLoading;
  const activeCount = isFetching + isMutating + (isAppLoading ? 1 : 0);

  return (
    <AnimatePresence>
      {isGloballyActive && (
        <div id="global-loading-system" className="pointer-events-none fixed inset-x-0 top-0 z-50">
          {/* Top Edge Animated Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-1 w-full origin-left bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shadow-sm"
          >
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeInOut',
              }}
              className="h-full w-1/3 bg-white/40 blur-xs"
            />
          </motion.div>

          {/* Floating Subtle Status HUD Pill */}
          <div className="fixed bottom-5 right-5 z-50 flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-white/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md dark:border-emerald-500/30 dark:bg-slate-900/90"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                >
                  <Loader2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>

              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {isAppLoading
                  ? 'Loading nutrition data...'
                  : activeCount > 1
                  ? `Syncing (${activeCount} active)...`
                  : 'Updating data...'}
              </span>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
