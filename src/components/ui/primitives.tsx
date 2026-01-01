/**
 * Reusable UI Primitives
 * Common patterns extracted for consistency and maintainability
 */

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// Stat Card - Display a metric with icon, label, and value
// ============================================================================

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function StatCard({ icon: Icon, label, value, subtitle, variant = 'default', className }: StatCardProps) {
  const variantStyles = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-amber-600',
    destructive: 'text-red-600',
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" />
          <span>{label}</span>
        </div>
        <div className={cn('text-xl sm:text-2xl font-bold', variantStyles[variant])}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Progress Card - Display progress with label and percentage
// ============================================================================

interface ProgressCardProps {
  label: string;
  value: number;
  max: number;
  icon?: LucideIcon;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function ProgressCard({ 
  label, 
  value, 
  max, 
  icon: Icon, 
  showPercentage = true,
  className 
}: ProgressCardProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{label}</span>
          </div>
          {showPercentage && (
            <span className="text-xs text-muted-foreground">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">/ {max}</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </Card>
  );
}

// ============================================================================
// Section Header - Consistent section headers with optional action
// ============================================================================

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ icon: Icon, title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6" />}
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================================================
// Info Banner - Display contextual information or warnings
// ============================================================================

interface InfoBannerProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function InfoBanner({ icon: Icon, title, message, variant = 'info', className }: InfoBannerProps) {
  const variantStyles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50 text-green-900 dark:text-green-200',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200',
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200',
  };

  const iconColor = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  };

  return (
    <div className={cn('border rounded-lg p-4', variantStyles[variant], className)}>
      <div className="flex gap-3">
        {Icon && <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor[variant])} />}
        <div>
          {title && <p className="font-medium text-sm mb-1">{title}</p>}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Empty State - Consistent empty states
// ============================================================================

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================================
// Stat Group - Grid of stat cards
// ============================================================================

interface StatGroupProps {
  stats: Array<Omit<StatCardProps, 'className'>>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGroup({ stats, columns = 3, className }: StatGroupProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// ============================================================================
// Badge List - Display a list of badges
// ============================================================================

interface BadgeListProps {
  items: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  className?: string;
}

export function BadgeList({ items, className }: BadgeListProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item, index) => (
        <Badge key={index} variant={item.variant || 'default'}>
          {item.label}
        </Badge>
      ))}
    </div>
  );
}
