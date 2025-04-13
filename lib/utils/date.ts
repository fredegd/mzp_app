import type { WeekRange } from "@/types/meal-planner";

/**
 * Format a date in YYYY-MM-DD format for database
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a date in human readable format
 */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get the day name (Mon, Tue, etc.)
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Get the week range (Sunday to Saturday) for a given date
 */
export function getWeekRange(date: Date): WeekRange {
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday

  const start = new Date(date);
  // Set to previous Sunday (or same day if it's Sunday)
  start.setDate(date.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  // Set to next Saturday
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get the previous date
 */
export function getPreviousDate(date: Date, days: number = 1): Date {
  const result = new Date(date);
  result.setDate(date.getDate() - days);
  return result;
}

/**
 * Get the next date
 */
export function getNextDate(date: Date, days: number = 1): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

/**
 * Format a date in format for display in UI
 */
export function formatDateForUI(date: Date): string {
  const today = new Date();
  const yesterday = getPreviousDate(today);
  const tomorrow = getNextDate(today);

  if (formatDate(date) === formatDate(today)) {
    return "Today";
  } else if (formatDate(date) === formatDate(yesterday)) {
    return "Yesterday";
  } else if (formatDate(date) === formatDate(tomorrow)) {
    return "Tomorrow";
  } else {
    return formatDisplayDate(date);
  }
}

export function getDaysInWeek(startDate: Date): Date[] {
  const days = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
