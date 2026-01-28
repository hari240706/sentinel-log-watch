import { useEffect, useCallback } from 'react';
import { useAppStore, LogEntry, ThreatAlert } from '@/stores/appStore';

const LOG_SOURCES = ['Firewall-01', 'Server-Web-01', 'Database-01', 'Auth-Server', 'Network-Switch-02', 'IDS-Sensor-01', 'Endpoint-PC-045', 'VPN-Gateway'];
const LOG_LEVELS: LogEntry['level'][] = ['info', 'warning', 'error', 'critical'];
const SEVERITIES: ThreatAlert['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];

const LOG_MESSAGES = {
  info: [
    'Connection established successfully',
    'Scheduled backup completed',
    'User session started',
    'Health check passed',
    'Configuration updated',
    'New device connected to network',
    'Certificate renewal successful',
  ],
  warning: [
    'High memory usage detected (85%)',
    'Disk space running low (15% remaining)',
    'Unusual traffic pattern detected',
    'Connection timeout - retrying',
    'Authentication delay observed',
    'Rate limit approaching threshold',
  ],
  error: [
    'Failed to establish connection',
    'Authentication failure from unknown IP',
    'Service unavailable - restarting',
    'Database query timeout',
    'SSL certificate validation failed',
    'Access denied to restricted resource',
  ],
  critical: [
    'System intrusion attempt detected',
    'Multiple failed login attempts from external IP',
    'Malware signature detected in traffic',
    'Data exfiltration attempt blocked',
    'Ransomware activity detected',
    'Zero-day exploit attempt blocked',
  ],
};

const THREAT_TEMPLATES: Partial<ThreatAlert>[] = [
  { title: 'Suspicious Login Activity', description: 'Multiple failed authentication attempts detected from unusual location', severity: 'high' },
  { title: 'Network Anomaly Detected', description: 'Unusual outbound traffic volume detected from internal host', severity: 'medium' },
  { title: 'Potential DDoS Attack', description: 'High volume of requests from multiple sources targeting API endpoint', severity: 'critical' },
  { title: 'Privilege Escalation Attempt', description: 'User attempted to access resources beyond their permission level', severity: 'high' },
  { title: 'Data Transfer Alert', description: 'Large file transfer to external destination detected', severity: 'medium' },
  { title: 'Outdated Software Detected', description: 'Critical vulnerability found in installed software package', severity: 'low' },
];

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateLog(): LogEntry {
  const level = getRandomItem(LOG_LEVELS);
  const messages = LOG_MESSAGES[level];
  
  return {
    id: generateRandomId(),
    timestamp: new Date().toISOString(),
    source: getRandomItem(LOG_SOURCES),
    level,
    message: getRandomItem(messages),
    details: `Generated at ${new Date().toLocaleTimeString()}`,
  };
}

function generateThreat(): ThreatAlert {
  const template = getRandomItem(THREAT_TEMPLATES);
  
  return {
    id: generateRandomId(),
    timestamp: new Date().toISOString(),
    severity: template.severity || getRandomItem(SEVERITIES),
    title: template.title || 'Security Alert',
    description: template.description || 'A security event has been detected',
    source: getRandomItem(LOG_SOURCES),
    status: 'active',
    affectedSystems: [getRandomItem(LOG_SOURCES), getRandomItem(LOG_SOURCES)].filter((v, i, a) => a.indexOf(v) === i),
  };
}

interface UseRealTimeDataOptions {
  logInterval?: number;
  threatInterval?: number;
  enabled?: boolean;
}

export function useRealTimeData(options: UseRealTimeDataOptions = {}) {
  const { logInterval = 5000, threatInterval = 30000, enabled = true } = options;
  const { addLog, addAlert, stats } = useAppStore();

  const simulateLog = useCallback(() => {
    const log = generateLog();
    addLog(log);
  }, [addLog]);

  const simulateThreat = useCallback(() => {
    // Only generate threats occasionally (30% chance)
    if (Math.random() < 0.3) {
      const threat = generateThreat();
      addAlert(threat);
    }
  }, [addAlert]);

  useEffect(() => {
    if (!enabled) return;

    const logTimer = setInterval(simulateLog, logInterval);
    const threatTimer = setInterval(simulateThreat, threatInterval);

    return () => {
      clearInterval(logTimer);
      clearInterval(threatTimer);
    };
  }, [enabled, logInterval, threatInterval, simulateLog, simulateThreat]);

  return {
    simulateLog,
    simulateThreat,
    isEnabled: enabled,
  };
}

// Hook for getting live comparison data
export function useThreatComparisonData() {
  const { alerts } = useAppStore();

  const severityDistribution = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length, color: 'hsl(0, 72%, 55%)' },
    { name: 'High', value: alerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length, color: 'hsl(25, 95%, 53%)' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium' && a.status !== 'resolved').length, color: 'hsl(45, 93%, 47%)' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low' && a.status !== 'resolved').length, color: 'hsl(199, 89%, 48%)' },
    { name: 'Info', value: alerts.filter(a => a.severity === 'info' && a.status !== 'resolved').length, color: 'hsl(215, 16%, 47%)' },
  ].filter(item => item.value > 0);

  // Simulated weekly data (in real app, this would come from historical data)
  const weeklyComparison = [
    { day: 'Mon', current: 8, previous: 12 },
    { day: 'Tue', current: 15, previous: 10 },
    { day: 'Wed', current: 12, previous: 14 },
    { day: 'Thu', current: 18, previous: 8 },
    { day: 'Fri', current: 10, previous: 16 },
    { day: 'Sat', current: 5, previous: 4 },
    { day: 'Sun', current: 3, previous: 6 },
  ];

  const categoryBreakdown = [
    { category: 'Auth', count: alerts.filter(a => a.source.includes('Auth')).length + 2, fullMark: 20 },
    { category: 'Network', count: alerts.filter(a => a.source.includes('Network') || a.source.includes('Firewall')).length + 3, fullMark: 20 },
    { category: 'Endpoint', count: alerts.filter(a => a.source.includes('Endpoint') || a.source.includes('PC')).length + 2, fullMark: 20 },
    { category: 'Server', count: alerts.filter(a => a.source.includes('Server')).length + 1, fullMark: 20 },
    { category: 'Database', count: alerts.filter(a => a.source.includes('Database')).length + 1, fullMark: 20 },
    { category: 'IDS/IPS', count: alerts.filter(a => a.source.includes('IDS')).length + 2, fullMark: 20 },
  ];

  return {
    severityDistribution,
    weeklyComparison,
    categoryBreakdown,
  };
}
