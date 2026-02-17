import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingPage } from "@/components/shared/LoadingSpinner";
import Index from "./pages/Index";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const LogsPage = lazy(() => import("./pages/LogsPage"));
const LogImportPage = lazy(() => import("./pages/LogImportPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const DetectionRulesPage = lazy(() => import("./pages/DetectionRulesPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/import" element={<LogImportPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/detection" element={<DetectionRulesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
