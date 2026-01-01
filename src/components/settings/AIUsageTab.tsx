/**
 * AI Usage & Cost Tracking Tab
 * Displays AI usage statistics, rate limits, and estimated costs
 * Uses comprehensive useAIRateLimit hook for tracking
 */

import { useState, useEffect } from 'react';
import { useAIRateLimit } from '@/lib/ai-rate-limit';
import { useAICostTracking } from '@/hooks/useRateLimit'; // Keep for backwards compatibility
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sparkles, TrendingUp, AlertTriangle, RotateCcw, Settings, DollarSign, Clock, Calendar, BarChart3, Zap } from 'lucide-react';

export function AIUsageTab() {
  // New comprehensive rate limiting hook
  const {
    config,
    stats,
    updateConfig,
    getUsagePercentages,
    shouldShowWarning,
  } = useAIRateLimit();
  
  // Legacy cost tracking (keep for now)
  const { totalCost, costByProvider, costByFeature, resetCostTracking } = useAICostTracking();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editedConfig, setEditedConfig] = useState(config);
  const [monthlyProjection, setMonthlyProjection] = useState(0);

  // Update edited config when config changes
  useEffect(() => {
    setEditedConfig(config);
  }, [config]);

  // Calculate monthly projection
  useEffect(() => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    
    if (dayOfMonth > 0) {
      // Use new stats for projection
      const dailyCost = stats.dailyCost || totalCost;
      const projectedMonthly = (dailyCost / dayOfMonth) * daysInMonth;
      setMonthlyProjection(projectedMonthly);
    }
  }, [stats.dailyCost, totalCost]);

  const percentages = getUsagePercentages();
  const showWarning = shouldShowWarning();
  
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= config.warningThreshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const handleSaveConfig = () => {
    updateConfig(editedConfig);
    setIsEditingConfig(false);
  };
  
  const handleCancelEdit = () => {
    setEditedConfig(config);
    setIsEditingConfig(false);
  };

  const providers = Object.entries(costByProvider || stats.providerBreakdown).sort((a, b) => b[1] - a[1]);
  const features = Object.entries(costByFeature || stats.featureBreakdown).sort((a, b) => b[1] - a[1]);

  const handleResetConfirm = () => {
    resetCostTracking();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Warning Alert */}
      {showWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-amber-900 dark:text-amber-200">Usage Alert</p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                You're approaching your AI usage limits. Consider reducing requests or increasing limits below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Configuration Panel */}
      {isEditingConfig && (
        <Card className="p-4 border-primary/50">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Rate Limit Configuration
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxRequestsPerHour" className="text-xs">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Max Requests Per Hour
                </Label>
                <Input
                  id="maxRequestsPerHour"
                  type="number"
                  min="1"
                  max="100"
                  value={editedConfig.maxRequestsPerHour}
                  onChange={(e) => setEditedConfig({
                    ...editedConfig,
                    maxRequestsPerHour: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxRequestsPerDay" className="text-xs">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Max Requests Per Day
                </Label>
                <Input
                  id="maxRequestsPerDay"
                  type="number"
                  min="1"
                  max="1000"
                  value={editedConfig.maxRequestsPerDay}
                  onChange={(e) => setEditedConfig({
                    ...editedConfig,
                    maxRequestsPerDay: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxDailyCost" className="text-xs">
                  <DollarSign className="h-3 w-3 inline mr-1" />
                  Max Daily Cost (USD)
                </Label>
                <Input
                  id="maxDailyCost"
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={editedConfig.maxDailyCost}
                  onChange={(e) => setEditedConfig({
                    ...editedConfig,
                    maxDailyCost: parseFloat(e.target.value) || 0.1
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warningThreshold" className="text-xs">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Warning Threshold (%)
                </Label>
                <Input
                  id="warningThreshold"
                  type="number"
                  min="1"
                  max="100"
                  value={editedConfig.warningThreshold}
                  onChange={(e) => setEditedConfig({
                    ...editedConfig,
                    warningThreshold: parseInt(e.target.value) || 50
                  })}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveConfig}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Header with Config Button */}
      {!isEditingConfig && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Rate Limits & Usage</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingConfig(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      )}
      
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hourly Usage */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Hourly Usage</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{stats.hourly}</span>
              <span className="text-sm text-muted-foreground">
                / {config.maxRequestsPerHour}
              </span>
            </div>
            <Progress 
              value={percentages.hourly} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {percentages.hourly.toFixed(0)}% used
            </p>
          </div>
        </Card>
        
        {/* Daily Usage */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Daily Usage</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{stats.daily}</span>
              <span className="text-sm text-muted-foreground">
                / {config.maxRequestsPerDay}
              </span>
            </div>
            <Progress 
              value={percentages.daily} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {percentages.daily.toFixed(0)}% used
            </p>
          </div>
        </Card>
        
        {/* Daily Cost */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Daily Cost</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                ${(stats.dailyCost || totalCost).toFixed(4)}
              </span>
              <span className="text-sm text-muted-foreground">
                / ${config.maxDailyCost.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={percentages.cost} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {percentages.cost.toFixed(0)}% used
            </p>
          </div>
        </Card>
      </div>
      
      {/* Monthly Projection */}
      {monthlyProjection > 0 && (
        <Card className="p-4 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                <span>Monthly Projection</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                ${monthlyProjection.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current usage
            </p>
          </div>
        </Card>
      )}
      
      {/* Provider Breakdown */}
      {providers.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Provider Breakdown
          </h4>
          <div className="space-y-2">
            {providers.map(([provider, count]) => {
              const percentage = stats.daily > 0 ? (Number(count) / stats.daily) * 100 : 0;
              return (
                <div key={provider} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{provider}</span>
                    <span className="text-muted-foreground">
                      {count} requests ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Feature Breakdown */}
      {features.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Feature Usage
          </h4>
          <div className="space-y-2">
            {features.map(([feature, count]) => {
              const percentage = stats.daily > 0 ? (Number(count) / stats.daily) * 100 : 0;
              return (
                <div key={feature} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">
                      {String(feature).replace(/[-_]/g, ' ')}
                    </span>
                    <span className="text-muted-foreground">
                      {count} requests ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {stats.daily === 0 && providers.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No AI usage yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start using AI features like roasts, suggestions, or insights
          </p>
        </div>
      )}

      {/* Budget Alert */}
      {(stats.dailyCost || totalCost) > 1.0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-red-900 dark:text-red-200">Budget Alert</p>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                You've used ${(stats.dailyCost || totalCost).toFixed(4)} today. 
                Monthly projection: ${monthlyProjection.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Tracking
        </Button>
      </div>
      
      {/* Info Footer */}
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          <strong>How it works:</strong> Rate limits reset hourly/daily. Costs are estimated
          based on token usage and may not reflect exact billing. For internal use only.
        </p>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Cost Tracking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all recorded AI usage and cost data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reset All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
