import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface ThreatComparisonData {
  severityDistribution: { name: string; value: number; color: string }[];
  weeklyComparison: { day: string; current: number; previous: number }[];
  categoryBreakdown: { category: string; count: number; fullMark: number }[];
}

interface ThreatComparisonChartProps {
  data: ThreatComparisonData;
  className?: string;
}

const SEVERITY_COLORS = {
  critical: 'hsl(0, 72%, 55%)',
  high: 'hsl(25, 95%, 53%)',
  medium: 'hsl(45, 93%, 47%)',
  low: 'hsl(199, 89%, 48%)',
  info: 'hsl(215, 16%, 47%)',
};

export function ThreatComparisonChart({ data, className }: ThreatComparisonChartProps) {
  const totalThreats = data.severityDistribution.reduce((sum, item) => sum + item.value, 0);
  const currentWeekTotal = data.weeklyComparison.reduce((sum, item) => sum + item.current, 0);
  const previousWeekTotal = data.weeklyComparison.reduce((sum, item) => sum + item.previous, 0);
  const weeklyChange = previousWeekTotal > 0 
    ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal * 100).toFixed(1)
    : 0;
  const isIncrease = currentWeekTotal > previousWeekTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}
    >
      {/* Severity Distribution Pie Chart */}
      <Card className="cyber-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-primary" />
            Threat Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.severityDistribution.map((entry, index) => (
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
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-foreground">{totalThreats}</p>
            <p className="text-sm text-muted-foreground">Total Active Threats</p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Comparison Bar Chart */}
      <Card className="cyber-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Weekly Comparison
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                isIncrease 
                  ? 'bg-destructive/10 text-destructive border-destructive/30' 
                  : 'bg-success/10 text-success border-success/30'
              )}
            >
              {isIncrease ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isIncrease ? '+' : ''}{weeklyChange}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyComparison} barGap={2}>
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
                <Bar dataKey="previous" fill="hsl(var(--muted-foreground))" name="Last Week" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" fill="hsl(199, 89%, 48%)" name="This Week" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(199, 89%, 48%)' }} />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Radar Chart */}
      <Card className="cyber-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Threat Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.categoryBreakdown}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 'auto']} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                />
                <Radar
                  name="Threats"
                  dataKey="count"
                  stroke="hsl(199, 89%, 48%)"
                  fill="hsl(199, 89%, 48%)"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { SEVERITY_COLORS };
