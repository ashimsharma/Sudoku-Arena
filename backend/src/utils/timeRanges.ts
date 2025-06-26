import { subDays, startOfWeek, startOfMonth } from 'date-fns';

export default function getTimeRange(time: 'daily' | 'weekly' | 'monthly' | 'allTime') {
  const now = new Date();
  switch (time) {
    case 'daily':
      return { start: subDays(now, 1), end: now };
    case 'weekly':
      return { start: startOfWeek(now), end: now };
    case 'monthly':
      return { start: startOfMonth(now), end: now };
    case 'allTime':
    default:
      return null;
  }
}