import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dayName(): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

export function fmtDate(ds: string): string {
  return new Date(ds).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function fmtShort(ds: string): string {
  return new Date(ds).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

export function daysUntil(ds: string): number {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(ds);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

// Time utilities
export function timeToMins(t: string): number {
  const raw = t.trim().toLowerCase().replace(/\./g, "");
  const hasAm = /\bam\b/.test(raw);
  const hasPm = /\bpm\b/.test(raw);
  const cleaned = raw.replace(/\s*(am|pm)\s*/g, "").trim();
  const [hRaw, mRaw = "0"] = cleaned.split(":");

  let h = Number(hRaw);
  const m = Number(mRaw) || 0;

  // Timetable entries are daytime slots. Without explicit meridiem,
  // map 1-7 to PM so 3:00 is interpreted as 15:00, not 03:00.
  if (hasAm || hasPm) {
    h = h % 12;
    if (hasPm) h += 12;
  } else if (h >= 1 && h <= 7) {
    h += 12;
  }

  return h * 60 + m;
}

function splitRange(range: string): [string, string] {
  const [start, end = start] = range.split(/\s*[–-]\s*/);
  return [start.trim(), end.trim()];
}

export function getRangeStartMins(range: string): number {
  const [start] = splitRange(range);
  return timeToMins(start);
}

export function getRangeEndMins(range: string): number {
  const [, end] = splitRange(range);
  return timeToMins(end);
}

function formatClock(t: string): string {
  const mins = timeToMins(t);
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 || 12;
  return `${h12}:${pad(m)} ${period}`;
}

export function formatTimeRange(range: string): string {
  const [start, end] = splitRange(range);
  return `${formatClock(start)} - ${formatClock(end)}`;
}

export function getCurrentSlot<T extends { time: string; subject: string; type: string }>(slots: T[]): T | null {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  
  for (const sl of slots) {
    if (!sl.subject || sl.type === "free") continue;
    const sm = getRangeStartMins(sl.time);
    const em = getRangeEndMins(sl.time);
    if (mins >= sm && mins < em) return sl;
  }
  return null;
}

export function getNextSlot<T extends { time: string; subject: string; type: string }>(slots: T[]): T | null {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  
  for (const sl of slots) {
    if (!sl.subject || sl.type === "free" || sl.type === "break") continue;
    if (getRangeStartMins(sl.time) > mins) return sl;
  }
  return null;
}

export function getTimeUntilSlot(slot: { time: string }): string {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const slotMins = getRangeStartMins(slot.time);
  const diff = slotMins - mins;
  
  if (diff <= 0) return "Started";
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

// Animation utilities
export function getStaggerDelay(index: number, baseDelay = 0.06): string {
  return `${index * baseDelay}s`;
}
