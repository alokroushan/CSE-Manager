import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon, EditIcon, AlertCircleIcon } from '@/components/icons';
import type { Exam } from '@/types';
import { cn, daysUntil, fmtDate, todayStr } from '@/lib/utils';
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

interface ExamsTabProps {
  dark: boolean;
  exams: Exam[];
  onOpenModal: (type: string, data?: any, idx?: number | null) => void;
  onDeleteExam: (idx: number) => void;
}

export function ExamsTab({ dark, exams, onOpenModal, onDeleteExam }: ExamsTabProps) {
  const [, setDeleteIndex] = useState<number | null>(null);
  
  const upcomingExams = [...exams]
    .filter(e => e.date >= todayStr())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const pastExams = [...exams]
    .filter(e => e.date < todayStr())
    .sort((a, b) => b.date.localeCompare(a.date));

  const getCountdownColor = (days: number) => {
    if (days < 1) return 'text-red-500 bg-red-500/10';
    if (days < 3) return 'text-amber-500 bg-amber-500/10';
    return 'text-primary bg-primary/10';
  };

  const getUrgencyBadge = (days: number) => {
    if (days < 1) return <Badge variant="destructive" className="text-xs">Tomorrow</Badge>;
    if (days < 3) return <Badge variant="default" className="text-xs bg-amber-500">Soon</Badge>;
    return null;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Add Button */}
      <Button 
        onClick={() => onOpenModal('exam')}
        className="w-full py-6 text-base font-semibold shadow-lg"
      >
        <PlusIcon size={20} className="mr-2" />
        Add New Exam
      </Button>

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Upcoming ({upcomingExams.length})
          </h3>
          {upcomingExams.map((exam) => {
            const days = daysUntil(exam.date);
            const originalIndex = exams.findIndex(e => e.id === exam.id);
            
            return (
              <Card 
                key={exam.id}
                className={cn(
                  "group transition-all duration-300 hover:shadow-md",
                  dark ? "bg-slate-900/50 border-slate-800 hover:border-slate-700" : "bg-white"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Countdown */}
                    <div className={cn(
                      "px-3 py-2 rounded-xl text-center min-w-[70px] flex-shrink-0",
                      getCountdownColor(days)
                    )}>
                      <div className="text-2xl font-bold">{days}</div>
                      <div className="text-xs uppercase">Days</div>
                    </div>

                    {/* Exam Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold truncate">{exam.subject}</h4>
                          <p className="text-sm text-muted-foreground">{fmtDate(exam.date)}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => onOpenModal('exam', exam, originalIndex)}
                          >
                            <EditIcon size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteIndex(originalIndex)}
                              >
                                <TrashIcon size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove {exam.subject} from your exam list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => onDeleteExam(originalIndex)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {getUrgencyBadge(days)}

                      {exam.syllabus && (
                        <div className="mt-2 p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Syllabus:</span> {exam.syllabus}
                          </p>
                        </div>
                      )}

                      {exam.time && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Time:</span> {exam.time}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className={cn(
          dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
        )}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircleIcon size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-lg">No Upcoming Exams</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your exams to track countdowns
            </p>
          </CardContent>
        </Card>
      )}

      {/* Past Exams */}
      {pastExams.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Past Exams
          </h3>
          {pastExams.slice(0, 3).map((exam) => (
            <Card 
              key={exam.id}
              className={cn(
                "opacity-60 transition-all duration-300",
                dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{exam.subject}</h4>
                    <p className="text-xs text-muted-foreground">{fmtDate(exam.date)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
