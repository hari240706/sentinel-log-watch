import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Upload,
  Fingerprint,
  BarChart3,
  LogOut,
  User,
  Building2,
  Monitor,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/logs', label: 'Log Analysis', icon: FileText },
  { path: '/import', label: 'Log Import', icon: Upload },
  { path: '/alerts', label: 'Threat Alerts', icon: AlertTriangle, badge: true },
  { path: '/detection', label: 'Detection Rules', icon: Fingerprint },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/sessions', label: 'Sessions', icon: Monitor },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, alerts } = useAppStore();
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; accountType: string } | null>(null);

  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'investigating').length;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserInfo({
          name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          accountType: user.user_metadata?.account_type || 'individual',
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 80 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-glow">
            <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <span className="font-heading font-bold text-sidebar-foreground text-sm">SENTINEL</span>
              <span className="text-xs text-sidebar-foreground/60">Offline Monitor</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* User Info */}
      {userInfo && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
              {userInfo.accountType === 'organization' ? (
                <Building2 className="w-4 h-4 text-sidebar-primary" />
              ) : (
                <User className="w-4 h-4 text-sidebar-primary" />
              )}
            </div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userInfo.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{userInfo.accountType === 'organization' ? 'Organization' : 'Individual'}</p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'nav-link',
                isActive && 'nav-link-active'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && activeAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeAlerts}
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {sidebarOpen && <span className="ml-3">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="ml-3">Logout</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          {sidebarOpen && <span className="ml-3">Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
