import { create } from 'zustand';

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
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  addLog: (log: LogEntry) => void;
  addAlert: (alert: ThreatAlert) => void;
  updateAlertStatus: (id: string, status: ThreatAlert['status']) => void;
  dismissAlert: (id: string) => void;
}

// Mock data for demonstration
const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '2024-01-21T10:32:15Z', source: 'Firewall-01', level: 'error', message: 'Blocked unauthorized access attempt from 192.168.1.100', details: 'Port scan detected on ports 22, 80, 443' },
  { id: '2', timestamp: '2024-01-21T10:30:45Z', source: 'Server-Web-01', level: 'warning', message: 'High CPU usage detected (92%)', details: 'Process: node.exe consuming 85% CPU' },
  { id: '3', timestamp: '2024-01-21T10:28:22Z', source: 'Database-01', level: 'info', message: 'Backup completed successfully', details: 'Full backup size: 2.3GB' },
  { id: '4', timestamp: '2024-01-21T10:25:11Z', source: 'Auth-Server', level: 'critical', message: 'Multiple failed login attempts detected', details: '15 failed attempts from IP 10.0.0.55 in last 5 minutes' },
  { id: '5', timestamp: '2024-01-21T10:22:08Z', source: 'Network-Switch-02', level: 'info', message: 'Link state change detected', details: 'Port 24 changed from up to down' },
  { id: '6', timestamp: '2024-01-21T10:18:33Z', source: 'IDS-Sensor-01', level: 'warning', message: 'Suspicious DNS query pattern detected', details: 'Potential DNS tunneling activity from 192.168.5.22' },
  { id: '7', timestamp: '2024-01-21T10:15:19Z', source: 'Endpoint-PC-045', level: 'error', message: 'Malware signature detected', details: 'Trojan.GenericKD.46584721 quarantined' },
  { id: '8', timestamp: '2024-01-21T10:12:55Z', source: 'VPN-Gateway', level: 'info', message: 'New VPN connection established', details: 'User: admin@corp from 203.0.113.50' },
];

const mockAlerts: ThreatAlert[] = [
  { id: 'a1', timestamp: '2024-01-21T10:32:15Z', severity: 'critical', title: 'Brute Force Attack Detected', description: 'Multiple failed authentication attempts detected from external IP', source: 'Auth-Server', status: 'active', affectedSystems: ['Auth-Server', 'VPN-Gateway'] },
  { id: 'a2', timestamp: '2024-01-21T10:28:00Z', severity: 'high', title: 'Malware Detection', description: 'Trojan signature identified and quarantined on endpoint', source: 'Endpoint-PC-045', status: 'investigating', affectedSystems: ['Endpoint-PC-045'] },
  { id: 'a3', timestamp: '2024-01-21T10:18:33Z', severity: 'medium', title: 'DNS Tunneling Suspected', description: 'Unusual DNS query patterns may indicate data exfiltration attempt', source: 'IDS-Sensor-01', status: 'investigating', affectedSystems: ['Workstation-22', 'DNS-Server'] },
  { id: 'a4', timestamp: '2024-01-21T09:45:22Z', severity: 'low', title: 'Port Scan Detected', description: 'External reconnaissance activity blocked by firewall', source: 'Firewall-01', status: 'resolved', affectedSystems: ['Firewall-01'] },
  { id: 'a5', timestamp: '2024-01-21T09:15:10Z', severity: 'info', title: 'System Patch Available', description: 'Critical security update available for Windows servers', source: 'Patch-Manager', status: 'active', affectedSystems: ['Server-Web-01', 'Server-App-02', 'Database-01'] },
];

const mockStats: SystemStats = {
  totalLogs: 15847,
  activeThreats: 3,
  resolvedThreats: 42,
  systemsMonitored: 156,
  logsProcessedToday: 2847,
  avgResponseTime: '1.2s',
};

export const useAppStore = create<AppState>((set) => ({
  logs: mockLogs,
  alerts: mockAlerts,
  stats: mockStats,
  sidebarOpen: true,
  darkMode: false,

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

  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  
  updateAlertStatus: (id, status) => set((state) => ({
    alerts: state.alerts.map((alert) =>
      alert.id === id ? { ...alert, status } : alert
    ),
  })),

  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.map((alert) =>
      alert.id === id ? { ...alert, status: 'dismissed' as const } : alert
    ),
  })),
}));
