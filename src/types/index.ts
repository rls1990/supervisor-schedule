export interface ScheduleConfig {
  workDays: number; // N
  restDays: number; // M
  inductionDays: number; // I (1-5)
  totalDrillingDays: number; // Días totales a perforar
}

export type SupervisorState = "S" | "I" | "P" | "B" | "D" | "-";

export interface DaySchedule {
  day: number;
  s1: SupervisorState;
  s2: SupervisorState;
  s3: SupervisorState;
  drillingCount: number;
}

export interface ScheduleResult {
  schedule: DaySchedule[];
  errors: string[];
  warnings: string[];
}
