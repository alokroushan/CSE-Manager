import { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Modal } from '@/components/Modal';
import { GroupSelection } from '@/components/GroupSelection';
import { TodayTab } from '@/components/tabs/TodayTab';
import { TimetableTab } from '@/components/tabs/TimetableTab';
import { CalendarTab } from '@/components/tabs/CalendarTab';
import { ExamsTab } from '@/components/tabs/ExamsTab';
import { TasksTab } from '@/components/tabs/TasksTab';
import { MoreTab } from '@/components/tabs/MoreTab';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Task, Exam, Note, AttendanceRecord, ModalState, TimeSlot, Holiday, DailySummary, GroupType } from '@/types';
import { DEFAULT_HOLIDAYS, generateTimetableForGroup } from '@/data/timetable';
import { cn, todayStr } from '@/lib/utils';
import './App.css';

function App() {
  const [dark, setDark] = useLocalStorage('cse_dark', false);
  const [group, setGroup] = useLocalStorage<GroupType | null>('cse_group', null);
  const [activeTab, setActiveTab] = useState('today');
  const [modal, setModal] = useState<ModalState>({ type: null, idx: null });
  
  // Generate timetable based on group (default to G1 if no group selected)
  const baseTimetable = useMemo(() => {
    return generateTimetableForGroup(group || 'G1');
  }, [group]);
  
  // Editable timetable stored in localStorage
  const [timetable, setTimetable] = useLocalStorage('cse_timetable', baseTimetable);
  
  // Update timetable when group changes
  useEffect(() => {
    if (group) {
      setTimetable(generateTimetableForGroup(group));
    }
  }, [group, setTimetable]);
  
  // Holidays (including user-added)
  const [holidays, setHolidays] = useLocalStorage<Holiday[]>('cse_holidays', DEFAULT_HOLIDAYS);
  
  // Data states with localStorage persistence
  const [tasks, setTasks] = useLocalStorage<Task[]>('cse_tasks', []);
  const [exams, setExams] = useLocalStorage<Exam[]>('cse_exams', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('cse_notes', []);
  const [labProgress, setLabProgress] = useLocalStorage<Record<string, boolean[]>>('cse_lab_progress', {});
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('cse_attendance', [
    { subject: 'OOP', present: 0, total: 0 },
    { subject: 'BEE', present: 0, total: 0 },
    { subject: 'EG', present: 0, total: 0 },
    { subject: 'DE&T', present: 0, total: 0 },
    { subject: 'Chemistry', present: 0, total: 0 },
  ]);
  
  // Daily summaries for calendar
  const [dailySummaries] = useLocalStorage<DailySummary[]>('cse_daily_summaries', []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  // Check if today is a holiday
  const isHoliday = useMemo(() => {
    const today = todayStr();
    const day = new Date().getDay();
    if (day === 0 || day === 6) return { isHoliday: true, name: day === 0 ? 'Sunday' : 'Saturday' };
    const holiday = holidays.find(h => h.date === today);
    if (holiday) return { isHoliday: true, name: holiday.name };
    return { isHoliday: false, name: null };
  }, [holidays]);

  // Handle group selection
  const handleSelectGroup = useCallback((selectedGroup: GroupType) => {
    setGroup(selectedGroup);
  }, [setGroup]);

  // Handle group change from profile
  const handleChangeGroup = useCallback((newGroup: GroupType) => {
    setGroup(newGroup);
    // Reset timetable to base for new group
    setTimetable(generateTimetableForGroup(newGroup));
  }, [setGroup, setTimetable]);

  // Modal handlers
  const openModal = useCallback((type: string, data?: any, idx: number | null = null, day?: string) => {
    setModal({ type: type as any, idx, data, day });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ type: null, idx: null });
  }, []);

  const handleSave = useCallback((type: string, data: any, idx: number | null) => {
    switch (type) {
      case 'task':
        if (idx !== null) {
          setTasks(prev => prev.map((t, i) => i === idx ? { ...data, id: t.id } : t));
        } else {
          setTasks(prev => [...prev, { ...data, id: Date.now() }]);
        }
        break;
      case 'exam':
        if (idx !== null) {
          setExams(prev => prev.map((e, i) => i === idx ? { ...data, id: e.id } : e));
        } else {
          setExams(prev => [...prev, { ...data, id: Date.now() }]);
        }
        break;
      case 'note':
        if (idx !== null) {
          setNotes(prev => prev.map((n, i) => i === idx ? { ...data, id: n.id } : n));
        } else {
          setNotes(prev => [...prev, { ...data, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }]);
        }
        break;
      case 'holiday':
        if (idx !== null) {
          setHolidays(prev => prev.map((h, i) => i === idx ? { ...data } : h));
        } else {
          setHolidays(prev => [...prev, { ...data, isCustom: true }]);
        }
        break;
    }
  }, [setTasks, setExams, setNotes, setHolidays]);

  // Class editing handlers
  const updateClass = useCallback((day: string, slotIndex: number, updatedSlot: TimeSlot) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((slot, idx) => idx === slotIndex ? updatedSlot : slot)
    }));
  }, [setTimetable]);

  const addClass = useCallback((day: string, newSlot: TimeSlot) => {
    setTimetable(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot].sort((a, b) => a.lect - b.lect)
    }));
  }, [setTimetable]);

  const removeClass = useCallback((day: string, slotIndex: number) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].filter((_, idx) => idx !== slotIndex)
    }));
  }, [setTimetable]);

  // Toggle class attendance
  const toggleClassAttendance = useCallback((day: string, slotIndex: number) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((slot, idx) => {
        if (idx === slotIndex) {
          const newAttended = slot.attended === null || slot.attended === undefined ? true : 
                             slot.attended === true ? false : null;
          return { ...slot, attended: newAttended };
        }
        return slot;
      })
    }));
  }, [setTimetable]);

  // Delete holiday
  const deleteHoliday = useCallback((idx: number) => {
    setHolidays(prev => prev.filter((_, i) => i !== idx));
  }, [setHolidays]);

  // Task handlers
  const toggleTask = useCallback((idx: number) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  }, [setTasks]);

  const deleteTask = useCallback((idx: number) => {
    setTasks(prev => prev.filter((_, i) => i !== idx));
  }, [setTasks]);

  // Exam handlers
  const deleteExam = useCallback((idx: number) => {
    setExams(prev => prev.filter((_, i) => i !== idx));
  }, [setExams]);

  // Note handlers
  const deleteNote = useCallback((idx: number) => {
    setNotes(prev => prev.filter((_, i) => i !== idx));
  }, [setNotes]);

  // Lab progress handler
  const updateLabProgress = useCallback((labIndex: number, expIndex: number, completed: boolean) => {
    setLabProgress(prev => ({
      ...prev,
      [labIndex]: {
        ...((prev[labIndex] || [])),
        [expIndex]: completed
      }
    }));
  }, [setLabProgress]);

  // Attendance handler
  const updateAttendance = useCallback((subject: string, present: boolean) => {
    setAttendance(prev => prev.map(record => {
      if (record.subject === subject) {
        return {
          ...record,
          present: present ? record.present + 1 : record.present,
          total: record.total + 1
        };
      }
      return record;
    }));
  }, [setAttendance]);

  // Render active tab
  const renderTab = () => {
    const commonProps = { dark };
    
    switch (activeTab) {
      case 'today':
        return (
          <TodayTab 
            {...commonProps} 
            timetable={timetable}
            holidays={holidays}
            isHoliday={isHoliday}
            tasks={tasks} 
            exams={exams}
            notes={notes}
            onTabChange={setActiveTab}
            onOpenModal={openModal}
            onToggleClassAttendance={toggleClassAttendance}
          />
        );
      case 'table':
        return (
          <TimetableTab 
            {...commonProps} 
            timetable={timetable}
            onAddClass={addClass}
            onRemoveClass={removeClass}
            onToggleAttendance={toggleClassAttendance}
            onOpenModal={openModal}
          />
        );
      case 'calendar':
        return (
          <CalendarTab 
            {...commonProps}
            timetable={timetable}
            holidays={holidays}
            tasks={tasks}
            notes={notes}
            dailySummaries={dailySummaries}
            onOpenModal={openModal}
          />
        );
      case 'exams':
        return (
          <ExamsTab 
            {...commonProps} 
            exams={exams}
            onOpenModal={openModal}
            onDeleteExam={deleteExam}
          />
        );
      case 'tasks':
        return (
          <TasksTab 
            {...commonProps} 
            tasks={tasks}
            onOpenModal={openModal}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'more':
        return (
          <MoreTab 
            {...commonProps}
            group={group || 'G1'}
            holidays={holidays}
            notes={notes}
            labProgress={labProgress}
            attendance={attendance}
            onOpenModal={openModal}
            onDeleteNote={deleteNote}
            onUpdateAttendance={updateAttendance}
            onUpdateLabProgress={updateLabProgress}
            onDeleteHoliday={deleteHoliday}
            onChangeGroup={handleChangeGroup}
          />
        );
      default:
        return (
          <TodayTab 
            {...commonProps} 
            timetable={timetable}
            holidays={holidays}
            isHoliday={isHoliday}
            tasks={tasks} 
            exams={exams}
            notes={notes}
            onTabChange={setActiveTab}
            onOpenModal={openModal}
            onToggleClassAttendance={toggleClassAttendance}
          />
        );
    }
  };

  // Show group selection on first visit
  if (!group) {
    return (
      <div className={cn(
        "min-h-screen transition-colors duration-300 font-sans",
        dark ? "bg-slate-950" : "bg-slate-50"
      )}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        <GroupSelection dark={dark} onSelectGroup={handleSelectGroup} />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans",
      dark ? "bg-slate-950" : "bg-slate-50"
    )}>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
        rel="stylesheet" 
      />

      <div className="max-w-lg mx-auto min-h-screen flex flex-col relative">
        {/* Header */}
        <Header dark={dark} group={group} onToggleTheme={() => setDark(!dark)} />

        {/* Main Content */}
        <main className={cn(
          "flex-1 px-4 py-4 overflow-y-auto",
          "pb-24" // Space for bottom nav
        )}>
          {renderTab()}
        </main>

        {/* Bottom Navigation */}
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          dark={dark} 
        />

        {/* Modal */}
        {modal.type && (
          <Modal 
            modal={modal}
            dark={dark}
            onClose={closeModal}
            onSave={handleSave}
            onUpdateClass={updateClass}
            onAddClass={addClass}
          />
        )}
      </div>
    </div>
  );
}

export default App;
