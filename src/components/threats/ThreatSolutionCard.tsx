import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle, AlertTriangle, Shield, Terminal, Lock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ThreatSolution {
  title: string;
  description: string;
  steps: string[];
  priority: 'immediate' | 'high' | 'medium' | 'low';
  automatable: boolean;
  estimatedTime: string;
}

interface ThreatSolutionCardProps {
  threatType: string;
  severity: string;
  onApplySolution?: () => void;
  className?: string;
}

// Solutions database based on threat types
const solutionsDatabase: Record<string, ThreatSolution> = {
  'brute_force': {
    title: 'Block & Rate Limit',
    description: 'Implement IP blocking and rate limiting to prevent brute force attacks.',
    steps: [
      'Block the source IP address immediately',
      'Enable account lockout after 5 failed attempts',
      'Implement CAPTCHA for login attempts',
      'Enable multi-factor authentication (MFA)',
      'Review and strengthen password policies'
    ],
    priority: 'immediate',
    automatable: true,
    estimatedTime: '5-10 min'
  },
  'malware': {
    title: 'Isolate & Remediate',
    description: 'Quarantine affected systems and remove malware traces.',
    steps: [
      'Disconnect affected endpoint from network',
      'Run full system antivirus scan',
      'Check for persistence mechanisms',
      'Restore from clean backup if needed',
      'Update all security definitions',
      'Conduct forensic analysis'
    ],
    priority: 'immediate',
    automatable: false,
    estimatedTime: '30-60 min'
  },
  'dns_tunneling': {
    title: 'DNS Traffic Analysis',
    description: 'Analyze and block suspicious DNS traffic patterns.',
    steps: [
      'Block suspicious DNS queries at firewall',
      'Implement DNS filtering/monitoring',
      'Analyze payload content for data exfiltration',
      'Review DNS logs for affected period',
      'Update DNS security policies'
    ],
    priority: 'high',
    automatable: true,
    estimatedTime: '15-30 min'
  },
  'port_scan': {
    title: 'Perimeter Hardening',
    description: 'Strengthen network perimeter and close unnecessary ports.',
    steps: [
      'Block source IP at perimeter firewall',
      'Review and close unnecessary open ports',
      'Enable port scan detection rules',
      'Implement network segmentation',
      'Update IDS/IPS signatures'
    ],
    priority: 'medium',
    automatable: true,
    estimatedTime: '10-20 min'
  },
  'patch_available': {
    title: 'Patch Management',
    description: 'Deploy critical security updates to affected systems.',
    steps: [
      'Test patch in staging environment',
      'Schedule maintenance window',
      'Deploy patches to production systems',
      'Verify patch installation',
      'Update vulnerability scanner database'
    ],
    priority: 'high',
    automatable: true,
    estimatedTime: '1-2 hours'
  },
  'default': {
    title: 'General Response',
    description: 'Follow standard incident response procedures.',
    steps: [
      'Assess the scope of the threat',
      'Contain affected systems if necessary',
      'Collect evidence and logs',
      'Implement appropriate countermeasures',
      'Document the incident and response'
    ],
    priority: 'medium',
    automatable: false,
    estimatedTime: 'Varies'
  }
};

const priorityConfig = {
  immediate: { label: 'Immediate', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  high: { label: 'High Priority', className: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  medium: { label: 'Medium', className: 'bg-warning/10 text-yellow-600 border-warning/30' },
  low: { label: 'Low', className: 'bg-info/10 text-info border-info/30' },
};

function getThreatSolution(threatTitle: string): ThreatSolution {
  const title = threatTitle.toLowerCase();
  if (title.includes('brute force')) return solutionsDatabase.brute_force;
  if (title.includes('malware')) return solutionsDatabase.malware;
  if (title.includes('dns')) return solutionsDatabase.dns_tunneling;
  if (title.includes('port scan')) return solutionsDatabase.port_scan;
  if (title.includes('patch')) return solutionsDatabase.patch_available;
  return solutionsDatabase.default;
}

export function ThreatSolutionCard({ threatType, severity, onApplySolution, className }: ThreatSolutionCardProps) {
  const solution = getThreatSolution(threatType);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('cyber-card border-l-4 border-l-success', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <Lightbulb className="w-4 h-4 text-success" />
            </div>
            Suggested Solution: {solution.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{solution.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={priorityConfig[solution.priority].className}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {priorityConfig[solution.priority].label}
            </Badge>
            {solution.automatable && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <RefreshCw className="w-3 h-3 mr-1" />
                Automatable
              </Badge>
            )}
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
              ⏱ {solution.estimatedTime}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Remediation Steps:
            </p>
            <ol className="space-y-1.5 ml-4">
              {solution.steps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  {step}
                </motion.li>
              ))}
            </ol>
          </div>

          {onApplySolution && solution.automatable && (
            <Button 
              className="w-full bg-success hover:bg-success/90"
              onClick={onApplySolution}
            >
              <Shield className="w-4 h-4 mr-2" />
              Apply Automated Fix
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
