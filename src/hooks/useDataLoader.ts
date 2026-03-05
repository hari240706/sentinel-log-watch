import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to load logs and alerts from the database on mount
 * and subscribe to realtime changes.
 */
export function useDataLoader() {
  const { fetchLogs, fetchAlerts, setLogs, setAlerts } = useAppStore();

  useEffect(() => {
    // Initial load
    fetchLogs();
    fetchAlerts();

    // Subscribe to realtime changes
    const logsChannel = supabase
      .channel('logs-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs' },
        () => {
          // Refetch to stay in sync
          fetchLogs();
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [fetchLogs, fetchAlerts]);
}
