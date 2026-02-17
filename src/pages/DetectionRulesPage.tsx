import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Cpu,
  Fingerprint,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DetectionRule {
  id: string;
  name: string;
  type: 'rule-based' | 'anomaly-based' | 'signature-based';
  enabled: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  pattern?: string;
  threshold?: number;
  lastTriggered?: string;
  triggerCount: number;
}

const initialRules: DetectionRule[] = [
  { id: '1', name: 'Brute Force Detection', type: 'rule-based', enabled: true, severity: 'critical', description: 'Detects multiple failed login attempts exceeding threshold within time window', pattern: 'failed_login > 5 in 5min', threshold: 5, lastTriggered: '2024-01-21T10:32:00Z', triggerCount: 23 },
  { id: '2', name: 'Port Scan Detection', type: 'signature-based', enabled: true, severity: 'high', description: 'Identifies sequential port scanning activity from single source', pattern: 'SYN packets to >10 ports from same IP', triggerCount: 15 },
  { id: '3', name: 'Unusual Traffic Volume', type: 'anomaly-based', enabled: true, severity: 'medium', description: 'Flags traffic deviating >2 standard deviations from baseline', threshold: 2, lastTriggered: '2024-01-21T09:15:00Z', triggerCount: 8 },
  { id: '4', name: 'Known Malware Signatures', type: 'signature-based', enabled: true, severity: 'critical', description: 'Matches against known malware hash database and byte patterns', pattern: 'MD5/SHA256 signature match', triggerCount: 5 },
  { id: '5', name: 'DNS Tunneling Detection', type: 'anomaly-based', enabled: false, severity: 'high', description: 'Detects abnormal DNS query length and frequency patterns', threshold: 100, triggerCount: 3 },
  { id: '6', name: 'Privilege Escalation', type: 'rule-based', enabled: true, severity: 'critical', description: 'Monitors for unauthorized privilege elevation attempts', pattern: 'sudo/su usage from non-admin accounts', triggerCount: 12 },
  { id: '7', name: 'Data Exfiltration Alert', type: 'anomaly-based', enabled: true, severity: 'high', description: 'Detects large outbound data transfers exceeding normal patterns', threshold: 500, lastTriggered: '2024-01-21T08:45:00Z', triggerCount: 4 },
  { id: '8', name: 'SQL Injection Pattern', type: 'signature-based', enabled: true, severity: 'high', description: 'Identifies SQL injection attack patterns in HTTP requests', pattern: "UNION SELECT|' OR 1=1|DROP TABLE", triggerCount: 19 },
];

const typeConfig = {
  'rule-based': { icon: Shield, color: 'text-primary', bgColor: 'bg-primary/10', label: 'Rule-Based' },
  'anomaly-based': { icon: Cpu, color: 'text-info', bgColor: 'bg-info/10', label: 'Anomaly-Based' },
  'signature-based': { icon: Fingerprint, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Signature-Based' },
};

const severityColors = {
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  medium: 'bg-warning/10 text-yellow-600 border-warning/30',
  low: 'bg-info/10 text-info border-info/30',
};

export default function DetectionRulesPage() {
  const [rules, setRules] = useState<DetectionRule[]>(initialRules);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'rule-based' as DetectionRule['type'],
    severity: 'medium' as DetectionRule['severity'],
    description: '',
    pattern: '',
    threshold: 5,
  });

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    const rule = rules.find(r => r.id === id);
    toast.success(`Rule "${rule?.name}" ${rule?.enabled ? 'disabled' : 'enabled'}`);
  };

  const deleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success(`Rule "${rule?.name}" deleted`);
  };

  const addRule = () => {
    if (!newRule.name.trim()) { toast.error('Rule name is required'); return; }
    const rule: DetectionRule = {
      id: Math.random().toString(36).substring(2, 9),
      ...newRule,
      enabled: true,
      triggerCount: 0,
    };
    setRules(prev => [rule, ...prev]);
    setAddDialogOpen(false);
    setNewRule({ name: '', type: 'rule-based', severity: 'medium', description: '', pattern: '', threshold: 5 });
    toast.success(`Rule "${rule.name}" created`);
  };

  const rulesByType = (type: DetectionRule['type']) => rules.filter(r => r.type === type);

  const stats = {
    total: rules.length,
    active: rules.filter(r => r.enabled).length,
    triggered: rules.reduce((sum, r) => sum + r.triggerCount, 0),
  };

  return (
    <MainLayout>
      <PageHeader
        title="Detection Rules"
        description="Configure rule-based, anomaly-based, and signature-based threat detection"
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Detection Rule</DialogTitle>
                <DialogDescription>Add a new security detection rule to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="e.g., SSH Brute Force Detection" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Detection Type</Label>
                    <Select value={newRule.type} onValueChange={(v) => setNewRule({ ...newRule, type: v as DetectionRule['type'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rule-based">Rule-Based</SelectItem>
                        <SelectItem value="anomaly-based">Anomaly-Based</SelectItem>
                        <SelectItem value="signature-based">Signature-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={newRule.severity} onValueChange={(v) => setNewRule({ ...newRule, severity: v as DetectionRule['severity'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={newRule.description} onChange={(e) => setNewRule({ ...newRule, description: e.target.value })} placeholder="Describe what this rule detects..." />
                </div>
                {(newRule.type === 'rule-based' || newRule.type === 'signature-based') && (
                  <div className="space-y-2">
                    <Label>Pattern / Signature</Label>
                    <Input value={newRule.pattern} onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })} placeholder="e.g., failed_login > 5 in 5min" className="font-mono text-sm" />
                  </div>
                )}
                {newRule.type === 'anomaly-based' && (
                  <div className="space-y-2">
                    <Label>Threshold (Std Deviations)</Label>
                    <Input type="number" value={newRule.threshold} onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={addRule}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Rules', value: stats.total, color: 'text-foreground' },
          { label: 'Active Rules', value: stats.active, color: 'text-success' },
          { label: 'Total Triggers', value: stats.triggered, color: 'text-warning' },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="cyber-card text-center">
              <CardContent className="pt-6">
                <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="rule-based">Rule-Based ({rulesByType('rule-based').length})</TabsTrigger>
          <TabsTrigger value="anomaly-based">Anomaly-Based ({rulesByType('anomaly-based').length})</TabsTrigger>
          <TabsTrigger value="signature-based">Signature-Based ({rulesByType('signature-based').length})</TabsTrigger>
        </TabsList>

        {['all', 'rule-based', 'anomaly-based', 'signature-based'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {(tab === 'all' ? rules : rulesByType(tab as DetectionRule['type'])).map((rule, index) => {
              const TypeIcon = typeConfig[rule.type].icon;
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn('cyber-card transition-all', !rule.enabled && 'opacity-60')}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn('p-2.5 rounded-lg', typeConfig[rule.type].bgColor)}>
                          <TypeIcon className={cn('w-5 h-5', typeConfig[rule.type].color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{rule.name}</h3>
                            <Badge variant="outline" className={severityColors[rule.severity]}>
                              {rule.severity}
                            </Badge>
                            <Badge variant="outline" className={cn(typeConfig[rule.type].bgColor, typeConfig[rule.type].color, 'border-transparent')}>
                              {typeConfig[rule.type].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            {rule.pattern && (
                              <span className="font-mono bg-muted px-2 py-0.5 rounded">{rule.pattern}</span>
                            )}
                            {rule.threshold && (
                              <span>Threshold: {rule.threshold} σ</span>
                            )}
                            <span>Triggered: {rule.triggerCount} times</span>
                            {rule.lastTriggered && (
                              <span>Last: {new Date(rule.lastTriggered).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                          <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </MainLayout>
  );
}
