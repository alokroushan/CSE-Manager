import { useState, useEffect } from 'react';

export function useTime(updateInterval = 30000) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, updateInterval);
    return () => clearInterval(timer);
  }, [updateInterval]);

  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const dateStr = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const dayName = now.toLocaleDateString("en-IN", { weekday: "long" });
  const shortDayName = now.toLocaleDateString("en-IN", { weekday: "short" });

  return { now, timeStr, dateStr, dayName, shortDayName };
}
