import { useState, useEffect } from 'react';
import { updateSettings } from '@/lib/idb';
import type { OfflineStatus } from '@/types';

export function useOfflineDetection() {
  const [status, setStatus] = useState<OfflineStatus>(navigator.onLine ? 'online' : 'offline');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      if (!isSimulatedOffline) {
        setStatus('online');
        updateSettings({ isOffline: false });
      }
    }

    function handleOffline() {
      if (!isSimulatedOffline) {
        setStatus('offline');
        updateSettings({ isOffline: true });
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline]);

  const toggleOfflineMode = () => {
    const newOfflineStatus = status === 'online' ? 'offline' : 'online';
    setStatus(newOfflineStatus);
    setIsSimulatedOffline(newOfflineStatus === 'offline');
    updateSettings({ isOffline: newOfflineStatus === 'offline' });
  };

  return { status, toggleOfflineMode, isSimulatedOffline };
}
