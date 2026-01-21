import { motion } from 'framer-motion';
import {
  FileText,
  AlertTriangle,
  Shield,
  Activity,
  Server,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
} from 'recharts';

const activityData = [
  { time: '00:00', logs: 120, threats: 2 },
  { time: '04:00', logs: 80, threats: 0 },
  { time: '08:00', logs: 340, threats: 5 },
  { time: '12:00', logs: 520, threats: 8 },
  { time: '16:00', logs: 480, threats: 3 },
  { time: '20:00', logs: 280, threats: 1 },
];

const sourceData = [
  { name: 'Firewall', count: 4521 },
  { name: 'Servers', count: 3842 },
  { name: 'Endpoints', count: 2956 },
  { name: 'Network', count: 2134 },
  { name: 'Auth', count: 1847 },
];

export default function Dashboard() {
  const { stats, alerts, logs } = useAppStore();
  const recentAlerts = alerts.filter(a => a.status === 'active' || a.status === 'investigating').slice(0, 4);
  const recentLogs = logs.slice(0, 5);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Security Dashboard"
        description="Real-time monitoring of your isolated network infrastructure"
        actions={
          <div className="flex items-center gap-2">
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
          value={stats.logsProcessedToday.toLocaleString()}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          variant="info"
        />
        <StatCard
          title="Active Threats"
          value={stats.activeThreats}
          icon={AlertTriangle}
          variant="error"
        />
        <StatCard
          title="Systems Monitored"
          value={stats.systemsMonitored}
          icon={Server}
          variant="success"
        />
        <StatCard
          title="Avg Response Time"
          value={stats.avgResponseTime}
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="cyber-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(213, 56%, 33%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(213, 56%, 33%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 63%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 72%, 63%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="hsl(213, 56%, 33%)"
                    fillOpacity={1}
                    fill="url(#colorLogs)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="threats"
                    stroke="hsl(0, 72%, 63%)"
                    fillOpacity={1}
                    fill="url(#colorThreats)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="cyber-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Log Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={70} />
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
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <SeverityBadge severity={alert.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.source} • {formatTime(alert.timestamp)}</p>
                      </div>
                    </div>
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
          transition={{ delay: 0.4 }}
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
                  <div
                    key={log.id}
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
