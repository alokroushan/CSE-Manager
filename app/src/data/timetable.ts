import type { DaySchedule, Holiday, Practical } from '@/types';
import type { GroupType } from './groups';
import { getLabForDay } from './groups';

// Base timetable without labs (same for both G1 and G2)
const BASE_TIMETABLE: DaySchedule = {
  Monday: [
    { time: "9:00–10:00", lect: 1, subject: "", type: "free" },
    { time: "10:00–11:00", lect: 2, subject: "", type: "free" },
    { time: "11:00–12:00", lect: 3, subject: "BEE", type: "lecture", room: "Lecture Hall 2" },
    { time: "12:00–1:00", lect: 4, subject: "Chemistry", type: "lecture", room: "Lecture Hall 1" },
    { time: "1:00–2:00", lect: 5, subject: "LUNCH BREAK", type: "break" },
    { time: "2:00–3:00", lect: 6, subject: "", type: "free" },
    { time: "3:00–4:00", lect: 7, subject: "", type: "free" }, // Lab slot - filled based on group
    { time: "4:00–5:00", lect: 8, subject: "", type: "free" },
  ],
  Tuesday: [
    { time: "9:00–10:00", lect: 1, subject: "", type: "free" },
    { time: "10:00–11:00", lect: 2, subject: "OOP", type: "lecture", room: "Lecture Hall 3" },
    { time: "11:00–12:00", lect: 3, subject: "Chemistry", type: "lecture", room: "Lecture Hall 1" },
    { time: "12:00–1:00", lect: 4, subject: "DE&T", type: "lecture", room: "Lecture Hall 2" },
    { time: "1:00–2:00", lect: 5, subject: "LUNCH BREAK", type: "break" },
    { time: "2:00–3:00", lect: 6, subject: "", type: "free" },
    { time: "3:00–4:00", lect: 7, subject: "", type: "free" }, // Lab slot - filled based on group
    { time: "4:00–5:00", lect: 8, subject: "", type: "free" },
  ],
  Wednesday: [
    { time: "9:00–10:00", lect: 1, subject: "", type: "free" },
    { time: "10:00–11:00", lect: 2, subject: "BEE", type: "lecture", room: "Lecture Hall 2" },
    { time: "11:00–12:00", lect: 3, subject: "Chemistry", type: "lecture", room: "Lecture Hall 1" },
    { time: "12:00–1:00", lect: 4, subject: "Chemistry TG1", type: "tutorial", room: "Tutorial Room 1" },
    { time: "1:00–2:00", lect: 5, subject: "LUNCH BREAK", type: "break" },
    { time: "2:00–3:00", lect: 6, subject: "DE&T", type: "lecture", room: "Lecture Hall 2" },
    { time: "3:00–4:00", lect: 7, subject: "OOP", type: "lecture", room: "Lecture Hall 3" },
    { time: "4:00–5:00", lect: 8, subject: "DE&T T G1 / Chemistry T G2", type: "tutorial", room: "Tutorial Rooms" },
  ],
  Thursday: [
    { time: "9:00–10:00", lect: 1, subject: "OOP", type: "lecture", room: "Lecture Hall 3" },
    { time: "10:00–11:00", lect: 2, subject: "BEE", type: "lecture", room: "Lecture Hall 2" },
    { time: "11:00–12:00", lect: 3, subject: "EG", type: "lecture", room: "Drawing Hall" },
    { time: "12:00–1:00", lect: 4, subject: "DE&T", type: "lecture", room: "Lecture Hall 2" },
    { time: "1:00–2:00", lect: 5, subject: "LUNCH BREAK", type: "break" },
    { time: "2:00–3:00", lect: 6, subject: "", type: "free" },
    { time: "3:00–4:00", lect: 7, subject: "", type: "free" }, // Lab slot - filled based on group
    { time: "4:00–5:00", lect: 8, subject: "DE&T T G2", type: "tutorial", room: "Tutorial Room 2" },
  ],
  Friday: [
    { time: "9:00–10:00", lect: 1, subject: "", type: "free" },
    { time: "10:00–11:00", lect: 2, subject: "", type: "free" }, // Lab slot - filled based on group
    { time: "11:00–12:00", lect: 3, subject: "", type: "free" }, // Lab slot - filled based on group
    { time: "12:00–1:00", lect: 4, subject: "DE&T", type: "lecture", room: "Lecture Hall 2" },
    { time: "1:00–2:00", lect: 5, subject: "LUNCH BREAK", type: "break" },
    { time: "2:00–3:00", lect: 6, subject: "", type: "free" },
    { time: "3:00–4:00", lect: 7, subject: "", type: "free" },
    { time: "4:00–5:00", lect: 8, subject: "", type: "free" },
  ],
  Saturday: [],
  Sunday: [],
};

// Lab room mapping
const LAB_ROOMS: Record<string, string> = {
  'OOP Lab': 'CS Lab',
  'Chemistry Lab': 'Chemistry Lab',
  'EG Lab': 'Drawing Hall',
  'BEE Lab': 'EE Lab',
};

// Generate timetable for a specific group
export function generateTimetableForGroup(group: GroupType): DaySchedule {
  const timetable = JSON.parse(JSON.stringify(BASE_TIMETABLE)) as DaySchedule;
  
  // Fill in lab slots based on group
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
  
  days.forEach(day => {
    const labName = getLabForDay(group, day as string);
    if (labName && timetable[day]) {
      // Find the lab slot for this day
      const daySlots = timetable[day];
      const room = LAB_ROOMS[labName as keyof typeof LAB_ROOMS] || '';
      
      if (day === 'Friday') {
        // Friday has 2-hour lab slots (10-12)
        const slot2 = daySlots.find(s => s.lect === 2);
        const slot3 = daySlots.find(s => s.lect === 3);
        if (slot2) {
          slot2.subject = labName;
          slot2.type = 'lab';
          slot2.room = room;
        }
        if (slot3) {
          slot3.subject = labName;
          slot3.type = 'lab';
          slot3.room = room;
        }
      } else {
        // Other days have 1-hour lab slot (3-4)
        const slot7 = daySlots.find(s => s.lect === 7);
        if (slot7 && slot7.type === 'free') {
          slot7.subject = labName;
          slot7.type = 'lab';
          slot7.room = room;
        }
      }
    }
  });
  
  return timetable;
}

// Default timetable (G1)
export const DEFAULT_CSE_TT = generateTimetableForGroup('G1');

// Holidays for 2025-26
export const DEFAULT_HOLIDAYS: Holiday[] = [
  { date: "2025-08-15", name: "Independence Day" },
  { date: "2025-09-04", name: "Janam Ashtami" },
  { date: "2025-10-02", name: "Mahatma Gandhi Jayanti" },
  { date: "2025-10-20", name: "Dussehra" },
  { date: "2025-10-21", name: "Dussehra (2nd day)" },
  { date: "2025-10-26", name: "Birthday of Maharishi Valmiki Ji" },
  { date: "2025-11-01", name: "Diwali" },
  { date: "2025-11-02", name: "Diwali (2nd day)" },
  { date: "2025-11-17", name: "Birthday of Guru Nanak Dev Ji" },
  { date: "2025-12-07", name: "Martyrdom Day – Guru Teg Bahadur Ji" },
  { date: "2025-12-25", name: "Christmas Day" },
  { date: "2025-12-28", name: "Shaheedi Sabha, Shri Fatehgarh Sahib" },
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-02-15", name: "Maha Shivratri" },
  { date: "2026-03-04", name: "Holi" },
  { date: "2026-03-21", name: "Id-ul-Fitr" },
  { date: "2026-03-23", name: "Shahidi Divas – Bhagat Singh Ji" },
  { date: "2026-03-26", name: "Ram Navami" },
  { date: "2026-03-31", name: "Mahavir Jayanti" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-14", name: "Vaisakhi / Dr. B.R. Ambedkar Birthday" },
  { date: "2026-05-27", name: "Id-ul-Zuha (Bakrid)" },
  { date: "2026-06-18", name: "Martyrdom Day – Guru Arjun Dev Ji" },
];

// Practical/Lab Details (same for both groups)
export const PRACTICALS: Practical[] = [
  {
    subject: "OOP Lab",
    short: "OOP",
    color: "#16A34A",
    room: "CS Lab",
    schedule: "G1: Monday 3-4 PM / G2: Tuesday 3-4 PM",
    expts: [
      "Class & Object Basics",
      "Inheritance & Polymorphism",
      "Exception Handling",
      "File I/O in Java",
      "Linked List implementation",
      "Sorting algorithm comparison",
      "GUI with Swing / JavaFX"
    ]
  },
  {
    subject: "EG Lab",
    short: "EG",
    color: "#EA580C",
    room: "Drawing Hall",
    schedule: "G2: Monday 3-4 PM / G1: Thursday 3-4 PM",
    expts: [
      "Orthographic Projection",
      "Isometric Drawing",
      "Section Views",
      "Auxiliary Views",
      "CAD intro (AutoCAD)",
      "3D Solid Modelling"
    ]
  },
  {
    subject: "Chemistry Lab",
    short: "CHEM",
    color: "#7C3AED",
    room: "Chemistry Lab",
    schedule: "G1: Tuesday 3-4 PM / G2: Friday 10-12 PM",
    expts: [
      "Acid-Base Titration",
      "Redox Titration",
      "Colorimetry",
      "Chromatography",
      "Polymer synthesis",
      "Corrosion study"
    ]
  },
  {
    subject: "BEE Lab",
    short: "BEE",
    color: "#0284C7",
    room: "EE Lab",
    schedule: "G2: Thursday 3-4 PM / G1: Friday 10-12 PM",
    expts: [
      "Kirchhoff's Laws",
      "Thevenin's Theorem",
      "Norton's Theorem",
      "RL/RC Transient Analysis",
      "Half-wave Rectifier",
      "Op-Amp basics"
    ]
  },
];

// Subject Colors
export const SUBJ_COLORS: Record<string, string> = {
  "OOP": "#16A34A",
  "Chemistry": "#7C3AED",
  "BEE": "#0284C7",
  "Physics": "#B45309",
  "EG": "#EA580C",
  "DE&T": "#2563EB",
  "PF": "#DB2777",
  "Universal": "#059669",
  "OOP Lab": "#16A34A",
  "Chemistry Lab": "#7C3AED",
  "EG Lab": "#EA580C",
  "BEE Lab": "#0284C7",
};

// Subject full names
export const SUBJ_NAMES: Record<string, string> = {
  "OOP": "Object Oriented Programming",
  "BEE": "Basic Electrical Engineering",
  "EG": "Engineering Graphics",
  "DE&T": "Digital Electronics & Theory",
  "Chemistry": "Engineering Chemistry",
  "Physics": "Engineering Physics",
  "PF": "Programming Fundamentals",
  "Universal": "Universal Human Values",
  "OOP Lab": "OOP Laboratory",
  "Chemistry Lab": "Chemistry Laboratory",
  "EG Lab": "Engineering Graphics Laboratory",
  "BEE Lab": "Basic Electrical Engineering Laboratory",
};

export const DAYS_ARR = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Time slots for adding new classes
export const TIME_SLOTS = [
  "9:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  "12:00–1:00",
  "1:00–2:00",
  "2:00–3:00",
  "3:00–4:00",
  "4:00–5:00",
];

export const SUBJECTS = ['OOP', 'BEE', 'EG', 'DE&T', 'Chemistry', 'Physics', 'Universal Human Values'];

// Get subject color
export function getSubjectColor(subject: string): string {
  for (const key of Object.keys(SUBJ_COLORS)) {
    if (subject.startsWith(key)) return SUBJ_COLORS[key];
  }
  return "#64748B";
}

// Get subject full name
export function getSubjectFullName(subject: string): string {
  for (const key of Object.keys(SUBJ_NAMES)) {
    if (subject.startsWith(key)) return SUBJ_NAMES[key];
  }
  return subject;
}
