import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  File,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore, LogEntry } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImportResult {
  total: number;
  imported: number;
  errors: number;
  logs: LogEntry[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function parseSyslog(text: string): ImportResult {
  const lines = text.trim().split('\n').filter(l => l.trim());
  const logs: LogEntry[] = [];
  let errors = 0;

  for (const line of lines) {
    try {
      const level = line.toLowerCase().includes('error') ? 'error'
        : line.toLowerCase().includes('warn') ? 'warning'
        : line.toLowerCase().includes('crit') ? 'critical'
        : 'info';
      logs.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        source: 'Syslog-Import',
        level,
        message: line.substring(0, 200),
        details: line.length > 200 ? line : undefined,
      });
    } catch {
      errors++;
    }
  }

  return { total: lines.length, imported: logs.length, errors, logs };
}

function parseJSON(text: string): ImportResult {
  let errors = 0;
  const logs: LogEntry[] = [];

  try {
    const data = JSON.parse(text);
    const entries = Array.isArray(data) ? data : [data];

    for (const entry of entries) {
      try {
        logs.push({
          id: generateId(),
          timestamp: entry.timestamp || new Date().toISOString(),
          source: entry.source || entry.hostname || 'JSON-Import',
          level: (['info', 'warning', 'error', 'critical'].includes(entry.level?.toLowerCase()) ? entry.level.toLowerCase() : 'info') as LogEntry['level'],
          message: entry.message || entry.msg || JSON.stringify(entry).substring(0, 200),
          details: entry.details || entry.data ? JSON.stringify(entry.details || entry.data) : undefined,
        });
      } catch {
        errors++;
      }
    }
    return { total: entries.length, imported: logs.length, errors, logs };
  } catch {
    return { total: 0, imported: 0, errors: 1, logs: [] };
  }
}

function parseCSV(text: string): ImportResult {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { total: 0, imported: 0, errors: 1, logs: [] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const logs: LogEntry[] = [];
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      logs.push({
        id: generateId(),
        timestamp: row.timestamp || row.date || new Date().toISOString(),
        source: row.source || row.host || 'CSV-Import',
        level: (['info', 'warning', 'error', 'critical'].includes(row.level?.toLowerCase()) ? row.level.toLowerCase() : 'info') as LogEntry['level'],
        message: row.message || row.msg || values.join(' '),
        details: row.details,
      });
    } catch {
      errors++;
    }
  }

  return { total: lines.length - 1, imported: logs.length, errors, logs };
}

export default function LogImportPage() {
  const { addLog } = useAppStore();
  const [pasteContent, setPasteContent] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const processImport = useCallback((text: string, format: 'json' | 'csv' | 'syslog') => {
    setImporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 20, 90));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      let result: ImportResult;
      if (format === 'json') result = parseJSON(text);
      else if (format === 'csv') result = parseCSV(text);
      else result = parseSyslog(text);

      setImportResult(result);

      // Add logs to store
      result.logs.forEach(log => addLog(log));

      setImporting(false);
      toast.success(`Imported ${result.imported} logs successfully`, {
        description: result.errors > 0 ? `${result.errors} entries had errors` : undefined,
      });
    }, 1200);
  }, [addLog]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const format = file.name.endsWith('.json') ? 'json'
          : file.name.endsWith('.csv') ? 'csv'
          : 'syslog';
        processImport(text, format);
      };
      reader.readAsText(file);
    });
  }, [processImport]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const format = file.name.endsWith('.json') ? 'json'
          : file.name.endsWith('.csv') ? 'csv'
          : 'syslog';
        processImport(text, format);
      };
      reader.readAsText(file);
    });
  }, [processImport]);

  const handlePasteImport = (format: 'json' | 'csv' | 'syslog') => {
    if (!pasteContent.trim()) {
      toast.error('Please paste log content first');
      return;
    }
    processImport(pasteContent, format);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Log Import"
        description="Import logs from multiple sources — CSV, JSON, and Syslog formats"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {[
          { icon: FileJson, label: 'JSON', desc: 'Structured JSON log entries', color: 'text-info' },
          { icon: FileSpreadsheet, label: 'CSV', desc: 'Comma-separated log files', color: 'text-success' },
          { icon: FileText, label: 'Syslog', desc: 'Standard syslog format', color: 'text-warning' },
        ].map((fmt) => (
          <motion.div key={fmt.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="cyber-card text-center">
              <CardContent className="pt-6">
                <fmt.icon className={cn('w-10 h-10 mx-auto mb-3', fmt.color)} />
                <h3 className="font-heading font-bold text-foreground">{fmt.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{fmt.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="paste">Paste Content</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Log Files
                </CardTitle>
                <CardDescription>
                  Drag and drop or select log files (.json, .csv, .log, .txt)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
                    dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className={cn('w-12 h-12 mx-auto mb-4', dragActive ? 'text-primary' : 'text-muted-foreground')} />
                  <p className="text-lg font-medium text-foreground mb-1">
                    {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".json,.csv,.log,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <File className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground flex-1">{file.name}</span>
                        <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="paste">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Paste Log Content
                </CardTitle>
                <CardDescription>
                  Paste raw log data and select the format to parse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={'Paste log content here...\n\nExample JSON:\n[{"timestamp":"2024-01-01","source":"Firewall","level":"error","message":"Blocked access"}]\n\nExample CSV:\ntimestamp,source,level,message\n2024-01-01,Firewall,error,Blocked access'}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex gap-3">
                  <Button onClick={() => handlePasteImport('json')} disabled={importing}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Parse as JSON
                  </Button>
                  <Button variant="outline" onClick={() => handlePasteImport('csv')} disabled={importing}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Parse as CSV
                  </Button>
                  <Button variant="outline" onClick={() => handlePasteImport('syslog')} disabled={importing}>
                    <FileText className="w-4 h-4 mr-2" />
                    Parse as Syslog
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Import Progress */}
      <AnimatePresence>
        {importing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card className="cyber-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="animate-spin">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Processing logs...</p>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Results */}
      <AnimatePresence>
        {importResult && !importing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{importResult.total}</p>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <p className="text-2xl font-bold text-success">{importResult.imported}</p>
                    <p className="text-sm text-muted-foreground">Imported</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-destructive/10">
                    <p className="text-2xl font-bold text-destructive">{importResult.errors}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" asChild>
                    <a href="/logs">View Imported Logs</a>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setImportResult(null); setSelectedFiles([]); setPasteContent(''); }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
