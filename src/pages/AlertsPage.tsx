import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Shield,
  Server,
  Zap,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ThreatSolutionCard } from '@/components/threats/ThreatSolutionCard';
import { ThreatComparisonChart } from '@/components/threats/ThreatComparisonChart';
import { useAppStore, ThreatAlert } from '@/stores/appStore';
import { useRealTimeData, useThreatComparisonData } from '@/hooks/useRealTimeData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig = {
  active: { label: 'Active', icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
  investigating: { label: 'Investigating', icon: Eye, className: 'bg-warning/10 text-yellow-600 border-warning/30' },
  resolved: { label: 'Resolved', icon: CheckCircle, className: 'bg-success/10 text-success border-success/30' },
  dismissed: { label: 'Dismissed', icon: XCircle, className: 'bg-muted text-muted-foreground border-border' },
};

export default function AlertsPage() {
  const { alerts, updateAlertStatus, dismissAlert } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  
  // Enable real-time data simulation
  useRealTimeData({ enabled: realTimeEnabled, logInterval: 5000, threatInterval: 20000 });
  
  // Get comparison data for charts
  const comparisonData = useThreatComparisonData();

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        alert =>
          alert.title.toLowerCase().includes(term) ||
          alert.description.toLowerCase().includes(term) ||
          alert.source.toLowerCase().includes(term)
      );
    }

    if (severityFilter !== 'all') {
      result = result.filter(alert => alert.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(alert => alert.status === statusFilter);
    }

    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const alertStats = useMemo(() => ({
    active: alerts.filter(a => a.status === 'active').length,
    investigating: alerts.filter(a => a.status === 'investigating').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved' && a.status !== 'dismissed').length,
  }), [alerts]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleApplySolution = (alertId: string) => {
    updateAlertStatus(alertId, 'resolved');
    setSelectedAlert(null);
    toast.success('Automated fix applied successfully!', {
      description: 'The threat has been resolved and the system has been secured.',
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Threat Monitoring"
        description="Monitor and respond to security threats in real-time"
        actions={
          <Button
            variant={realTimeEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className={cn(realTimeEnabled && 'bg-success hover:bg-success/90')}
          >
            <Zap className={cn('w-4 h-4 mr-2', realTimeEnabled && 'animate-pulse')} />
            {realTimeEnabled ? 'Live' : 'Paused'}
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card flex items-center gap-4"
        >
          <div className="p-3 rounded-lg bg-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{alertStats.active}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="cyber-card flex items-center gap-4"
        >
          <div className="p-3 rounded-lg bg-warning/10">
            <Eye className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{alertStats.investigating}</p>
            <p className="text-sm text-muted-foreground">Investigating</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-card flex items-center gap-4"
        >
          <div className="p-3 rounded-lg bg-success/10">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{alertStats.resolved}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="cyber-card flex items-center gap-4"
        >
          <div className="p-3 rounded-lg bg-destructive/20">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{alertStats.critical}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
        </motion.div>
      </div>

      {/* Comparison Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <ThreatComparisonChart data={comparisonData} />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredAlerts.length === 0 ? (
          <Card className="cyber-card">
            <CardContent>
              <EmptyState
                icon={AlertTriangle}
                title="No alerts found"
                description="Try adjusting your filters or search terms"
                className="py-12"
              />
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => {
              const StatusIcon = statusConfig[alert.status].icon;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      'cyber-card cursor-pointer transition-all hover:shadow-lg',
                      alert.severity === 'critical' && alert.status === 'active' && 'border-l-4 border-l-destructive'
                    )}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'p-2 rounded-lg',
                          alert.severity === 'critical' ? 'bg-destructive/10' :
                          alert.severity === 'high' ? 'bg-orange-500/10' :
                          alert.severity === 'medium' ? 'bg-warning/10' :
                          'bg-info/10'
                        )}>
                          <AlertTriangle className={cn(
                            'w-5 h-5',
                            alert.severity === 'critical' ? 'text-destructive' :
                            alert.severity === 'high' ? 'text-orange-600' :
                            alert.severity === 'medium' ? 'text-yellow-600' :
                            'text-info'
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{alert.title}</h3>
                            <SeverityBadge severity={alert.severity} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Server className="w-3.5 h-3.5" />
                              {alert.source}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimestamp(alert.timestamp)}
                            </span>
                            <Badge variant="outline" className={statusConfig[alert.status].className}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[alert.status].label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAlertStatus(alert.id, 'investigating');
                              }}
                            >
                              Investigate
                            </Button>
                          )}
                          {alert.status === 'investigating' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success border-success/30 hover:bg-success/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAlertStatus(alert.id, 'resolved');
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Alert Detail Dialog with Solution */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAlert.title}
                  <SeverityBadge severity={selectedAlert.severity} />
                </DialogTitle>
                <DialogDescription>{selectedAlert.description}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="solution">Suggested Solution</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Source</p>
                      <p className="text-sm text-foreground">{selectedAlert.source}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                      <p className="text-sm text-foreground">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Affected Systems</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.affectedSystems.map(system => (
                        <Badge key={system} variant="secondary">{system}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="solution" className="py-4">
                  <ThreatSolutionCard
                    threatType={selectedAlert.title}
                    severity={selectedAlert.severity}
                    onApplySolution={
                      selectedAlert.status !== 'resolved' && selectedAlert.status !== 'dismissed'
                        ? () => handleApplySolution(selectedAlert.id)
                        : undefined
                    }
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-2">
                {selectedAlert.status !== 'dismissed' && selectedAlert.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      dismissAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                  >
                    Dismiss
                  </Button>
                )}
                {selectedAlert.status === 'active' && (
                  <Button
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'investigating');
                      setSelectedAlert(null);
                    }}
                  >
                    Start Investigation
                  </Button>
                )}
                {selectedAlert.status === 'investigating' && (
                  <Button
                    className="bg-success hover:bg-success/90"
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'resolved');
                      setSelectedAlert(null);
                    }}
                  >
                    Mark Resolved
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
