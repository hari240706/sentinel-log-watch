import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDataLoader } from '@/hooks/useDataLoader';
import { useSystemDetector } from '@/hooks/useSystemDetector';
import {
  FileText,
  AlertTriangle,
  Shield,
  Activity,
  Server,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { useAppStore } from '@/stores/appStore';
import { useRealTimeData, useThreatComparisonData } from '@/hooks/useRealTimeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const { stats, alerts, logs } = useAppStore();
  useDataLoader();
  useSystemDetector();
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [liveActivityData, setLiveActivityData] = useState<{ time: string; logs: number; threats: number }[]>([]);
  
  // Enable real-time simulation
  useRealTimeData({ enabled: realTimeEnabled, logInterval: 3000, threatInterval: 15000 });
  
  // Get comparison data
  const comparisonData = useThreatComparisonData();
  
  const recentAlerts = alerts.filter(a => a.status === 'active' || a.status === 'investigating').slice(0, 4);
  const recentLogs = logs.slice(0, 5);

  // Update live activity data periodically
  useEffect(() => {
    const generateTimePoint = () => {
      const now = new Date();
      return {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        logs: Math.floor(Math.random() * 200) + 100,
        threats: Math.floor(Math.random() * 5),
      };
    };

    // Initialize with some data points
    setLiveActivityData(Array.from({ length: 8 }, generateTimePoint));

    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      setLiveActivityData(prev => {
        const newData = [...prev.slice(-7), generateTimePoint()];
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  const sourceData = [
    { name: 'Firewall', count: logs.filter(l => l.source.includes('Firewall')).length + 45 },
    { name: 'Servers', count: logs.filter(l => l.source.includes('Server')).length + 38 },
    { name: 'Endpoints', count: logs.filter(l => l.source.includes('Endpoint')).length + 29 },
    { name: 'Network', count: logs.filter(l => l.source.includes('Network')).length + 21 },
    { name: 'Auth', count: logs.filter(l => l.source.includes('Auth')).length + 18 },
  ];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate dynamic stats
  const dynamicStats = {
    logsToday: logs.length * 100 + Math.floor(Math.random() * 50),
    activeThreats: alerts.filter(a => a.status === 'active').length,
    systemsMonitored: 156,
    avgResponseTime: `${(Math.random() * 0.5 + 0.8).toFixed(1)}s`,
  };

  return (
    <MainLayout>
      <PageHeader
        title="Security Dashboard"
        description="Real-time monitoring of your isolated network infrastructure"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant={realTimeEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={cn(realTimeEnabled && 'bg-success hover:bg-success/90')}
            >
              <Zap className={cn('w-4 h-4 mr-2', realTimeEnabled && 'animate-pulse')} />
              {realTimeEnabled ? 'Live Data' : 'Paused'}
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </div>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Logs Today"
          value={dynamicStats.logsToday.toLocaleString()}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          variant="info"
        />
        <StatCard
          title="Active Threats"
          value={dynamicStats.activeThreats}
          icon={AlertTriangle}
          variant="error"
        />
        <StatCard
          title="Systems Monitored"
          value={dynamicStats.systemsMonitored}
          icon={Server}
          variant="success"
        />
        <StatCard
          title="Avg Response Time"
          value={dynamicStats.avgResponseTime}
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Live Activity & Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Live Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="cyber-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Activity
                </span>
                {realTimeEnabled && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Updating
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={liveActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="logs"
                    stroke="hsl(199, 89%, 48%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(199, 89%, 48%)', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: 'hsl(199, 89%, 48%)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="threats"
                    stroke="hsl(0, 72%, 55%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(0, 72%, 55%)', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: 'hsl(0, 72%, 55%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(199, 89%, 48%)' }} />
                  <span className="text-xs text-muted-foreground">Logs/min</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(0, 72%, 55%)' }} />
                  <span className="text-xs text-muted-foreground">Threats</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Threat Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="cyber-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Threat Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={comparisonData.severityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {comparisonData.severityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {comparisonData.severityDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                      <span className="text-xs font-medium text-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Source Distribution & Weekly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Log Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="cyber-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Log Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="cyber-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Weekly Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={comparisonData.weeklyComparison}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    stroke="hsl(var(--muted-foreground))"
                    fillOpacity={1}
                    fill="url(#colorPrevious)"
                    strokeWidth={2}
                    name="Last Week"
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="hsl(199, 89%, 48%)"
                    fillOpacity={1}
                    fill="url(#colorCurrent)"
                    strokeWidth={2}
                    name="This Week"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="cyber-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Active Threats
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/alerts">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active threats</p>
                ) : (
                  recentAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <SeverityBadge severity={alert.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.source} • {formatTime(alert.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="cyber-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Logs
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/logs">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      log.level === 'critical' ? 'bg-destructive' :
                      log.level === 'error' ? 'bg-orange-500' :
                      log.level === 'warning' ? 'bg-warning' :
                      'bg-info'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{log.message}</p>
                      <p className="text-xs text-muted-foreground">{log.source} • {formatTime(log.timestamp)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
