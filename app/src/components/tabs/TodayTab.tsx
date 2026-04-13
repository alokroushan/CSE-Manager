import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LiveDot, MapPinIcon, BookOpenIcon, FlagIcon, CalendarIcon, EditIcon, PlusIcon } from '@/components/icons';
import { getSubjectColor, getSubjectFullName } from '@/data/timetable';
import type { Task, Exam, Note, Holiday, DaySchedule } from '@/types';
import { cn } from '@/lib/utils';
import { 
  todayStr, 
  dayName, 
  fmtShort, 
  daysUntil, 
  getCurrentSlot, 
  getNextSlot,
  getTimeUntilSlot,
  getRangeStartMins,
  formatTimeRange,
} from '@/lib/utils';

interface TodayTabProps {
  dark: boolean;
  timetable: DaySchedule;
  holidays: Holiday[];
  isHoliday: { isHoliday: boolean; name: string | null };
  tasks: Task[];
  exams: Exam[];
  notes: Note[];
  onTabChange: (tab: string) => void;
  onOpenModal: (type: string, data?: any, idx?: number | null, day?: string) => void;
  onToggleClassAttendance: (day: string, slotIndex: number) => void;
}

export function TodayTab({ 
  dark, 
  timetable, 
  holidays,
  isHoliday,
  tasks, 
  exams, 
  notes,
  onTabChange, 
  onOpenModal,
  onToggleClassAttendance,
}: TodayTabProps) {
  const dn = dayName();
  const todaySlots = (timetable[dn] || []).filter(s => s.subject && s.type !== 'free');
  const todayLabs = todaySlots.filter(s => s.type === 'lab');
  const curSlot = getCurrentSlot(timetable[dn] || []);
  const nxtSlot = getNextSlot(timetable[dn] || []);
  
  const pendingTasks = tasks.filter(t => !t.done && (!t.date || t.date === todayStr()));
  const todayNotes = notes.filter(n => n.date === todayStr() || !n.date);
  const upExams = [...exams]
    .filter(e => e.date >= todayStr())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const nextHoliday = useMemo(() => {
    return holidays.filter(h => h.date > todayStr())[0] || null;
  }, [holidays]);

  // Get status info for header
  const getStatusInfo = () => {
    if (isHoliday.isHoliday) {
      return {
        title: isHoliday.name,
        subtitle: 'No classes today - Enjoy your day off!',
        type: 'holiday' as const,
        color: '#F59E0B'
      };
    }
    if (curSlot) {
      if (curSlot.type === 'break') {
        return {
          title: 'Lunch Break',
          subtitle: formatTimeRange(curSlot.time),
          type: 'break' as const,
          color: '#F59E0B'
        };
      }
      return {
        title: curSlot.subject,
        subtitle: `${formatTimeRange(curSlot.time)} · ${curSlot.type === 'lab' ? 'Lab' : curSlot.type === 'tutorial' ? 'Tutorial' : 'Lecture'}`,
        type: 'live' as const,
        color: getSubjectColor(curSlot.subject)
      };
    }
    if (nxtSlot) {
      return {
        title: 'Up Next',
        subtitle: `${nxtSlot.subject} · Starts in ${getTimeUntilSlot(nxtSlot)}`,
        type: 'next' as const,
        color: getSubjectColor(nxtSlot.subject)
      };
    }
    return {
      title: 'No More Classes',
      subtitle: 'Enjoy your free time!',
      type: 'free' as const,
      color: '#64748B'
    };
  };

  const status = getStatusInfo();

  // Holiday view
  if (isHoliday.isHoliday) {
    return (
      <div className="space-y-4 pb-24">
        {/* Holiday Card */}
        <Card className={cn(
          "overflow-hidden border-2 border-amber-500/40 bg-amber-500/5"
        )}>
          <div className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={40} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-amber-600">
              {isHoliday.name}
            </h2>
            <p className="text-muted-foreground mt-2">
              No classes today - Enjoy your day off!
            </p>
          </div>
        </Card>

        {/* Next Holiday */}
        {nextHoliday && (
          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Next Holiday
              </h3>
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/10 text-amber-600 px-3 py-2 rounded-xl text-center min-w-[60px]">
                  <div className="text-2xl font-bold">{daysUntil(nextHoliday.date)}</div>
                  <div className="text-xs uppercase">Days</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{nextHoliday.name}</h4>
                  <p className="text-sm text-muted-foreground">{fmtShort(nextHoliday.date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Tasks */}
        {pendingTasks.length > 0 && (
          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Pending Tasks
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => onTabChange('tasks')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <Checkbox 
                      checked={task.done}
                      onCheckedChange={() => {}}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      {task.subject && (
                        <p className="text-xs text-muted-foreground">{task.subject}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Notes */}
        <Card className={cn(
          dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Notes
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => onOpenModal('note', { date: todayStr() })}
              >
                <PlusIcon size={12} className="mr-1" />
                Add
              </Button>
            </div>
            {todayNotes.length > 0 ? (
              <div className="space-y-2">
                {todayNotes.slice(0, 2).map((note) => (
                  <div key={note.id} className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">{note.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No notes for today
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal day view
  return (
    <div className="space-y-4 pb-24">
      {/* Status Card */}
      <Card className={cn(
        "overflow-hidden border-2 transition-all duration-300",
        dark ? "bg-slate-900/50" : "bg-white"
      )} style={{ borderColor: status.color + '40' }}>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {status.type === 'live' && <LiveDot size={8} />}
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  status.type === 'live' ? "text-green-500" : "text-muted-foreground"
                )}>
                  {status.type === 'live' ? 'Live Now' : status.type === 'break' ? 'Break Time' : status.type === 'next' ? 'Coming Up' : 'All Done'}
                </span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: status.color }}>
                {status.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{status.subtitle}</p>
            </div>
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: status.color }}
            >
              {status.title?.charAt(0) || '?'}
            </div>
          </div>
        </div>
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: status.color }}
        />
      </Card>

      {/* Quick Stats */}
      <div className="w-full overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2 pb-2 min-w-max">
          <Badge variant="secondary" className="px-3 py-1.5 text-xs">
            <BookOpenIcon size={12} className="mr-1" />
            {todaySlots.filter(s => s.type !== 'break').length} Classes
          </Badge>
          <Badge variant="secondary" className="px-3 py-1.5 text-xs">
            <FlagIcon size={12} className="mr-1" />
            {todayLabs.length} Labs
          </Badge>
          <Badge variant="secondary" className="px-3 py-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1" />
            {pendingTasks.length} Tasks
          </Badge>
        </div>
      </div>

      {/* Today's Schedule with Attendance */}
      <Card className={cn(
        "transition-all duration-300",
        dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Today's Schedule
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => onTabChange('table')}
            >
              Edit
            </Button>
          </div>
          <div className="space-y-2">
            {todaySlots.map((slot, idx) => {
              const isCurrent = curSlot === slot;
              const isPast = (() => {
                const slotMins = getRangeStartMins(slot.time);
                const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
                return slotMins < nowMins && !isCurrent;
              })();
              
              return (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    isCurrent ? "bg-primary/10 border border-primary/30" : 
                    isPast ? "opacity-50" : "bg-muted/30",
                    "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onOpenModal('class', slot, idx, dn)}
                >
                  {/* Attendance Checkbox */}
                  {slot.type !== 'break' && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={slot.attended === true}
                        onCheckedChange={() => {
                          onToggleClassAttendance(dn, idx);
                        }}
                        className={cn(
                          slot.attended === true ? "border-green-500 bg-green-500" :
                          slot.attended === false ? "border-red-500 bg-red-500" : ""
                        )}
                      />
                    </div>
                  )}
                  
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: slot.type === 'break' ? '#F59E0B' : getSubjectColor(slot.subject) }}
                  >
                    {slot.subject ? slot.subject.charAt(0) : 'B'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{slot.type === 'break' ? 'Lunch Break' : getSubjectFullName(slot.subject)}</p>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                          <LiveDot size={6} />
                          Live
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatTimeRange(slot.time)}</span>
                      {slot.room && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPinIcon size={10} />
                            {slot.room}
                          </span>
                        </>
                      )}
                    </div>
                    {slot.note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Note: {slot.note}
                      </p>
                    )}
                  </div>
                  
                  <EditIcon size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card className={cn(
          dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Tasks
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => onTabChange('tasks')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {pendingTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.priority === 'high' ? '#EF4444' : '#64748B' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.subject && (
                      <p className="text-xs text-muted-foreground">{task.subject}</p>
                    )}
                  </div>
                </div>
              ))}
              {pendingTasks.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{pendingTasks.length - 3} more tasks
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Notes */}
      <Card className={cn(
        dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Notes
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => onOpenModal('note', { date: todayStr() })}
            >
              <PlusIcon size={12} className="mr-1" />
              Add
            </Button>
          </div>
          {todayNotes.length > 0 ? (
            <div className="space-y-2">
              {todayNotes.slice(0, 2).map((note) => (
                <div key={note.id} className="p-2 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No notes for today
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Exam */}
      {upExams.length > 0 && (
        <Card className={cn(
          dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Upcoming Exam
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => onTabChange('exams')}
              >
                View All
              </Button>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-center min-w-[60px]">
                <div className="text-2xl font-bold">{daysUntil(upExams[0].date)}</div>
                <div className="text-xs uppercase">Days</div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold">{upExams[0].subject}</h4>
                <p className="text-sm text-muted-foreground">{fmtShort(upExams[0].date)}</p>
                {upExams[0].syllabus && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {upExams[0].syllabus}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Holiday */}
      {nextHoliday && (
        <Card className={cn(
          dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
        )}>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Next Holiday
            </h3>
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/10 text-amber-600 px-3 py-2 rounded-xl text-center min-w-[60px]">
                <div className="text-2xl font-bold">{daysUntil(nextHoliday.date)}</div>
                <div className="text-xs uppercase">Days</div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{nextHoliday.name}</h4>
                <p className="text-sm text-muted-foreground">{fmtShort(nextHoliday.date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
