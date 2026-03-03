import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle, AlertTriangle, Shield, Terminal, Lock, RefreshCw, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export interface ThreatSolution {
  title: string;
  description: string;
  steps: string[];
  priority: 'immediate' | 'high' | 'medium' | 'low';
  automatable: boolean;
  estimatedTime: string;
}

interface AIAnalysis {
  analysis: string;
  rootCause: string;
  solution: ThreatSolution;
  mitreTactic: string;
  riskScore: number;
  additionalRecommendations: string[];
}

interface ThreatSolutionCardProps {
  threatType: string;
  severity: string;
  description?: string;
  source?: string;
  affectedSystems?: string[];
  onApplySolution?: () => void;
  className?: string;
}

const priorityConfig = {
  immediate: { label: 'Immediate', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  high: { label: 'High Priority', className: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  medium: { label: 'Medium', className: 'bg-warning/10 text-yellow-600 border-warning/30' },
  low: { label: 'Low', className: 'bg-info/10 text-info border-info/30' },
};

// Fallback solutions
const fallbackSolutions: Record<string, ThreatSolution> = {
  'brute_force': { title: 'Block & Rate Limit', description: 'Implement IP blocking and rate limiting.', steps: ['Block source IP', 'Enable account lockout after 5 failed attempts', 'Implement CAPTCHA', 'Enable MFA', 'Review password policies'], priority: 'immediate', automatable: true, estimatedTime: '5-10 min' },
  'malware': { title: 'Isolate & Remediate', description: 'Quarantine affected systems and remove malware.', steps: ['Disconnect affected endpoint', 'Run full antivirus scan', 'Check for persistence', 'Restore from clean backup', 'Update security definitions'], priority: 'immediate', automatable: false, estimatedTime: '30-60 min' },
  'default': { title: 'General Response', description: 'Follow standard incident response procedures.', steps: ['Assess the scope', 'Contain affected systems', 'Collect evidence and logs', 'Implement countermeasures', 'Document the incident'], priority: 'medium', automatable: false, estimatedTime: 'Varies' },
};

function getFallbackSolution(title: string): ThreatSolution {
  const t = title.toLowerCase();
  if (t.includes('brute force')) return fallbackSolutions.brute_force;
  if (t.includes('malware')) return fallbackSolutions.malware;
  return fallbackSolutions.default;
}

export function ThreatSolutionCard({ threatType, severity, description, source, affectedSystems, onApplySolution, className }: ThreatSolutionCardProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const fallback = getFallbackSolution(threatType);
  const solution = aiAnalysis?.solution || fallback;

  const analyzeWithAI = async () => {
    setLoading(true);
    setUseAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-threat', {
        body: {
          threatTitle: threatType,
          threatDescription: description || '',
          severity,
          source: source || 'Unknown',
          affectedSystems: affectedSystems || [],
        },
      });
      if (error) throw error;
      if (data && !data.error) {
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('cyber-card border-l-4 border-l-success', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Lightbulb className="w-4 h-4 text-success" />
              </div>
              {aiAnalysis ? 'AI Analysis' : 'Suggested Solution'}: {solution.title}
            </span>
            {!aiAnalysis && !loading && (
              <Button variant="outline" size="sm" onClick={analyzeWithAI}>
                <Brain className="w-4 h-4 mr-1" />
                AI Analyze
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-primary font-medium">AI is analyzing the threat...</p>
            </div>
          )}

          {aiAnalysis && (
            <>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> AI Threat Analysis
                </p>
                <p className="text-sm text-muted-foreground">{aiAnalysis.analysis}</p>
                <p className="text-sm text-muted-foreground"><strong>Root Cause:</strong> {aiAnalysis.rootCause}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-muted text-muted-foreground">MITRE: {aiAnalysis.mitreTactic}</Badge>
                  <Badge variant="outline" className={cn(
                    aiAnalysis.riskScore >= 8 ? 'bg-destructive/10 text-destructive border-destructive/30' :
                    aiAnalysis.riskScore >= 5 ? 'bg-warning/10 text-yellow-600 border-warning/30' :
                    'bg-info/10 text-info border-info/30'
                  )}>Risk: {aiAnalysis.riskScore}/10</Badge>
                </div>
              </div>
            </>
          )}

          <p className="text-sm text-muted-foreground">{solution.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={priorityConfig[solution.priority]?.className || priorityConfig.medium.className}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {priorityConfig[solution.priority]?.label || 'Medium'}
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

          {aiAnalysis?.additionalRecommendations && aiAnalysis.additionalRecommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Additional Recommendations:
              </p>
              <ul className="space-y-1 ml-4">
                {aiAnalysis.additionalRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
