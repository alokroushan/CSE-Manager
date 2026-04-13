import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { XIcon } from '@/components/icons';
import type { ModalState, TimeSlot } from '@/types';
import { TIME_SLOTS } from '@/data/timetable';
import { cn, formatTimeRange } from '@/lib/utils';

interface ModalProps {
  modal: ModalState;
  dark: boolean;
  onClose: () => void;
  onSave: (type: string, data: any, idx: number | null) => void;
  onUpdateClass: (day: string, slotIndex: number, slot: TimeSlot) => void;
  onAddClass: (day: string, slot: TimeSlot) => void;
}

const CLASS_TYPES = ['lecture', 'lab', 'tutorial', 'break'];
const SUBJECT_LIST = ['OOP', 'BEE', 'EG', 'DE&T', 'Chemistry', 'Physics', 'Universal Human Values', 'Other'];

export function Modal({ 
  modal, 
  dark, 
  onClose, 
  onSave,
  onUpdateClass,
  onAddClass,
}: ModalProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (modal.type) {
      setFormData(modal.data || getInitialData(modal.type));
    }
  }, [modal]);

  const getInitialData = (type: string) => {
    switch (type) {
      case 'task':
        return { title: '', subject: '', date: '', priority: 'normal', notes: '', done: false };
      case 'exam':
        return { subject: '', date: '', syllabus: '', time: '' };
      case 'note':
        return { title: '', content: '', createdAt: new Date().toISOString().split('T')[0], date: '' };
      case 'holiday':
        return { date: '', name: '', isCustom: true };
      case 'class':
        return modal.data || { time: '', lect: 1, subject: '', type: 'lecture', room: '', note: '' };
      default:
        return {};
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    if (modal.type === 'class' && modal.day) {
      // Handle class editing separately
      if (modal.idx !== null) {
        onUpdateClass(modal.day, modal.idx, formData);
      } else {
        onAddClass(modal.day, formData);
      }
    } else {
      onSave(modal.type!, formData, modal.idx);
    }
    onClose();
  };

  const validateForm = () => {
    switch (modal.type) {
      case 'task':
        return formData.title?.trim();
      case 'exam':
        return formData.subject?.trim() && formData.date;
      case 'note':
        return formData.title?.trim();
      case 'holiday':
        return formData.date && formData.name?.trim();
      case 'class':
        return formData.subject?.trim() && formData.time;
      default:
        return true;
    }
  };

  if (!modal.type) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Sheet */}
      <div 
        className={cn(
          "relative w-full max-w-lg rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300",
          dark ? "bg-slate-900 border-t border-slate-800" : "bg-white"
        )}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className={cn("w-9 h-1 rounded-full", dark ? "bg-slate-700" : "bg-slate-300")} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-bold">
            {modal.idx !== null ? 'Edit' : 'New'} {modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full"
            onClick={onClose}
          >
            <XIcon size={18} />
          </Button>
        </div>

        {/* Form */}
        <div className="px-5 pb-8 space-y-4">
          {modal.type === 'task' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Complete OOP lab file"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={!formData.subject ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFormData({ ...formData, subject: '' })}
                  >
                    None
                  </Badge>
                  {SUBJECT_LIST.map(subj => (
                    <Badge 
                      key={subj}
                      variant={formData.subject === subj ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData({ ...formData, subject: subj })}
                    >
                      {subj}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Due Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.priority === 'normal' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, priority: 'normal' })}
                  >
                    Normal
                  </Button>
                  <Button
                    type="button"
                    variant={formData.priority === 'high' ? 'destructive' : 'outline'}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, priority: 'high' })}
                  >
                    High Priority
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </>
          )}

          {modal.type === 'exam' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Data Structures"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Or select from list</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_LIST.map(subj => (
                    <Badge 
                      key={subj}
                      variant={formData.subject === subj ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData({ ...formData, subject: subj })}
                    >
                      {subj}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="examDate">Date *</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time (optional)</Label>
                <Input
                  id="time"
                  placeholder="e.g. 10:00 AM - 1:00 PM"
                  value={formData.time || ''}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="syllabus">Syllabus (optional)</Label>
                <Textarea
                  id="syllabus"
                  placeholder="Topics to study..."
                  value={formData.syllabus || ''}
                  onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                  rows={3}
                />
              </div>
            </>
          )}

          {modal.type === 'note' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="noteTitle">Title *</Label>
                <Input
                  id="noteTitle"
                  placeholder="Note title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noteDate">Date</Label>
                <Input
                  id="noteDate"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your note here..."
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>
            </>
          )}

          {modal.type === 'holiday' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="holidayName">Holiday Name *</Label>
                <Input
                  id="holidayName"
                  placeholder="e.g. College Fest"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holidayDate">Date *</Label>
                <Input
                  id="holidayDate"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </>
          )}

          {modal.type === 'class' && (
            <>
              <div className="space-y-2">
                <Label>Time Slot *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((time, idx) => (
                    <Button
                      key={time}
                      type="button"
                      variant={formData.time === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, time, lect: idx + 1 })}
                    >
                      {formatTimeRange(time)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Name *</Label>
                <Input
                  id="subject"
                  placeholder="e.g. OOP"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Or select from list</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_LIST.map(subj => (
                    <Badge 
                      key={subj}
                      variant={formData.subject === subj ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData({ ...formData, subject: subj })}
                    >
                      {subj}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Class Type</Label>
                <div className="flex gap-2">
                  {CLASS_TYPES.map(type => (
                    <Button
                      key={type}
                      type="button"
                      variant={formData.type === type ? 'default' : 'outline'}
                      className="flex-1 capitalize"
                      onClick={() => setFormData({ ...formData, type })}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room/Location</Label>
                <Input
                  id="room"
                  placeholder="e.g. Lecture Hall 1"
                  value={formData.room || ''}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classNote">Note</Label>
                <Textarea
                  id="classNote"
                  placeholder="Add a note about this class..."
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          )}

          <Button 
            onClick={handleSave}
            className="w-full py-6 text-base font-semibold mt-4"
            disabled={!validateForm()}
          >
            {modal.idx !== null ? 'Save Changes' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
