import { NavLink } from '@/components/NavLink';
import { Home, ListTodo, BarChart3, Trophy, Scroll, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/chronicles', icon: Scroll, label: 'Chronicles' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside 
      className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Life OS</h1>
            <p className="text-xs text-muted-foreground">Personal Operating System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors min-h-11"
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10"
            aria-label={`Navigate to ${label}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Level up your life
        </p>
      </div>
    </aside>
  );
}
