// Types for CSE Timetable App

export interface TimeSlot {
  time: string;
  lect: number;
  subject: string;
  type: 'free' | 'lecture' | 'lab' | 'tutorial' | 'break';
  room?: string;
  note?: string; // Note attached to this class/lab
  attended?: boolean | null; // Attendance tracking
}

export interface DaySchedule {
  [key: string]: TimeSlot[];
}

export interface Holiday {
  date: string;
  name: string;
  isCustom?: boolean;
}

export interface Experiment {
  name: string;
  completed: boolean;
}

export interface Practical {
  subject: string;
  short: string;
  color: string;
  room: string;
  schedule: string;
  expts: string[];
}

export interface Task {
  id: number;
  title: string;
  subject?: string;
  date?: string;
  priority?: 'normal' | 'high';
  notes?: string;
  done: boolean;
}

export interface Exam {
  id: number;
  subject: string;
  date: string;
  syllabus?: string;
  time?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  date?: string; // Date associated with the note
}

export interface AttendanceRecord {
  subject: string;
  present: number;
  total: number;
}

export interface DailySummary {
  date: string;
  classesAttended: number;
  totalClasses: number;
  tasksCompleted: number;
  totalTasks: number;
  mood?: 'productive' | 'average' | 'relaxed';
  funNote?: string;
}

export type GroupType = 'G1' | 'G2';

export type TabType = 'today' | 'table' | 'calendar' | 'exams' | 'tasks' | 'more';
export type ModalType = 'task' | 'exam' | 'note' | 'attendance' | 'class' | 'holiday' | 'group' | null;

export interface ModalState {
  type: ModalType;
  idx: number | null;
  data?: any;
  day?: string; // For class editing
}
