import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
<<<<<<< HEAD
import { queryClient } from "@/lib/query-config";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
=======
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
>>>>>>> cf46c6e (Initial commit: project files)
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LogicalDateProvider } from "@/contexts/LogicalDateContext";
import { XPFloaterContainer } from "@/components/XPFloater";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";
<<<<<<< HEAD
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
const Debug = lazy(() => import("./pages/Debug"));
=======
import { useMissedHabitsDetection } from "@/hooks/useMissedHabitsDetection";
import { createQueryClient, setupCachePersistence } from "@/lib/query-config";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Chronicles from "./pages/Chronicles";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

// Create QueryClient with optimized config
const queryClient = createQueryClient();

// Setup cache persistence for core features
setupCachePersistence(queryClient);
>>>>>>> cf46c6e (Initial commit: project files)

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
<<<<<<< HEAD
=======

>>>>>>> cf46c6e (Initial commit: project files)
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Sidebar />
      <main id="main-content" className="md:ml-64 p-3 sm:p-4 md:p-8 pb-24 md:pb-8">
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
=======
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Auto-detect missed habits on app load and date changes
  useMissedHabitsDetection();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Life OS</h1>
            </div>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar isMobile onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {children}
      </main>
      
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
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
=======
        <Route path="/auth" element={<Auth />} />
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
          path="/achievements"
          element={
            <ProtectedRoute>
              <AppLayout><Achievements /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
=======
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
        <Route
          path="/debug"
          element={
            <ProtectedRoute>
              <AppLayout><Debug /></AppLayout>
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
=======
        <Route path="*" element={<NotFound />} />
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
            <BrowserRouter basename={import.meta.env.BASE_URL}>
=======
            <BrowserRouter>
>>>>>>> cf46c6e (Initial commit: project files)
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </LogicalDateProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
