import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusIcon, TrashIcon, EditIcon, AlertCircleIcon, FlagIcon } from '@/components/icons';
import type { Task } from '@/types';
import { cn, daysUntil } from '@/lib/utils';
import { getSubjectColor } from '@/data/timetable';
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

interface TasksTabProps {
  dark: boolean;
  tasks: Task[];
  onOpenModal: (type: string, data?: any, idx?: number | null) => void;
  onToggleTask: (idx: number) => void;
  onDeleteTask: (idx: number) => void;
}

type FilterType = 'all' | 'pending' | 'high';

export function TasksTab({ dark, tasks, onOpenModal, onToggleTask, onDeleteTask }: TasksTabProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [, setDeleteIndex] = useState<number | null>(null);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.done;
    if (filter === 'high') return task.priority === 'high' && !task.done;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.done).length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.done).length;

  const getDueStatus = (date?: string) => {
    if (!date) return null;
    const days = daysUntil(date);
    if (days < 0) return { text: 'Overdue', color: 'text-red-500' };
    if (days === 0) return { text: 'Due today', color: 'text-amber-500' };
    if (days === 1) return { text: 'Due tomorrow', color: 'text-amber-500' };
    return { text: `Due in ${days} days`, color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Add Button */}
      <Button 
        onClick={() => onOpenModal('task')}
        className="w-full py-6 text-base font-semibold shadow-lg"
      >
        <PlusIcon size={20} className="mr-2" />
        Add New Task
      </Button>

      {/* Filter Chips */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="flex-1"
        >
          All ({tasks.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
          className="flex-1"
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('high')}
          className="flex-1"
        >
          <FlagIcon size={12} className="mr-1" />
          High ({highPriorityCount})
        </Button>
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const originalIndex = tasks.findIndex(t => t.id === task.id);
            const dueStatus = getDueStatus(task.date);
            
            return (
              <Card 
                key={task.id}
                className={cn(
                  "group transition-all duration-300",
                  dark ? "bg-slate-900/50 border-slate-800 hover:border-slate-700" : "bg-white hover:shadow-md",
                  task.done && "opacity-60"
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={task.done}
                      onCheckedChange={() => onToggleTask(originalIndex)}
                      className="mt-1"
                    />
                    
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onOpenModal('task', task, originalIndex)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={cn(
                            "font-medium transition-all duration-200",
                            task.done && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {task.subject && (
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  borderColor: getSubjectColor(task.subject) + '40',
                                  color: getSubjectColor(task.subject)
                                }}
                              >
                                {task.subject}
                              </Badge>
                            )}
                            
                            {task.priority === 'high' && !task.done && (
                              <Badge variant="destructive" className="text-xs">
                                High Priority
                              </Badge>
                            )}
                            
                            {dueStatus && !task.done && (
                              <span className={cn("text-xs", dueStatus.color)}>
                                {dueStatus.text}
                              </span>
                            )}
                          </div>
                          
                          {task.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {task.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenModal('task', task, originalIndex);
                            }}
                          >
                            <EditIcon size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteIndex(originalIndex);
                                }}
                              >
                                <TrashIcon size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{task.title}" from your task list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => onDeleteTask(originalIndex)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
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
            <h3 className="font-semibold text-lg">
              {filter === 'all' ? 'No Tasks Yet' : filter === 'pending' ? 'No Pending Tasks' : 'No High Priority Tasks'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' ? 'Add tasks to stay organized' : 'Great job! You\'re all caught up.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completion Stats */}
      {tasks.length > 0 && (
        <Card className={cn(
          dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
        )}>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Completion Stats
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-primary/10">
                <div className="text-2xl font-bold text-primary">
                  {tasks.filter(t => t.done).length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-500/10">
                <div className="text-2xl font-bold text-amber-600">
                  {tasks.filter(t => !t.done).length}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-500/10">
                <div className="text-2xl font-bold text-red-500">
                  {tasks.filter(t => t.priority === 'high' && !t.done).length}
                </div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
