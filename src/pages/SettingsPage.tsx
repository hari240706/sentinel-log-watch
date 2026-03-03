import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Clock,
  Globe,
  Moon,
  Sun,
  Save,
  RefreshCw,
  User,
  Building2,
  Upload,
  Lock,
  HardDrive,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useAppStore();
  const [profile, setProfile] = useState({ displayName: '', email: '', accountType: 'individual', orgName: '' });
  
  const [settings, setSettings] = useState({
    emailAlerts: true,
    criticalOnly: false,
    dailyDigest: true,
    logRetention: '30',
    refreshInterval: '60',
    autoResolve: false,
    timezone: 'UTC',
    language: 'en',
    dataExport: 'json',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setProfile({
          displayName: user.user_metadata?.display_name || '',
          email: user.email || '',
          accountType: user.user_metadata?.account_type || 'individual',
          orgName: user.user_metadata?.organization_name || '',
        });
      }
    });
  }, []);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleProfileSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: profile.displayName, organization_name: profile.orgName },
      });
      if (error) throw error;

      await supabase.from('profiles').update({
        display_name: profile.displayName,
        organization_name: profile.orgName,
      }).eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');

      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleReset = () => {
    setSettings({
      emailAlerts: true, criticalOnly: false, dailyDigest: true,
      logRetention: '30', refreshInterval: '60', autoResolve: false,
      timezone: 'UTC', language: 'en', dataExport: 'json',
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <MainLayout>
      <PageHeader
        title="Settings"
        description="Configure your security monitoring preferences"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    User Profile
                  </CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      {profile.accountType === 'organization' ? (
                        <Building2 className="w-7 h-7 text-primary" />
                      ) : (
                        <User className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{profile.displayName || profile.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {profile.accountType === 'organization' ? 'Organization' : 'Individual'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={profile.email} disabled className="bg-muted" />
                    </div>
                  </div>

                  {profile.accountType === 'organization' && (
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input
                        value={profile.orgName}
                        onChange={(e) => setProfile({ ...profile, orgName: e.target.value })}
                      />
                    </div>
                  )}

                  <Button onClick={handleProfileSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Offline Updates */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-primary" />
                    Offline Threat Intelligence Updates
                  </CardTitle>
                  <CardDescription>
                    Import rule sets and model weights via secure media for air-gapped environments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Detection Rules</p>
                      <p className="text-xs text-muted-foreground mt-1">Last updated: Today</p>
                      <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success/30">Up to date</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Database className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Signature DB</p>
                      <p className="text-xs text-muted-foreground mt-1">v2024.01.21</p>
                      <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success/30">Current</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">AI Models</p>
                      <p className="text-xs text-muted-foreground mt-1">Anomaly Detection v3</p>
                      <Badge variant="outline" className="mt-2 bg-success/10 text-success border-success/30">Active</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Import Update Package</p>
                      <p className="text-sm text-muted-foreground">
                        Upload cryptographically signed update packages from secure media (USB with data diode)
                      </p>
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you receive alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive email notifications for security alerts' },
                  { key: 'criticalOnly', label: 'Critical Alerts Only', desc: 'Only receive notifications for critical severity threats' },
                  { key: 'dailyDigest', label: 'Daily Digest', desc: 'Receive a daily summary of all security events' },
                ].map((item, i) => (
                  <div key={item.key}>
                    {i > 0 && <Separator className="mb-6" />}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Monitoring Configuration
                </CardTitle>
                <CardDescription>Adjust log analysis and threat detection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Log Retention (days)
                    </Label>
                    <Select value={settings.logRetention} onValueChange={(v) => setSettings({ ...settings, logRetention: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['7', '14', '30', '60', '90'].map(d => (
                          <SelectItem key={d} value={d}>{d} days</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Refresh Interval
                    </Label>
                    <Select value={settings.refreshInterval} onValueChange={(v) => setSettings({ ...settings, refreshInterval: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-resolve Low Severity</Label>
                    <p className="text-sm text-muted-foreground">Automatically resolve low and info severity alerts after 24 hours</p>
                  </div>
                  <Switch
                    checked={settings.autoResolve}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoResolve: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="space-y-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    System Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        Dark Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Clock className="w-4 h-4" />Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[
                            { v: 'UTC', l: 'UTC' }, { v: 'America/New_York', l: 'Eastern Time' },
                            { v: 'Europe/London', l: 'London' }, { v: 'Asia/Kolkata', l: 'India (IST)' },
                            { v: 'Asia/Tokyo', l: 'Tokyo' },
                          ].map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Globe className="w-4 h-4" />Language</Label>
                      <Select value={settings.language} onValueChange={(v) => setSettings({ ...settings, language: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिन्दी</SelectItem>
                          <SelectItem value="ta">தமிழ்</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Database className="w-4 h-4" />Data Export Format</Label>
                    <Select value={settings.dataExport} onValueChange={(v) => setSettings({ ...settings, dataExport: v })}>
                      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions that affect your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Clear All Logs</p>
                      <p className="text-sm text-muted-foreground">Permanently delete all stored log entries</p>
                    </div>
                    <Button variant="destructive" size="sm">Clear Logs</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reset All Settings</p>
                      <p className="text-sm text-muted-foreground">Restore all settings to factory defaults</p>
                    </div>
                    <Button variant="destructive" size="sm">Reset All</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
