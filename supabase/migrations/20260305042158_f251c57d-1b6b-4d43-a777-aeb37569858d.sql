
-- Create logs table
CREATE TABLE public.logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'dismissed')),
  affected_systems TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for logs
CREATE POLICY "Users can view their own logs" ON public.logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON public.logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for alerts
CREATE POLICY "Users can view their own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.alerts FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Seed initial logs on new user creation
CREATE OR REPLACE FUNCTION public.seed_initial_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.logs (user_id, timestamp, source, level, message, details) VALUES
    (NEW.id, now() - interval '30 minutes', 'Firewall-01', 'error', 'Blocked unauthorized access attempt from 192.168.1.100', 'Port scan detected on ports 22, 80, 443'),
    (NEW.id, now() - interval '28 minutes', 'Server-Web-01', 'warning', 'High CPU usage detected (92%)', 'Process: node.exe consuming 85% CPU'),
    (NEW.id, now() - interval '25 minutes', 'Database-01', 'info', 'Backup completed successfully', 'Full backup size: 2.3GB'),
    (NEW.id, now() - interval '22 minutes', 'Auth-Server', 'critical', 'Multiple failed login attempts detected', '15 failed attempts from IP 10.0.0.55 in last 5 minutes'),
    (NEW.id, now() - interval '20 minutes', 'Network-Switch-02', 'info', 'Link state change detected', 'Port 24 changed from up to down'),
    (NEW.id, now() - interval '18 minutes', 'IDS-Sensor-01', 'warning', 'Suspicious DNS query pattern detected', 'Potential DNS tunneling activity from 192.168.5.22'),
    (NEW.id, now() - interval '15 minutes', 'Endpoint-PC-045', 'error', 'Malware signature detected', 'Trojan.GenericKD.46584721 quarantined'),
    (NEW.id, now() - interval '12 minutes', 'VPN-Gateway', 'info', 'New VPN connection established', 'User: admin@corp from 203.0.113.50');

  INSERT INTO public.alerts (user_id, timestamp, severity, title, description, source, status, affected_systems) VALUES
    (NEW.id, now() - interval '30 minutes', 'critical', 'Brute Force Attack Detected', 'Multiple failed authentication attempts detected from external IP', 'Auth-Server', 'active', ARRAY['Auth-Server', 'VPN-Gateway']),
    (NEW.id, now() - interval '25 minutes', 'high', 'Malware Detection', 'Trojan signature identified and quarantined on endpoint', 'Endpoint-PC-045', 'investigating', ARRAY['Endpoint-PC-045']),
    (NEW.id, now() - interval '18 minutes', 'medium', 'DNS Tunneling Suspected', 'Unusual DNS query patterns may indicate data exfiltration attempt', 'IDS-Sensor-01', 'investigating', ARRAY['Workstation-22', 'DNS-Server']),
    (NEW.id, now() - interval '45 minutes', 'low', 'Port Scan Detected', 'External reconnaissance activity blocked by firewall', 'Firewall-01', 'resolved', ARRAY['Firewall-01']),
    (NEW.id, now() - interval '60 minutes', 'info', 'System Patch Available', 'Critical security update available for Windows servers', 'Patch-Manager', 'active', ARRAY['Server-Web-01', 'Server-App-02', 'Database-01']);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_seed_logs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_initial_logs();
