import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronDownIcon, MapPinIcon, FlaskIcon } from '@/components/icons';
import { PRACTICALS } from '@/data/timetable';
import { cn } from '@/lib/utils';

interface LabsTabProps {
  dark: boolean;
  labProgress: Record<string, boolean[]>;
  onUpdateProgress: (labIndex: number, expIndex: number, completed: boolean) => void;
}

export function LabsTab({ dark, labProgress, onUpdateProgress }: LabsTabProps) {
  const [expandedLab, setExpandedLab] = useState<number | null>(null);

  const getProgress = (labIndex: number) => {
    const progress = labProgress[labIndex] || [];
    const completed = progress.filter(Boolean).length;
    return {
      completed,
      total: PRACTICALS[labIndex].expts.length,
      percentage: Math.round((completed / PRACTICALS[labIndex].expts.length) * 100)
    };
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Info */}
      <Card className={cn(
        dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
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
        </CardContent>
      </Card>

      {/* Lab Cards */}
      <div className="space-y-3">
        {PRACTICALS.map((lab, labIndex) => {
          const isExpanded = expandedLab === labIndex;
          const progress = getProgress(labIndex);

          return (
            <Card 
              key={labIndex} 
              className={cn(
                "overflow-hidden transition-all duration-300",
                dark ? "bg-slate-900/50 border-slate-800" : "bg-white",
                "hover:shadow-md"
              )}
            >
              {/* Lab Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedLab(isExpanded ? null : labIndex)}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: lab.color }}
                  >
                    {lab.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{lab.subject}</h4>
                      <ChevronDownIcon 
                        size={18} 
                        className={cn(
                          "text-muted-foreground transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        <MapPinIcon size={10} className="mr-1" />
                        {lab.room}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {progress.completed}/{progress.total} done
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.percentage}%</span>
                      </div>
                      <Progress 
                        value={progress.percentage} 
                        className="h-2"
                        style={{ 
                          ['--progress-background' as string]: lab.color + '30',
                          ['--progress-foreground' as string]: lab.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Experiments List */}
              {isExpanded && (
                <div className={cn(
                  "border-t transition-all duration-300",
                  dark ? "border-slate-800 bg-slate-900/30" : "border-slate-100 bg-slate-50"
                )}>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      <span className="font-medium">Schedule:</span> {lab.schedule}
                    </p>
                    {lab.expts.map((expt, expIndex) => {
                      const isCompleted = labProgress[labIndex]?.[expIndex] || false;
                      return (
                        <div 
                          key={expIndex}
                          className={cn(
                            "flex items-start gap-3 p-2 rounded-lg transition-all duration-200",
                            isCompleted 
                              ? dark ? "bg-slate-800/50" : "bg-white" 
                              : "bg-transparent"
                          )}
                        >
                          <Checkbox 
                            checked={isCompleted}
                            onCheckedChange={(checked) => 
                              onUpdateProgress(labIndex, expIndex, checked as boolean)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded",
                                isCompleted 
                                  ? "bg-green-500/20 text-green-600" 
                                  : "bg-slate-500/20 text-slate-500"
                              )}>
                                Exp {expIndex + 1}
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm mt-1 transition-all duration-200",
                              isCompleted && "line-through text-muted-foreground"
                            )}>
                              {expt}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Overall Progress */}
      <Card className={cn(
        dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
      )}>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Overall Progress
          </h3>
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
              <div className="text-center p-4 rounded-xl bg-primary/5">
                <div className="text-4xl font-bold text-primary">{overallPercentage}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {totalCompleted} of {totalExpts} experiments completed
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
