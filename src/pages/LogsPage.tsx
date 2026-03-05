import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAppStore, LogEntry } from '@/stores/appStore';
import { useDataLoader } from '@/hooks/useDataLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const levelIcons = {
  critical: XCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const levelColors = {
  critical: 'text-destructive bg-destructive/10',
  error: 'text-orange-600 bg-orange-500/10',
  warning: 'text-yellow-600 bg-warning/10',
  info: 'text-info bg-info/10',
};

export default function LogsPage() {
  const { logs, fetchLogs } = useAppStore();
  useDataLoader();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sources = useMemo(() => {
    const uniqueSources = [...new Set(logs.map(log => log.source))];
    return uniqueSources.sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        log =>
          log.message.toLowerCase().includes(term) ||
          log.source.toLowerCase().includes(term) ||
          log.details?.toLowerCase().includes(term)
      );
    }

    if (levelFilter !== 'all') {
      result = result.filter(log => log.level === levelFilter);
    }

    if (sourceFilter !== 'all') {
      result = result.filter(log => log.source === sourceFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [logs, searchTerm, levelFilter, sourceFilter, sortOrder]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <MainLayout>
      <PageHeader
        title="Log Analysis"
        description="Browse and analyze system logs from all monitored sources"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {sources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="cyber-card overflow-hidden">
          <CardContent className="p-0">
            {filteredLogs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No logs found"
                description="Try adjusting your filters or search terms"
                className="py-16"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[180px]">
                        <button
                          onClick={toggleSort}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Timestamp
                          {sortOrder === 'desc' ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="w-[100px]">Level</TableHead>
                      <TableHead className="w-[150px]">Source</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const Icon = levelIcons[log.level];
                      const isExpanded = expandedRow === log.id;

                      return (
                        <>
                          <TableRow
                            key={log.id}
                            className={cn(
                              'table-row-hover',
                              isExpanded && 'bg-muted/30'
                            )}
                            onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                          >
                            <TableCell className="font-mono text-sm">
                              {formatTimestamp(log.timestamp)}
                            </TableCell>
                            <TableCell>
                              <div className={cn(
                                'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                                levelColors[log.level]
                              )}>
                                <Icon className="w-3.5 h-3.5" />
                                {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{log.source}</TableCell>
                            <TableCell className="max-w-[400px] truncate">{log.message}</TableCell>
                            <TableCell>
                              {log.details && (
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 text-muted-foreground transition-transform',
                                    isExpanded && 'rotate-180'
                                  )}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                          {isExpanded && log.details && (
                            <TableRow key={`${log.id}-details`}>
                              <TableCell colSpan={5} className="bg-muted/20 py-4">
                                <div className="pl-4 border-l-2 border-primary/50">
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Details</p>
                                  <p className="text-sm text-foreground">{log.details}</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results count */}
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </MainLayout>
  );
}
