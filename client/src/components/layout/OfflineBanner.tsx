import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineBanner() {
  const { offlineStatus, toggleOfflineMode } = useContext(AppContext);
  const { getLocalizedText } = useTranslation();

  if (offlineStatus !== 'offline') return null;

  return (
    <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700 text-white px-4 py-2 text-center transition-all duration-300 shadow-md border-b border-rose-500/40 relative z-40">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-semibold">
        <span className="flex items-center">
          <WifiOff className="h-4 w-4 mr-2 shrink-0 animate-pulse text-amber-200" />
          {getLocalizedText('banner.offline') || 'Offline Mode: Serving cached food data from IndexedDB.'}
        </span>
        <Button 
          onClick={toggleOfflineMode} 
          variant="secondary"
          size="sm"
          className="h-6 px-2.5 text-xs font-bold rounded-lg bg-white/20 hover:bg-white text-white hover:text-rose-900 border border-white/30 transition-all shadow-xs"
        >
          {getLocalizedText('button.reconnect') || 'Reconnect & Sync'}
        </Button>
      </div>
    </div>
  );
}
