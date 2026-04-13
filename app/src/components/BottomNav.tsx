import { cn } from '@/lib/utils';
import { 
  ClockIcon, 
  CalendarIcon, 
  CalendarDaysIcon,
  DocumentIcon, 
  CheckIcon, 
  DotsIcon 
} from '@/components/icons';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dark: boolean;
}

const TABS = [
  { id: 'today', label: 'Today', icon: ClockIcon },
  { id: 'table', label: 'Classes', icon: CalendarIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { id: 'exams', label: 'Exams', icon: DocumentIcon },
  { id: 'tasks', label: 'Tasks', icon: CheckIcon },
  { id: 'more', label: 'More', icon: DotsIcon },
];

export function BottomNav({ activeTab, onTabChange, dark }: BottomNavProps) {
  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe backdrop-blur-xl border-t transition-colors duration-300",
        dark 
          ? "bg-slate-900/95 border-slate-800" 
          : "bg-white/95 border-slate-200"
      )}
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-[52px]",
                "active:scale-95",
                isActive 
                  ? dark 
                    ? "bg-primary/20 text-primary" 
                    : "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                size={18} 
                className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )} 
              />
              <span className={cn(
                "text-[9px] font-semibold transition-all duration-200",
                isActive && "scale-105"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
