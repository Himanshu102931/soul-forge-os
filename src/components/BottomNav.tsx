import { NavLink } from '@/components/NavLink';
import { Home, ListTodo, BarChart3, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/achievements', icon: Trophy, label: 'Awards' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border md:hidden shadow-lg safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-all rounded-lg hover:bg-secondary/50 active:scale-95 min-h-[60px] min-w-[60px] justify-center"
            activeClassName="text-primary bg-primary/10"
            aria-label={`Navigate to ${label}`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] leading-tight font-medium text-center">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
