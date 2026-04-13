import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SunIcon, MoonIcon } from '@/components/icons';
import { useTime } from '@/hooks/useTime';
import type { GroupType } from '@/types';
import { cn, fmtShort, todayStr } from '@/lib/utils';

interface HeaderProps {
  dark: boolean;
  group: GroupType;
  onToggleTheme: () => void;
}

export function Header({ dark, group, onToggleTheme }: HeaderProps) {
  const { timeStr, dayName } = useTime(1000);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 px-4 py-3 backdrop-blur-xl border-b transition-colors duration-300",
        dark 
          ? "bg-slate-900/95 border-slate-800" 
          : "bg-white/95 border-slate-200"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold tracking-tight text-primary">CSE</span>
            <span className="text-sm font-medium text-muted-foreground">2nd Sem</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {group}
            </Badge>
          </div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            UIET HOSHIARPUR · 2025-26
          </div>
        </div>

        {/* Time & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xl font-bold tracking-tight leading-none">
              {timeStr}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {dayName}, {fmtShort(todayStr())}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl transition-all duration-300",
              dark 
                ? "border-slate-700 bg-slate-800 hover:bg-slate-700" 
                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            )}
            onClick={onToggleTheme}
          >
            {dark ? (
              <SunIcon size={18} className="text-amber-400" />
            ) : (
              <MoonIcon size={18} className="text-slate-600" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
