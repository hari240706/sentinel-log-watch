import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Shield,
  AlertTriangle,
  BarChart3,
  PieChart as PieIcon,
  Clock,
  CheckCircle,
  Printer,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEVERITY_COLORS = ['hsl(0, 72%, 55%)', 'hsl(25, 95%, 53%)', 'hsl(45, 93%, 47%)', 'hsl(199, 89%, 48%)', 'hsl(215, 16%, 47%)'];

export default function ReportsPage() {
  const { alerts, logs } = useAppStore();
  const [reportPeriod, setReportPeriod] = useState('7');
  const [exportFormat, setExportFormat] = useState('pdf');

  const reportData = useMemo(() => {
    const activeThreats = alerts.filter(a => a.status === 'active').length;
    const resolvedThreats = alerts.filter(a => a.status === 'resolved').length;
    const investigatingThreats = alerts.filter(a => a.status === 'investigating').length;
    const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'dismissed').length;
    const highCount = alerts.filter(a => a.severity === 'high' && a.status !== 'dismissed').length;
    const mediumCount = alerts.filter(a => a.severity === 'medium' && a.status !== 'dismissed').length;
    const lowCount = alerts.filter(a => a.severity === 'low' && a.status !== 'dismissed').length;
    const infoCount = alerts.filter(a => a.severity === 'info' && a.status !== 'dismissed').length;

    const severityData = [
      { name: 'Critical', value: criticalCount },
      { name: 'High', value: highCount },
      { name: 'Medium', value: mediumCount },
      { name: 'Low', value: lowCount },
      { name: 'Info', value: infoCount },
    ].filter(d => d.value > 0);

    const logLevelData = [
      { level: 'Critical', count: logs.filter(l => l.level === 'critical').length },
      { level: 'Error', count: logs.filter(l => l.level === 'error').length },
      { level: 'Warning', count: logs.filter(l => l.level === 'warning').length },
      { level: 'Info', count: logs.filter(l => l.level === 'info').length },
    ];

    const sourceData = [...new Set(logs.map(l => l.source))].map(source => ({
      source,
      count: logs.filter(l => l.source === source).length,
    })).sort((a, b) => b.count - a.count).slice(0, 8);

    const resolutionRate = alerts.length > 0
      ? ((resolvedThreats / alerts.length) * 100).toFixed(1)
      : '0';

    return {
      activeThreats,
      resolvedThreats,
      investigatingThreats,
      totalAlerts: alerts.length,
      totalLogs: logs.length,
      severityData,
      logLevelData,
      sourceData,
      resolutionRate,
      criticalCount,
    };
  }, [alerts, logs]);

  const handleExport = () => {
    // Generate report data as downloadable content
    const report = {
      generatedAt: new Date().toISOString(),
      period: `Last ${reportPeriod} days`,
      summary: {
        totalAlerts: reportData.totalAlerts,
        activeThreats: reportData.activeThreats,
        resolvedThreats: reportData.resolvedThreats,
        totalLogs: reportData.totalLogs,
        resolutionRate: reportData.resolutionRate + '%',
      },
      threats: alerts.map(a => ({
        title: a.title,
        severity: a.severity,
        status: a.status,
        source: a.source,
        timestamp: a.timestamp,
        affectedSystems: a.affectedSystems,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  return (
    <MainLayout>
      <PageHeader
        title="Security Reports"
        description="Generate summarized analytical reports for SOC teams and administrators"
        actions={
          <div className="flex items-center gap-2">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Executive Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="cyber-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Executive Summary
            </CardTitle>
            <CardDescription>Report period: Last {reportPeriod} days • Generated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Alerts', value: reportData.totalAlerts, icon: AlertTriangle, color: 'text-foreground' },
                { label: 'Active Threats', value: reportData.activeThreats, icon: Shield, color: 'text-destructive' },
                { label: 'Investigating', value: reportData.investigatingThreats, icon: Clock, color: 'text-yellow-600' },
                { label: 'Resolved', value: reportData.resolvedThreats, icon: CheckCircle, color: 'text-success' },
                { label: 'Critical', value: reportData.criticalCount, icon: AlertTriangle, color: 'text-destructive' },
                { label: 'Resolution Rate', value: reportData.resolutionRate + '%', icon: BarChart3, color: 'text-info' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <stat.icon className={cn('w-5 h-5 mx-auto mb-2', stat.color)} />
                  <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Severity Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="cyber-card h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-primary" />
                Threat Severity Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reportData.severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {reportData.severityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {reportData.severityData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: SEVERITY_COLORS[i] }} />
                    <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Log Sources Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="cyber-card h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Log Source Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis dataKey="source" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Log Level Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="cyber-card mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Log Level Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {reportData.logLevelData.map((item) => (
                <div key={item.level} className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{item.count}</p>
                  <p className="text-sm text-muted-foreground">{item.level}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Threats Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Threat Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <Badge variant="outline" className={cn(
                    alert.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : alert.severity === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                    : alert.severity === 'medium' ? 'bg-warning/10 text-yellow-600 border-warning/30'
                    : 'bg-info/10 text-info border-info/30'
                  )}>
                    {alert.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.source} • {alert.affectedSystems.join(', ')}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    alert.status === 'resolved' ? 'bg-success/10 text-success' : 
                    alert.status === 'active' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-yellow-600'
                  )}>
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
