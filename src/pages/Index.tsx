import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  FileText,
  AlertTriangle,
  Cpu,
  Server,
  Lock,
  Wifi,
  WifiOff,
  Upload,
  BarChart3,
  Fingerprint,
  ArrowRight,
  CheckCircle,
  XCircle,
  Minus,
  Zap,
  Database,
  Eye,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Upload,
    title: 'Multi-Format Log Ingestion',
    description: 'Import logs from Syslog, JSON, CSV, Windows Event Logs, and firewall/IDS outputs with automatic parsing and normalization.',
  },
  {
    icon: Fingerprint,
    title: 'Hybrid Threat Detection',
    description: 'Rule-based (Sigma/YARA), anomaly-based (statistical outliers), and signature-based detection working in concert.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Fine-tuned AI models for semantic log analysis — detects unusual patterns, privilege escalation, and data exfiltration attempts.',
  },
  {
    icon: AlertTriangle,
    title: 'Real-Time Alerting',
    description: 'Instant threat notifications with severity classification, affected system mapping, and automated solution suggestions.',
  },
  {
    icon: BarChart3,
    title: 'SOC-Ready Reports',
    description: 'Generate executive summaries, severity distribution charts, and exportable reports for compliance and incident response.',
  },
  {
    icon: WifiOff,
    title: 'Fully Offline Operation',
    description: 'Zero cloud dependency — all processing, storage, and analysis happens locally within your isolated network perimeter.',
  },
];

const architectureLayers = [
  {
    label: 'Log Sources',
    items: ['System Logs', 'Network Devices', 'Firewall / IDS', 'Application Logs', 'USB / Offline Imports'],
    color: 'bg-info/10 border-info/30 text-info',
  },
  {
    label: 'Ingestion & Preprocessing',
    items: ['Log Validation & Filtering', 'Parsing (Regex / JSON / CSV)', 'Normalization Engine'],
    color: 'bg-primary/10 border-primary/30 text-primary',
  },
  {
    label: 'Threat Detection Engine',
    items: ['Signature Matching', 'Behavioral Analysis', 'Statistical Outlier Detection', 'AI Semantic Analysis'],
    color: 'bg-destructive/10 border-destructive/30 text-destructive',
  },
  {
    label: 'Storage & Output',
    items: ['Structured Event Repository', 'Alert Database', 'Historical Archive', 'Report Generation'],
    color: 'bg-success/10 border-success/30 text-success',
  },
];

const comparisonData = [
  { capability: 'Works without Internet', cloud: false, onPrem: true, proposed: true },
  { capability: 'Portable deployment', cloud: false, onPrem: false, proposed: true },
  { capability: 'Requires dedicated servers', cloud: true, onPrem: true, proposed: false },
  { capability: 'Automated anomaly detection', cloud: 'partial', onPrem: 'limited', proposed: true },
  { capability: 'Offline intelligence update', cloud: false, onPrem: 'manual', proposed: true },
  { capability: 'Analyst workload', cloud: 'High', onPrem: 'High', proposed: 'Reduced' },
];

const socWorkflow = {
  before: [
    'Manual log reading',
    'Missed low-frequency attacks',
    'Delayed response',
    'No offline capability',
  ],
  after: [
    'Automated alert prioritization',
    'Behavior-based detection',
    'Faster incident response',
    'Full offline operation',
  ],
};

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) return <CheckCircle className="w-5 h-5 text-success mx-auto" />;
  if (value === false) return <XCircle className="w-5 h-5 text-destructive mx-auto" />;
  return <span className="text-sm text-warning font-medium">{value}</span>;
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-info/5" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-32">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-foreground tracking-tight">SENTINEL</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm bg-primary/5 border-primary/20 text-primary">
              <WifiOff className="w-3.5 h-3.5 mr-2" />
              Designed for Air-Gapped Networks
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
              Portable Offline Log Analysis &{' '}
              <span className="text-primary">Cyber Threat Monitor</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A self-contained security monitoring tool for isolated networks — military, nuclear, forensic, and critical infrastructure environments where cloud connectivity is impossible.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">The Problem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Critical networks cannot use cloud-based SIEM solutions, yet disconnected systems still face malware, insider threats, and attack vectors via removable media.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Wifi, title: 'Cloud SIEM Unusable', desc: 'Splunk Cloud, Azure Sentinel require internet — impossible in air-gapped environments.' },
              { icon: Server, title: 'On-Prem Too Heavy', desc: 'Enterprise SIEMs demand heavy servers, costly licenses, and expert setup.' },
              { icon: Lock, title: 'Gap in Tooling', desc: 'No lightweight, standalone tool provides hybrid rule + ML detection entirely offline.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="cyber-card h-full text-center">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything a SOC team needs for continuous monitoring in disconnected environments.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="cyber-card h-full group hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">System Architecture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Modular pipeline from log ingestion to threat detection — fully self-contained.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {architectureLayers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="cyber-card h-full">
                  <CardContent className="pt-6">
                    <Badge variant="outline" className={cn('mb-4', layer.color)}>{layer.label}</Badge>
                    <ul className="space-y-2">
                      {layer.items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">How We Compare</h2>
          </motion.div>
          <Card className="cyber-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-heading font-bold text-foreground">Capability</th>
                    <th className="text-center p-4 font-heading font-bold text-muted-foreground">Cloud SIEM</th>
                    <th className="text-center p-4 font-heading font-bold text-muted-foreground">On-Prem SIEM</th>
                    <th className="text-center p-4 font-heading font-bold text-primary">SENTINEL</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="p-4 text-foreground font-medium">{row.capability}</td>
                      <td className="p-4 text-center"><ComparisonCell value={row.cloud} /></td>
                      <td className="p-4 text-center"><ComparisonCell value={row.onPrem} /></td>
                      <td className="p-4 text-center bg-primary/5"><ComparisonCell value={row.proposed} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* SOC Workflow */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">SOC Workflow Improvement</h2>
            <p className="text-muted-foreground">Enables continuous monitoring where centralized SOC is impossible.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="cyber-card h-full border-destructive/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <h3 className="font-heading font-bold text-foreground">Before SENTINEL</h3>
                  </div>
                  <ul className="space-y-3">
                    {socWorkflow.before.map(item => (
                      <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Minus className="w-4 h-4 text-destructive shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="cyber-card h-full border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="font-heading font-bold text-foreground">After SENTINEL</h3>
                  </div>
                  <ul className="space-y-3">
                    {socWorkflow.after.map(item => (
                      <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Target Customers */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Built For</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: 'Military & Defense' },
              { icon: Zap, label: 'Nuclear Facilities' },
              { icon: Database, label: 'Forensics Labs' },
              { icon: Eye, label: 'Intelligence Agencies' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="cyber-card text-center h-full">
                  <CardContent className="pt-6 pb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Secure your isolated network today
            </h2>
            <p className="text-muted-foreground mb-8">
              Deploy SENTINEL in minutes — no internet, no servers, no compromises.
            </p>
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-foreground text-sm">SENTINEL</span>
            <span className="text-xs text-muted-foreground">Offline Threat Monitor</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI4Dev '26 Hackathon — PSG College of Technology
          </p>
        </div>
      </footer>
    </div>
  );
}
