import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: string;
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  source: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  affectedSystems: string[];
}

export interface SystemStats {
  totalLogs: number;
  activeThreats: number;
  resolvedThreats: number;
  systemsMonitored: number;
  logsProcessedToday: number;
  avgResponseTime: string;
}

interface AppState {
  logs: LogEntry[];
  alerts: ThreatAlert[];
  stats: SystemStats;
  sidebarOpen: boolean;
  darkMode: boolean;
  loading: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  addLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  addAlert: (alert: Omit<ThreatAlert, 'id'>) => Promise<void>;
  updateAlertStatus: (id: string, status: ThreatAlert['status']) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  setLogs: (logs: LogEntry[]) => void;
  setAlerts: (alerts: ThreatAlert[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  logs: [],
  alerts: [],
  stats: {
    totalLogs: 0,
    activeThreats: 0,
    resolvedThreats: 0,
    systemsMonitored: 156,
    logsProcessedToday: 0,
    avgResponseTime: '1.2s',
  },
  sidebarOpen: true,
  darkMode: false,
  loading: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { darkMode: newDarkMode };
  }),

  setLogs: (logs) => set({ logs }),
  setAlerts: (alerts) => set({ alerts }),

  fetchLogs: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);
    
    if (!error && data) {
      const logs: LogEntry[] = data.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        source: row.source,
        level: row.level as LogEntry['level'],
        message: row.message,
        details: row.details ?? undefined,
      }));
      set({ logs });
    }
  },

  fetchAlerts: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);
    
    if (!error && data) {
      const alerts: ThreatAlert[] = data.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        severity: row.severity as ThreatAlert['severity'],
        title: row.title,
        description: row.description,
        source: row.source,
        status: row.status as ThreatAlert['status'],
        affectedSystems: row.affected_systems ?? [],
      }));
      set({ alerts });
    }
  },

  addLog: async (log) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        timestamp: log.timestamp,
        source: log.source,
        level: log.level,
        message: log.message,
        details: log.details ?? null,
      })
      .select()
      .single();
    
    if (!error && data) {
      const newLog: LogEntry = {
        id: data.id,
        timestamp: data.timestamp,
        source: data.source,
        level: data.level as LogEntry['level'],
        message: data.message,
        details: data.details ?? undefined,
      };
      set((state) => ({ logs: [newLog, ...state.logs] }));
    }
  },
  
  addAlert: async (alert) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        timestamp: alert.timestamp,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        source: alert.source,
        status: alert.status,
        affected_systems: alert.affectedSystems,
      })
      .select()
      .single();
    
    if (!error && data) {
      const newAlert: ThreatAlert = {
        id: data.id,
        timestamp: data.timestamp,
        severity: data.severity as ThreatAlert['severity'],
        title: data.title,
        description: data.description,
        source: data.source,
        status: data.status as ThreatAlert['status'],
        affectedSystems: data.affected_systems ?? [],
      };
      set((state) => ({ alerts: [newAlert, ...state.alerts] }));
    }
  },
  
  updateAlertStatus: async (id, status) => {
    const { error } = await supabase
      .from('alerts')
      .update({ status })
      .eq('id', id);
    
    if (!error) {
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === id ? { ...alert, status } : alert
        ),
      }));
    }
  },

  dismissAlert: async (id) => {
    const { error } = await supabase
      .from('alerts')
      .update({ status: 'dismissed' })
      .eq('id', id);
    
    if (!error) {
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === id ? { ...alert, status: 'dismissed' as const } : alert
        ),
      }));
    }
  },
}));
