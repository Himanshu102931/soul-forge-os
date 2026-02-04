<<<<<<< HEAD
import React from 'react';
import { AlertCircle, RefreshCw, Home, Code, Bug, Database, Wifi, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
=======
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
>>>>>>> cf46c6e (Initial commit: project files)
}

interface State {
  hasError: boolean;
  error: Error | null;
<<<<<<< HEAD
  errorInfo: React.ErrorInfo | null;
  errorType: 'unknown' | 'network' | 'permission' | 'validation' | 'auth' | 'storage' | 'chunking' | 'render' | 'data';
  retryCount: number;
  lastRetryTime: number | null;
}

/**
 * Analyze error and determine its type for better error messaging
 */
function analyzeError(error: Error | null): State['errorType'] {
  if (!error) return 'unknown';
  
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';
  
  // Check for chunk loading errors (common in code-split apps)
  if (message.includes('chunk') || message.includes('loading chunk') || message.includes('dynamically imported module')) {
    return 'chunking';
  }
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout') || message.includes('failed to fetch')) {
    return 'network';
  }
  
  // Permission errors
  if (message.includes('permission') || message.includes('denied') || message.includes('forbidden')) {
    return 'permission';
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation';
  }
  
  // Authentication errors
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
    return 'auth';
  }
  
  // Storage errors
  if (message.includes('storage') || message.includes('quota') || message.includes('localstorage')) {
    return 'storage';
  }
  
  // Data errors (null reference, undefined, etc)
  if (message.includes('null') || message.includes('undefined') || message.includes('cannot read') || message.includes('is not a function')) {
    return 'data';
  }
  
  // Render errors
  if (stack.includes('render') || message.includes('render') || message.includes('react')) {
    return 'render';
  }
  
  return 'unknown';
}

/**
 * Get user-friendly error message based on error type
 */
function getErrorMessage(type: State['errorType']): {
  title: string;
  message: string;
  recovery: string;
  icon: typeof AlertCircle;
  canRetry: boolean;
  autoRetry: boolean;
} {
  const messages = {
    unknown: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Your data is safe, and you can recover by trying again.',
      recovery: 'This type of error is usually temporary. Try refreshing the page or clearing your browser cache.',
      icon: AlertCircle,
      canRetry: true,
      autoRetry: false,
    },
    network: {
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      recovery: 'Make sure you\'re connected to the internet and try again. If the problem persists, the server may be temporarily unavailable.',
      icon: Wifi,
      canRetry: true,
      autoRetry: true,
    },
    permission: {
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource.',
      recovery: 'Log out and log back in, or contact support if you believe this is an error.',
      icon: Shield,
      canRetry: false,
      autoRetry: false,
    },
    validation: {
      title: 'Invalid Data',
      message: 'The data you provided is invalid or incomplete.',
      recovery: 'Review your input and try again. Make sure all required fields are filled correctly.',
      icon: AlertTriangle,
      canRetry: true,
      autoRetry: false,
    },
    auth: {
      title: 'Authentication Error',
      message: 'Your session has expired or authentication failed.',
      recovery: 'Please log in again to continue using the app.',
      icon: Shield,
      canRetry: false,
      autoRetry: false,
    },
    storage: {
      title: 'Storage Error',
      message: 'Unable to save your data. Your storage might be full.',
      recovery: 'Clear some space and try again, or clear your browser cache. You can export your data first to prevent any loss.',
      icon: Database,
      canRetry: true,
      autoRetry: false,
    },
    chunking: {
      title: 'Loading Error',
      message: 'Failed to load part of the application. This usually happens after an update.',
      recovery: 'The app has been updated. Refresh the page to get the latest version.',
      icon: RefreshCw,
      canRetry: true,
      autoRetry: true,
    },
    render: {
      title: 'Display Error',
      message: 'A component failed to render properly.',
      recovery: 'This is usually caused by corrupted data or a temporary glitch. Try refreshing or clearing your browser cache.',
      icon: Bug,
      canRetry: true,
      autoRetry: false,
    },
    data: {
      title: 'Data Error',
      message: 'The app encountered invalid or missing data.',
      recovery: 'This might be caused by corrupted local storage. Try clearing your browser data or use the app in incognito mode.',
      icon: Database,
      canRetry: true,
      autoRetry: false,
    },
  };
  
  return messages[type];
}

export class ErrorBoundary extends React.Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: 0,
      lastRetryTime: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = analyzeError(error);
    return { hasError: true, errorType };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error Info:', errorInfo);
    
    const errorType = analyzeError(error);
    
    this.setState({
      error,
      errorInfo,
      errorType,
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logError(error, errorInfo, errorType);
    }
    
    // Auto-retry for certain error types
    const errorDetails = getErrorMessage(errorType);
    if (errorDetails.autoRetry && this.state.retryCount < 3) {
      this.scheduleAutoRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  /**
   * Log error to external service (placeholder for future integration)
   */
  private logError(error: Error, errorInfo: React.ErrorInfo, errorType: string) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error reported:', errorReport);
    
    // Future: Send to Sentry, LogRocket, or custom backend
    // Example: sentryClient.captureException(error, { extra: errorReport });
  }

  /**
   * Schedule automatic retry with exponential backoff
   */
  private scheduleAutoRetry() {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Max 10 seconds
    
    this.retryTimeout = setTimeout(() => {
      console.log(`Auto-retry attempt ${this.state.retryCount + 1}/3`);
      this.handleRetry();
    }, delay);
  }

  handleRetry = () => {
    const now = Date.now();
    const timeSinceLastRetry = this.state.lastRetryTime ? now - this.state.lastRetryTime : Infinity;
    
    // Prevent retry spam (min 1 second between retries)
    if (timeSinceLastRetry < 1000) {
      return;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: this.state.retryCount + 1,
      lastRetryTime: now,
    });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: 0,
      lastRetryTime: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    // Use the public path from Vite config (/soul-forge-os/)
    const publicPath = import.meta.env.BASE_URL || '/soul-forge-os/';
    window.location.href = publicPath;
  };

  handleClearCache = () => {
    // Clear localStorage (with confirmation)
    if (confirm('This will clear all local data. Export your data first if needed. Continue?')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      const errorDetails = getErrorMessage(this.state.errorType);
      const ErrorIcon = errorDetails.icon;
      const showRetry = errorDetails.canRetry && this.state.retryCount < 5;
      
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            {/* Auto-retry notification */}
            {errorDetails.autoRetry && this.state.retryCount > 0 && this.state.retryCount < 3 && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Retrying automatically... (Attempt {this.state.retryCount}/3)
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error Card */}
            <div className="bg-card border-2 border-destructive/30 rounded-xl p-6 shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <ErrorIcon className="w-8 h-8 text-destructive" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center mb-2">{errorDetails.title}</h1>
              <p className="text-muted-foreground text-sm text-center mb-4">
                {errorDetails.message}
              </p>

              {/* Recovery Tips */}
              <div className="bg-secondary/50 border border-border rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-foreground mb-2">💡 How to recover:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {errorDetails.recovery}
                </p>
              </div>

              {/* Error Details */}
              {this.state.error && (
                <details className="bg-muted/50 rounded-lg p-3 mb-4">
                  <summary className="cursor-pointer text-xs font-semibold text-destructive/70 flex items-center gap-1 mb-2">
                    <Code className="w-3 h-3" />
                    Technical Details
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Error:</p>
                      <pre className="text-xs text-muted-foreground overflow-auto max-h-32 font-mono break-words whitespace-pre-wrap bg-background/50 p-2 rounded">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <details className="pt-2 border-t border-border">
                        <summary className="cursor-pointer text-xs text-muted-foreground">Stack Trace</summary>
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-24 font-mono break-words whitespace-pre-wrap bg-background/50 p-2 rounded mt-2">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                    {this.state.errorInfo && (
                      <details className="pt-2 border-t border-border">
                        <summary className="cursor-pointer text-xs text-muted-foreground">Component Stack</summary>
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-24 font-mono break-words whitespace-pre-wrap bg-background/50 p-2 rounded mt-2">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </details>
              )}

              {/* Primary Actions */}
              <div className="flex gap-2 flex-col sm:flex-row">
                {showRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                {!showRetry && (
                  <Button 
                    onClick={this.handleReload}
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={this.handleHome}
                  className="flex-1 gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Retry counter warning */}
              {this.state.retryCount >= 3 && (
                <Alert className="mt-4" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Multiple retry attempts failed. Try reloading the page or clearing cache below.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Additional Help */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-center">
                Still having issues?
              </p>
              
              <div className="flex flex-col gap-2">
                {this.state.errorType === 'chunking' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleReload}
                    className="w-full gap-2 text-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Hard Refresh (Ctrl+Shift+R)
                  </Button>
                )}
                
                {['storage', 'data', 'render'].includes(this.state.errorType) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleClearCache}
                    className="w-full gap-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Database className="w-3 h-3" />
                    Clear Cache & Data
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://github.com/yourusername/soul-forge-os/issues', '_blank')}
                  className="w-full gap-2 text-xs"
                >
                  <Bug className="w-3 h-3" />
                  Report Issue
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                💾 Your data is safe. Errors are logged to help improve the app.
                {this.state.retryCount > 0 && (
                  <><br /><span className="text-amber-600">Retry count: {this.state.retryCount}</span></>
                )}
              </p>
=======
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-2">Error:</h2>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </div>
              {this.state.errorInfo && (
                <div>
                  <h2 className="font-semibold mb-2">Stack Trace:</h2>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-96">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Reload Page
              </button>
>>>>>>> cf46c6e (Initial commit: project files)
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
