import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/appStore';

/**
 * Detects the current system/device info from the browser.
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent;

  // Detect OS
  let deviceOs = 'Unknown OS';
  if (ua.includes('Windows NT 10')) deviceOs = 'Windows 10/11';
  else if (ua.includes('Windows NT')) deviceOs = 'Windows';
  else if (ua.includes('Mac OS X')) deviceOs = 'macOS';
  else if (ua.includes('Linux')) deviceOs = 'Linux';
  else if (ua.includes('Android')) deviceOs = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) deviceOs = 'iOS';
  else if (ua.includes('CrOS')) deviceOs = 'Chrome OS';

  // Detect browser
  let browser = 'Unknown';
  let browserVersion = '';
  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? '';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? '';
  }

  return {
    device_os: deviceOs,
    browser,
    browser_version: browserVersion,
    platform: navigator.platform || 'Unknown',
    screen_resolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    user_agent: ua,
  };
}

/**
 * Returns a short device identifier for log sources, e.g. "Chrome-Windows 10/11"
 */
export function getDeviceSource() {
  const info = getDeviceInfo();
  return `${info.browser}-${info.device_os}`;
}

/**
 * Hook that registers a session on login and captures real browser events
 * (JS errors, unhandled rejections, navigation, performance) as logs in the database.
 */
export function useSystemDetector() {
  const sessionIdRef = useRef<string | null>(null);
  const { addLog } = useAppStore();
  const deviceSource = useRef(getDeviceSource());

  // Register session
  const registerSession = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const info = getDeviceInfo();

    // Deactivate previous sessions from this user on this device
    // (best-effort, no error handling needed)
    await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    const { data } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        ...info,
      })
      .select('id')
      .single();

    if (data) {
      sessionIdRef.current = data.id;
    }

    // Log the session start
    await addLog({
      timestamp: new Date().toISOString(),
      source: deviceSource.current,
      level: 'info',
      message: `Session started on ${info.device_os} (${info.browser} ${info.browser_version})`,
      details: `Screen: ${info.screen_resolution} | Timezone: ${info.timezone} | Language: ${info.language} | Platform: ${info.platform}`,
    });
  }, [addLog]);

  useEffect(() => {
    registerSession();

    // --- Capture JS Errors ---
    const handleError = (event: ErrorEvent) => {
      addLog({
        timestamp: new Date().toISOString(),
        source: deviceSource.current,
        level: 'error',
        message: `JS Error: ${event.message}`,
        details: `File: ${event.filename}:${event.lineno}:${event.colno}`,
      });
    };

    // --- Capture Unhandled Promise Rejections ---
    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog({
        timestamp: new Date().toISOString(),
        source: deviceSource.current,
        level: 'error',
        message: `Unhandled Promise Rejection: ${String(event.reason)}`,
        details: 'Captured by system detector',
      });
    };

    // --- Capture Page Visibility Changes ---
    const handleVisibility = () => {
      const state = document.visibilityState;
      addLog({
        timestamp: new Date().toISOString(),
        source: deviceSource.current,
        level: 'info',
        message: state === 'hidden' ? 'User navigated away from tab' : 'User returned to tab',
        details: `Document visibility: ${state}`,
      });
    };

    // --- Capture Online/Offline Events ---
    const handleOnline = () => {
      addLog({
        timestamp: new Date().toISOString(),
        source: deviceSource.current,
        level: 'info',
        message: 'Network connection restored',
        details: 'Browser online event detected',
      });
    };

    const handleOffline = () => {
      addLog({
        timestamp: new Date().toISOString(),
        source: deviceSource.current,
        level: 'warning',
        message: 'Network connection lost',
        details: 'Browser offline event detected',
      });
    };

    // --- Capture Performance Issues ---
    let perfTimer: ReturnType<typeof setInterval> | null = null;
    if (typeof PerformanceObserver !== 'undefined') {
      // Check for long tasks (performance bottlenecks)
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              addLog({
                timestamp: new Date().toISOString(),
                source: deviceSource.current,
                level: 'warning',
                message: `Long task detected (${Math.round(entry.duration)}ms)`,
                details: `Task type: ${entry.entryType} | Start: ${Math.round(entry.startTime)}ms`,
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch {
        // longtask not supported in all browsers
      }
    }

    // --- Check memory usage periodically (Chrome only) ---
    const nav = navigator as any;
    if (nav.deviceMemory || (performance as any).memory) {
      perfTimer = setInterval(() => {
        const mem = (performance as any).memory;
        if (mem && mem.usedJSHeapSize / mem.jsHeapSizeLimit > 0.85) {
          addLog({
            timestamp: new Date().toISOString(),
            source: deviceSource.current,
            level: 'warning',
            message: `High memory usage detected (${Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100)}%)`,
            details: `Used: ${Math.round(mem.usedJSHeapSize / 1048576)}MB / ${Math.round(mem.jsHeapSizeLimit / 1048576)}MB`,
          });
        }
      }, 30000);
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update session last_active periodically
    const activityTimer = setInterval(async () => {
      if (sessionIdRef.current) {
        await supabase
          .from('sessions')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', sessionIdRef.current);
      }
    }, 60000);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(activityTimer);
      if (perfTimer) clearInterval(perfTimer);

      // Mark session inactive on unmount
      if (sessionIdRef.current) {
        supabase
          .from('sessions')
          .update({ is_active: false })
          .eq('id', sessionIdRef.current);
      }
    };
  }, [addLog, registerSession]);

  return { sessionId: sessionIdRef.current };
}
