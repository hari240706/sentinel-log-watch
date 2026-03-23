import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  device_os: string | null;
  browser: string | null;
  browser_version: string | null;
  platform: string | null;
  screen_resolution: string | null;
  language: string | null;
  timezone: string | null;
  is_active: boolean;
  started_at: string;
  last_active_at: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .order('last_active_at', { ascending: false })
      .limit(50);
    if (data) setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatTime = (ts: string) => new Date(ts).toLocaleString();

  const timeSince = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getDeviceIcon = (os: string | null) => {
    if (!os) return Monitor;
    const lower = os.toLowerCase();
    if (lower.includes('android') || lower.includes('ios')) return Smartphone;
    return Monitor;
  };

  return (
    <MainLayout>
      <PageHeader
        title="Active Sessions"
        description="View all devices and systems where your account has been used"
        actions={
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map(i => (
            <Card key={i} className="cyber-card animate-pulse h-40" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="No sessions found"
          description="Session data will appear after you log in"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session, idx) => {
            const DeviceIcon = getDeviceIcon(session.device_os);
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn(
                  'cyber-card transition-all',
                  session.is_active && 'border-primary/40'
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          session.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          <DeviceIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {session.browser ?? 'Unknown'} {session.browser_version ? `v${session.browser_version.split('.')[0]}` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.device_os ?? 'Unknown OS'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={session.is_active ? 'default' : 'secondary'} className="gap-1">
                        {session.is_active ? (
                          <><CheckCircle2 className="w-3 h-3" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Inactive</>
                        )}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>{session.screen_resolution ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="truncate">{session.timezone ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Started {timeSince(session.started_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Active {timeSince(session.last_active_at)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      <span>{session.platform ?? ''} · {session.language ?? ''} · Started {formatTime(session.started_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
