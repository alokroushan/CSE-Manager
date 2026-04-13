import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPinIcon, LiveDot, PlusIcon, TrashIcon, EditIcon, StickyNoteIcon } from '@/components/icons';
import { DAYS_ARR, getSubjectColor, getSubjectFullName, TIME_SLOTS } from '@/data/timetable';
import type { DaySchedule, TimeSlot } from '@/types';
import { cn, dayName, getCurrentSlot, getRangeStartMins, formatTimeRange } from '@/lib/utils';

interface TimetableTabProps {
  dark: boolean;
  timetable: DaySchedule;
  onAddClass: (day: string, slot: TimeSlot) => void;
  onRemoveClass: (day: string, slotIndex: number) => void;
  onToggleAttendance: (day: string, slotIndex: number) => void;
  onOpenModal: (type: string, data?: any, idx?: number | null, day?: string) => void;
}

export function TimetableTab({ 
  dark, 
  timetable, 
  onAddClass, 
  onRemoveClass,
  onToggleAttendance,
  onOpenModal
}: TimetableTabProps) {
  const [selectedDay, setSelectedDay] = useState(dayName());
  const currentDay = dayName();
  const slots = timetable[selectedDay] || [];
  const curSlot = selectedDay === currentDay ? getCurrentSlot(slots) : null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lecture': return 'Lecture';
      case 'lab': return 'Lab';
      case 'tutorial': return 'Tutorial';
      case 'break': return 'Break';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'lab': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'tutorial': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'break': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const handleAddClass = () => {
    // Find first empty slot
    const emptySlot = TIME_SLOTS.find((time) => {
      return !slots.some(s => s.time === time && s.type !== 'free');
    });
    
    if (emptySlot) {
      const newSlot: TimeSlot = {
        time: emptySlot,
        lect: TIME_SLOTS.indexOf(emptySlot) + 1,
        subject: 'New Class',
        type: 'lecture',
        room: '',
        attended: null,
        note: ''
      };
      onAddClass(selectedDay, newSlot);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Day Selector */}
      <div className="w-full overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2 pb-2 min-w-max">
          {DAYS_ARR.slice(0, 6).map((day) => (
            <Button
              key={day}
              variant={selectedDay === day ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(day)}
              className={cn(
                "min-w-[70px] transition-all duration-200",
                selectedDay === day && "shadow-md",
                day === currentDay && selectedDay !== day && "border-primary/50 text-primary"
              )}
            >
              {day.slice(0, 3)}
              {day === currentDay && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Add Class Button */}
      <Button 
        onClick={handleAddClass}
        variant="outline"
        className="w-full"
      >
        <PlusIcon size={16} className="mr-2" />
        Add Class to {selectedDay}
      </Button>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className={cn(
          "absolute left-5 top-0 bottom-0 w-0.5",
          dark ? "bg-slate-800" : "bg-slate-200"
        )} />

        <div className="space-y-3">
          {slots.map((slot, idx) => {
            const isLive = curSlot === slot;
            const isPast = selectedDay === currentDay && !isLive && slot.type !== 'free' && 
              (() => {
                const slotMins = getRangeStartMins(slot.time);
                const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
                return slotMins < nowMins;
              })();

            if (slot.type === 'free') return null;

            return (
              <div 
                key={idx} 
                className={cn(
                  "relative pl-12 transition-all duration-300",
                  isPast && "opacity-50"
                )}
              >
                {/* Timeline dot */}
                <div 
                  className={cn(
                    "absolute left-3 top-4 w-4 h-4 rounded-full border-2 z-10 transition-all duration-300",
                    isLive 
                      ? "bg-green-500 border-green-500 scale-125" 
                      : slot.type === 'break'
                        ? "bg-amber-500 border-amber-500"
                        : dark 
                          ? "bg-slate-900 border-slate-600" 
                          : "bg-white border-slate-400"
                  )}
                >
                  {isLive && <span className="absolute inset-0 rounded-full bg-green-500 animate-ping" />}
                </div>

                <Card className={cn(
                  "transition-all duration-300 group",
                  isLive 
                    ? "border-green-500/50 shadow-lg shadow-green-500/10" 
                    : dark 
                      ? "bg-slate-900/50 border-slate-800 hover:border-slate-700" 
                      : "bg-white hover:shadow-md",
                  "hover:translate-y-[-2px]"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Attendance Checkbox */}
                      {slot.type !== 'break' && (
                        <Checkbox 
                          checked={slot.attended === true}
                          onCheckedChange={() => onToggleAttendance(selectedDay, idx)}
                          className={cn(
                            "mt-1",
                            slot.attended === true ? "border-green-500 bg-green-500" :
                            slot.attended === false ? "border-red-500 bg-red-500" : ""
                          )}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-muted-foreground">
                            {formatTimeRange(slot.time)}
                          </span>
                          {isLive && (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-600 flex items-center gap-1">
                              <LiveDot size={6} />
                              Live
                            </Badge>
                          )}
                        </div>
                        
                        {slot.type === 'break' ? (
                          <h4 className="font-semibold text-amber-600 mt-1">{slot.subject}</h4>
                        ) : (
                          <>
                            <h4 className="font-semibold mt-1 truncate">
                              {getSubjectFullName(slot.subject)}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs capitalize", getTypeColor(slot.type))}
                              >
                                {getTypeLabel(slot.type)}
                              </Badge>
                              {slot.room && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPinIcon size={10} />
                                  {slot.room}
                                </span>
                              )}
                            </div>
                            {slot.note && (
                              <p className="text-xs text-muted-foreground mt-2 italic bg-muted/50 p-2 rounded">
                                <StickyNoteIcon size={10} className="inline mr-1" />
                                {slot.note}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onOpenModal('class', slot, idx, selectedDay)}
                        >
                          <EditIcon size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onRemoveClass(selectedDay, idx)}
                        >
                          <TrashIcon size={14} />
                        </Button>
                      </div>

                      {slot.type !== 'break' && (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: getSubjectColor(slot.subject) }}
                        >
                          {slot.subject.charAt(0)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <Card className={cn(
        dark ? "bg-slate-900/50 border-slate-800" : "bg-white"
      )}>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Day Summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-blue-500/10">
              <div className="text-2xl font-bold text-blue-600">
                {slots.filter(s => s.type === 'lecture').length}
              </div>
              <div className="text-xs text-muted-foreground">Lectures</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-green-500/10">
              <div className="text-2xl font-bold text-green-600">
                {slots.filter(s => s.type === 'lab').length}
              </div>
              <div className="text-xs text-muted-foreground">Labs</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-500/10">
              <div className="text-2xl font-bold text-purple-600">
                {slots.filter(s => s.type === 'tutorial').length}
              </div>
              <div className="text-xs text-muted-foreground">Tutorials</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
