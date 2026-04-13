import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeftIcon, ChevronRightIcon, BookOpenIcon, CheckIcon, StickyNoteIcon, FlagIcon } from '@/components/icons';
import { getSubjectColor, getSubjectFullName, DAYS_ARR } from '@/data/timetable';
import type { DaySchedule, Holiday, Task, Note, DailySummary } from '@/types';
import { cn, pad, formatTimeRange } from '@/lib/utils';

interface CalendarTabProps {
  dark: boolean;
  timetable: DaySchedule;
  holidays: Holiday[];
  tasks: Task[];
  notes: Note[];
  dailySummaries: DailySummary[];
  onOpenModal: (type: string, data?: any, idx?: number | null, day?: string) => void;
}

export function CalendarTab({ 
  dark, 
  timetable, 
  holidays, 
  tasks, 
  notes, 
  dailySummaries,
  onOpenModal
}: CalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  // Get date string for a day
  const getDateStr = (day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

  // Get day name for a date
  const getDayName = (day: number) => {
    const date = new Date(year, month, day);
    return DAYS_ARR[date.getDay()];
  };

  // Check if date is holiday
  const isHoliday = (day: number) => {
    const dateStr = getDateStr(day);
    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return { isHoliday: true, name: dayOfWeek === 0 ? 'Sunday' : 'Saturday' };
    const holiday = holidays.find(h => h.date === dateStr);
    return { isHoliday: !!holiday, name: holiday?.name };
  };

  // Get classes for a day
  const getDayClasses = (day: number) => {
    const dayName = getDayName(day);
    return timetable[dayName] || [];
  };

  // Get tasks for a day
  const getDayTasks = (day: number) => {
    const dateStr = getDateStr(day);
    return tasks.filter(t => t.date === dateStr);
  };

  // Get notes for a day
  const getDayNotes = (day: number) => {
    const dateStr = getDateStr(day);
    return notes.filter(n => n.date === dateStr);
  };

  // Get summary for a day
  const getDaySummary = (day: number) => {
    const dateStr = getDateStr(day);
    return dailySummaries.find(s => s.date === dateStr);
  };

  // Navigate months
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Open day detail
  const openDayDetail = (day: number) => {
    setSelectedDate(getDateStr(day));
    setShowDayDetail(true);
  };

  // Selected day data
  const selectedDayData = selectedDate ? {
    date: selectedDate,
    dayName: DAYS_ARR[new Date(selectedDate).getDay()],
    classes: timetable[DAYS_ARR[new Date(selectedDate).getDay()]] || [],
    tasks: tasks.filter(t => t.date === selectedDate),
    notes: notes.filter(n => n.date === selectedDate),
    summary: dailySummaries.find(s => s.date === selectedDate),
    holiday: holidays.find(h => h.date === selectedDate),
    isWeekend: new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6
  } : null;

  return (
    <div className="space-y-4 pb-24">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeftIcon size={20} />
        </Button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRightIcon size={20} />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className={cn(
        dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
      )}>
        <CardContent className="p-3">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dateStr = getDateStr(day);
              const holiday = isHoliday(day);
              const dayClasses = getDayClasses(day).filter(c => c.type !== 'free');
              const dayTasks = getDayTasks(day);
              const dayNotes = getDayNotes(day);
              const summary = getDaySummary(day);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={day}
                  onClick={() => openDayDetail(day)}
                  className={cn(
                    "aspect-square p-1 rounded-lg border transition-all duration-200 text-left relative",
                    holiday.isHoliday 
                      ? "bg-amber-500/10 border-amber-500/30" 
                      : dark 
                        ? "bg-slate-800/50 border-slate-700 hover:border-slate-600" 
                        : "bg-slate-50 border-slate-200 hover:border-slate-300",
                    isToday && "ring-2 ring-primary"
                  )}
                >
                  <span className={cn(
                    "text-sm font-semibold",
                    holiday.isHoliday && "text-amber-600"
                  )}>
                    {day}
                  </span>

                  {/* Indicators */}
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                    {dayClasses.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                    {dayTasks.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                    {dayNotes.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                    {summary && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    )}
                  </div>

                  {holiday.isHoliday && (
                    <span className="absolute top-1 right-1 text-[8px] text-amber-600 font-medium">
                      H
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Classes</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-muted-foreground">Summary</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Holiday</span>
        </div>
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={showDayDetail} onOpenChange={setShowDayDetail}>
        <DialogContent className={cn(
          "max-w-md max-h-[80vh] overflow-y-auto",
          dark ? "bg-slate-900 border-slate-800" : "bg-white"
        )}>
          <DialogHeader>
            <DialogTitle>
              {selectedDayData && (
                <div className="flex items-center gap-2">
                  <span>{new Date(selectedDayData.date).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}</span>
                  {(selectedDayData.holiday || selectedDayData.isWeekend) && (
                    <Badge variant="default" className="bg-amber-500">
                      {selectedDayData.holiday?.name || (selectedDayData.isWeekend ? 'Weekend' : '')}
                    </Badge>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedDayData && (
            <div className="space-y-4 pt-4">
              {/* Classes Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BookOpenIcon size={14} />
                  Classes ({selectedDayData.classes.filter(c => c.type !== 'free').length})
                </h3>
                {selectedDayData.classes.filter(c => c.type !== 'free').length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayData.classes.filter(c => c.type !== 'free').map((slot, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          dark ? "bg-slate-800" : "bg-slate-100"
                        )}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: getSubjectColor(slot.subject) }}
                        >
                          {slot.subject.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{getSubjectFullName(slot.subject)}</p>
                            <p className="text-xs text-muted-foreground">{formatTimeRange(slot.time)}</p>
                        </div>
                        {slot.attended === true && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                            Present
                          </Badge>
                        )}
                        {slot.attended === false && (
                          <Badge variant="outline" className="text-xs border-red-500 text-red-600">
                            Absent
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No classes scheduled</p>
                )}
              </div>

              {/* Tasks Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CheckIcon size={14} />
                  Tasks ({selectedDayData.tasks.length})
                </h3>
                {selectedDayData.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayData.tasks.map((task) => (
                      <div 
                        key={task.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg",
                          dark ? "bg-slate-800" : "bg-slate-100",
                          task.done && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.priority === 'high' ? "bg-red-500" : "bg-slate-500"
                        )} />
                        <span className={cn("text-sm", task.done && "line-through")}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tasks for this day</p>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <StickyNoteIcon size={14} />
                  Notes ({selectedDayData.notes.length})
                </h3>
                {selectedDayData.notes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayData.notes.map((note) => (
                      <div 
                        key={note.id}
                        className={cn(
                          "p-2 rounded-lg",
                          dark ? "bg-slate-800" : "bg-slate-100"
                        )}
                      >
                        <p className="text-sm font-medium">{note.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes for this day</p>
                )}
              </div>

              {/* Daily Summary Section */}
              {selectedDayData.summary && (
                <div className={cn(
                  "p-3 rounded-lg border",
                  dark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                )}>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FlagIcon size={14} />
                    Daily Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Classes:</span>{' '}
                      <span className="font-medium">
                        {selectedDayData.summary.classesAttended}/{selectedDayData.summary.totalClasses}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tasks:</span>{' '}
                      <span className="font-medium">
                        {selectedDayData.summary.tasksCompleted}/{selectedDayData.summary.totalTasks}
                      </span>
                    </div>
                  </div>
                  {selectedDayData.summary.funNote && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{selectedDayData.summary.funNote}"
                    </p>
                  )}
                </div>
              )}

              {/* Add Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowDayDetail(false);
                    onOpenModal('task', { date: selectedDayData.date });
                  }}
                >
                  Add Task
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowDayDetail(false);
                    onOpenModal('note', { date: selectedDayData.date });
                  }}
                >
                  Add Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
