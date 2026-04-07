import { registerEnumType } from '@nestjs/graphql';
import { DayOfWeek } from '../constants/day-of-week.enum';

export const DEFAULT_SHIFTS_CONFIG = {
  MORNING: {
    name: 'Turno 1 (Matutino)',
    startTime: '06:00:',
    endTime: '14:00:',
    workDays: [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ],
  },
  AFTERNOON: {
    name: 'Turno 2 (Vespertino)',
    startTime: '14:00:',
    endTime: '22:00:',
    workDays: [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ],
  },
  NIGHT: {
    name: 'Turno 3 (Nocturno)',
    startTime: '22:00:',
    endTime: '06:00:',
    workDays: [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ],
  },
  MIXED: {
    name: 'Turno Mixto / Administrativo',
    startTime: '08:00:',
    endTime: '17:00:',
    workDays: [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
    ],
  },
} as const;

export enum ShiftTypeEnum {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  MIXED = 'MIXED',
}

registerEnumType(ShiftTypeEnum, { name: 'ShiftType' });
export type ShiftType = keyof typeof DEFAULT_SHIFTS_CONFIG;
