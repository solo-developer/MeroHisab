export type ReportRange = "this_week" | "this_month" | "previous_month";

export function getRangeDates(range: ReportRange): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (range) {
      case "this_week":
        const day = now.getDay();
        startDate.setDate(now.getDate() - day); // start of week (Sunday)
        endDate = now;
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "previous_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }
    return { startDate, endDate };
  }