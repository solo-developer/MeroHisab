export type ReportRange = "last_7_days" | "this_week" | "this_month" | "previous_month";

export function getRangeDates(range: ReportRange): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  // Reset time for start/end to be inclusive
  // Standardizing on local time for consistency
  endDate.setHours(23, 59, 59, 999);

  switch (range) {
    case "last_7_days":
      startDate.setDate(now.getDate() - 6); // Includes today + 6 previous days
      startDate.setHours(0, 0, 0, 0);
      break;
    case "this_week":
      const day = now.getDay();
      startDate.setDate(now.getDate() - day); // start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      break;
    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "previous_month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  return { startDate, endDate };
}

export const toSQLDate = (date?: Date) => {
  if (!date) return undefined;
  // Use local time components for SQL date comparison to match user's perspective
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const toSQLDateTime = (date?: Date) => {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

/**
 * Parses a YYYY-MM-DD string into a safe local Date object
 */
export const parseSQLDate = (dateStr: string): Date => {
  const parts = dateStr.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

/**
 * Formats a YYYY-MM-DD string for display
 */
export const formatDisplayDate = (dateStr: string): string => {
  return parseSQLDate(dateStr).toLocaleDateString();
};