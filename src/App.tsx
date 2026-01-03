import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-config";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LogicalDateProvider } from "@/contexts/LogicalDateContext";
import { XPFloaterContainer } from "@/components/XPFloater";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance (code splitting)
const Index = lazy(() => import("./pages/Index"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Chronicles = lazy(() => import("./pages/Chronicles"));
const Settings = lazy(() => import("./pages/Settings"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64 p-3 sm:p-4 md:p-8 pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              }
            >
              {children}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <XPFloaterContainer />
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route 
          path="/auth" 
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              }
            >
              <Auth />
            </Suspense>
          } 
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout><Index /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout><Tasks /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout><Analytics /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <AppLayout><Achievements /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chronicles"
          element={
            <ProtectedRoute>
              <AppLayout><Chronicles /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout><Settings /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="*" 
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              }
            >
              <NotFound />
            </Suspense>
          } 
        />
      </Routes>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LogicalDateProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </LogicalDateProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
