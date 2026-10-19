const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export interface ScheduleDate {
  iso: string; dayName: string; dateNum: string; monthName: string; isWeekend: boolean; formatted: string;
}

export function generate7DaySchedule(): ScheduleDate[] {
  const now = new Date(); const out: ScheduleDate[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i); d.setHours(0,0,0,0);
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const day = d.getDay();
    out.push({
      iso, dayName: DAYS[day], dateNum: String(d.getDate()).padStart(2,'0'),
      monthName: MONTHS[d.getMonth()], isWeekend: day === 0 || day === 6,
      formatted: `${DAYS[day]} ${MONTHS[d.getMonth()]} ${d.getDate()}`,
    });
  }
  return out;
}
