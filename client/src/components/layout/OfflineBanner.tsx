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
    <div className="bg-red-500 text-white p-2 text-center transition-all duration-300">
      <p className="font-medium flex items-center justify-center">
        <WifiOff className="h-4 w-4 mr-2" />
        {getLocalizedText('banner.offline')}
      </p>
      <Button 
        onClick={toggleOfflineMode} 
        variant="link"
        className="text-white text-sm underline hover:no-underline ml-2 h-auto p-0"
      >
        {getLocalizedText('button.reconnect')}
      </Button>
    </div>
  );
}
