import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  PlusIcon, 
  TrashIcon, 
  EditIcon, 
  BookOpenIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlaskIcon,
  ChevronDownIcon,
  UsersIcon
} from '@/components/icons';
import type { Note, AttendanceRecord, Holiday, GroupType } from '@/types';
import { PRACTICALS, SUBJ_COLORS } from '@/data/timetable';
import { cn, todayStr, daysUntil, fmtShort } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MoreTabProps {
  dark: boolean;
  group: GroupType;
  holidays: Holiday[];
  notes: Note[];
  labProgress: Record<string, boolean[]>;
  attendance: AttendanceRecord[];
  onOpenModal: (type: string, data?: any, idx?: number | null) => void;
  onDeleteNote: (idx: number) => void;
  onUpdateAttendance: (subject: string, present: boolean) => void;
  onUpdateLabProgress: (labIndex: number, expIndex: number, completed: boolean) => void;
  onDeleteHoliday: (idx: number) => void;
  onChangeGroup: (group: GroupType) => void;
}

export function MoreTab({ 
  dark, 
  group,
  holidays,
  notes, 
  labProgress,
  attendance, 
  onOpenModal, 
  onDeleteNote,
  onUpdateAttendance,
  onUpdateLabProgress,
  onDeleteHoliday,
  onChangeGroup
}: MoreTabProps) {
  const [activeSection, setActiveSection] = useState<'notes' | 'holidays' | 'attendance' | 'labs' | 'profile'>('notes');
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [expandedLab, setExpandedLab] = useState<number | null>(null);

  const upcomingHolidays = holidays.filter(h => h.date >= todayStr()).slice(0, 10);

  const getProgress = (labIndex: number) => {
    const progress = labProgress[labIndex] || [];
    const completed = Object.values(progress).filter(Boolean).length;
    return {
      completed,
      total: PRACTICALS[labIndex].expts.length,
      percentage: Math.round((completed / PRACTICALS[labIndex].expts.length) * 100)
    };
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Section Selector */}
      <div className="grid grid-cols-5 gap-2">
        <Button
          variant={activeSection === 'notes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('notes')}
          className="flex flex-col items-center py-3 h-auto gap-1"
        >
          <BookOpenIcon size={14} />
          <span className="text-[9px]">Notes</span>
        </Button>
        <Button
          variant={activeSection === 'labs' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('labs')}
          className="flex flex-col items-center py-3 h-auto gap-1"
        >
          <FlaskIcon size={14} />
          <span className="text-[9px]">Labs</span>
        </Button>
        <Button
          variant={activeSection === 'holidays' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('holidays')}
          className="flex flex-col items-center py-3 h-auto gap-1"
        >
          <CalendarIcon size={14} />
          <span className="text-[9px]">Holidays</span>
        </Button>
        <Button
          variant={activeSection === 'attendance' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('attendance')}
          className="flex flex-col items-center py-3 h-auto gap-1"
        >
          <CheckCircleIcon size={14} />
          <span className="text-[9px]">Attendance</span>
        </Button>
        <Button
          variant={activeSection === 'profile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('profile')}
          className="flex flex-col items-center py-3 h-auto gap-1"
        >
          <UsersIcon size={14} />
          <span className="text-[9px]">Profile</span>
        </Button>
      </div>

      {/* Notes Section */}
      {activeSection === 'notes' && (
        <div className="space-y-3">
          <Button 
            onClick={() => onOpenModal('note')}
            className="w-full py-5"
          >
            <PlusIcon size={18} className="mr-2" />
            Add Note
          </Button>

          {notes.length > 0 ? (
            <div className="grid gap-3">
              {notes.map((note, idx) => (
                <Card 
                  key={note.id}
                  className={cn(
                    "group transition-all duration-300",
                    dark ? "bg-slate-900/50 border-slate-800 hover:border-slate-700" : "bg-white hover:shadow-md"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onOpenModal('note', note, idx)}
                      >
                        <h4 className="font-semibold">{note.title}</h4>
                        {note.content && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {note.content}
                          </p>
                        )}
                        {note.date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {fmtShort(note.date)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onOpenModal('note', note, idx)}
                        >
                          <EditIcon size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <TrashIcon size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{note.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDeleteNote(idx)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className={cn(
              dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
            )}>
              <CardContent className="p-8 text-center">
                <BookOpenIcon size={32} className="mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold">No Notes Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add quick notes for later reference
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Labs Section */}
      {activeSection === 'labs' && (
        <div className="space-y-3">
          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FlaskIcon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Laboratory Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your experiments and progress
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {PRACTICALS.map((lab, labIndex) => {
                  const isExpanded = expandedLab === labIndex;
                  const progress = getProgress(labIndex);

                  return (
                    <div 
                      key={labIndex}
                      className={cn(
                        "border rounded-xl overflow-hidden transition-all duration-300",
                        dark ? "border-slate-700" : "border-slate-200"
                      )}
                    >
                      <div 
                        className="p-3 cursor-pointer"
                        onClick={() => setExpandedLab(isExpanded ? null : labIndex)}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: lab.color }}
                          >
                            {lab.short}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{lab.subject}</h4>
                            <p className="text-xs text-muted-foreground">
                              {progress.completed}/{progress.total} completed
                            </p>
                          </div>
                          <ChevronDownIcon 
                            size={16}
                            className={cn(
                              "text-muted-foreground transition-transform duration-300",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                        <Progress 
                          value={progress.percentage} 
                          className="h-1.5 mt-2"
                        />
                      </div>

                      {isExpanded && (
                        <div className={cn(
                          "border-t p-3 space-y-2",
                          dark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
                        )}>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Schedule:</span> {lab.schedule}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Room:</span> {lab.room}
                          </p>
                          <div className="space-y-1 pt-2">
                            {lab.expts.map((expt, expIndex) => {
                              const isCompleted = labProgress[labIndex]?.[expIndex] || false;
                              return (
                                <div 
                                  key={expIndex}
                                  className="flex items-start gap-2"
                                >
                                  <Checkbox 
                                    checked={isCompleted}
                                    onCheckedChange={(checked) => 
                                      onUpdateLabProgress(labIndex, expIndex, checked as boolean)
                                    }
                                    className="mt-0.5"
                                  />
                                  <span className={cn(
                                    "text-sm",
                                    isCompleted && "line-through text-muted-foreground"
                                  )}>
                                    {expt}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overall Progress */}
              <div className="mt-4 p-3 rounded-xl bg-primary/5 text-center">
                {(() => {
                  let totalCompleted = 0;
                  let totalExpts = 0;
                  PRACTICALS.forEach((_, idx) => {
                    const progress = getProgress(idx);
                    totalCompleted += progress.completed;
                    totalExpts += progress.total;
                  });
                  const overallPercentage = Math.round((totalCompleted / totalExpts) * 100) || 0;
                  
                  return (
                    <>
                      <div className="text-3xl font-bold text-primary">{overallPercentage}%</div>
                      <div className="text-sm text-muted-foreground">
                        {totalCompleted} of {totalExpts} experiments completed
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Holidays Section */}
      {activeSection === 'holidays' && (
        <div className="space-y-3">
          <Button 
            onClick={() => onOpenModal('holiday')}
            className="w-full py-5"
          >
            <PlusIcon size={18} className="mr-2" />
            Add Custom Holiday
          </Button>

          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Upcoming Holidays ({upcomingHolidays.length})
              </h3>
              <div className="space-y-2">
                {upcomingHolidays.map((holiday, idx) => {
                  const days = daysUntil(holiday.date);
                  const originalIndex = holidays.findIndex(h => h.date === holiday.date);
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                        dark ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100"
                      )}
                    >
                      <div className="bg-amber-500/10 text-amber-600 px-3 py-2 rounded-xl text-center min-w-[60px]">
                        <div className="text-lg font-bold">{new Date(holiday.date).getDate()}</div>
                        <div className="text-xs uppercase">
                          {new Date(holiday.date).toLocaleDateString('en-IN', { month: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{holiday.name}</h4>
                        <p className={cn(
                          "text-xs",
                          days < 7 ? "text-amber-500 font-medium" : "text-muted-foreground"
                        )}>
                          {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days away`}
                        </p>
                      </div>
                      {holiday.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDeleteHoliday(originalIndex)}
                        >
                          <TrashIcon size={14} />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Section */}
      {activeSection === 'attendance' && (
        <div className="space-y-3">
          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Attendance Tracker
                </h3>
                <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <PlusIcon size={14} className="mr-1" />
                      Mark
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 pt-4">
                      {attendance.map((record) => (
                        <div 
                          key={record.subject}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <span className="font-medium">{record.subject}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => {
                                onUpdateAttendance(record.subject, true);
                                setAttendanceDialogOpen(false);
                              }}
                            >
                              <CheckCircleIcon size={14} className="mr-1" />
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                onUpdateAttendance(record.subject, false);
                                setAttendanceDialogOpen(false);
                              }}
                            >
                              <XCircleIcon size={14} className="mr-1" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {attendance.map((record) => {
                  const percentage = Math.round((record.present / record.total) * 100) || 0;
                  return (
                    <div key={record.subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: SUBJ_COLORS[record.subject] || '#64748B' }}
                          />
                          <span className="font-medium text-sm">{record.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold", getAttendanceColor(percentage))}>
                            {percentage}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({record.present}/{record.total})
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                      />
                      {percentage < 75 && record.total > 0 && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircleIcon size={12} />
                          Below 75% - Attend more classes!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overall Stats */}
              {attendance.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  {(() => {
                    const totalPresent = attendance.reduce((sum, r) => sum + r.present, 0);
                    const totalClasses = attendance.reduce((sum, r) => sum + r.total, 0);
                    const overallPercentage = Math.round((totalPresent / totalClasses) * 100) || 0;
                    
                    return (
                      <div className="text-center p-4 rounded-xl bg-primary/5">
                        <div className={cn("text-3xl font-bold", getAttendanceColor(overallPercentage))}>
                          {overallPercentage}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Overall Attendance
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {totalPresent} of {totalClasses} classes attended
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <div className="space-y-4">
          {/* Current Group Card */}
          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <UsersIcon size={28} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Current Group</p>
                  <h3 className="text-2xl font-bold">{group}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Group */}
          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Change Group
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select your group to update your lab schedule. Your classes will remain the same, only labs will change.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => onChangeGroup('G1')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    group === 'G1'
                      ? "border-primary bg-primary/5"
                      : dark
                        ? "border-slate-700 hover:border-slate-600"
                        : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">Group 1 (G1)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mon: OOP Lab | Tue: Chemistry Lab | Thu: EG Lab | Fri: BEE Lab
                      </p>
                    </div>
                    {group === 'G1' && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => onChangeGroup('G2')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    group === 'G2'
                      ? "border-primary bg-primary/5"
                      : dark
                        ? "border-slate-700 hover:border-slate-600"
                        : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">Group 2 (G2)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mon: EG Lab | Tue: OOP Lab | Thu: BEE Lab | Fri: Chemistry Lab
                      </p>
                    </div>
                    {group === 'G2' && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className={cn(
            dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
          )}>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                About
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App</span>
                  <span className="font-medium">CSE Timetable</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">UIET Hoshiarpur</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Semester</span>
                  <span className="font-medium">2nd (2025-26)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
