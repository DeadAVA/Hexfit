/**
 * Tipos compartidos entre Mobile y Desktop
 */

export interface Athlete {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F" | "X";
  avatar_seed: string;
  birth_date?: string;
  height?: string;
  weight?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  image_uri: string;
  is_custom: number; // 0=fijo, 1=custom
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  athlete_id: string;
  name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramDay {
  id: string;
  program_id: string;
  day_of_week: number; // 1=Lunes ... 6=Sábado
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface DayItem {
  id: string;
  program_day_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DayItemWithExercise extends DayItem {
  exercise?: Exercise;
}

export interface ProgramWithDays extends Program {
  days?: ProgramDay[];
  athlete?: Athlete;
}

export interface BackupExport {
  app: string;
  schema_version: number;
  exported_at: string;
  device_id: string;
}

export const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export function getDayLabel(dayOfWeek: number): string {
  const day = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek);
  return day ? day.label : `Día ${dayOfWeek}`;
}
