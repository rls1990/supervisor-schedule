import type {
  DaySchedule,
  ScheduleConfig,
  ScheduleResult,
  SupervisorState,
} from "../types";

export function calculateSchedule(config: ScheduleConfig): ScheduleResult {
  const { workDays, restDays, inductionDays, totalDrillingDays } = config;
  const schedule: DaySchedule[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Calcular días reales de descanso
  const realRestDays = restDays - 2;

  // Calcular días de perforación por ciclo para S1
  const drillingDaysPerCycle = workDays - 1 - inductionDays;

  // Inicializar estados
  const s1Schedule: SupervisorState[] = [];
  const s2Schedule: SupervisorState[] = [];
  const s3Schedule: SupervisorState[] = [];

  // Calcular día en que S1 baja por primera vez
  const s1FirstDownDay = workDays; // Día N

  // Calcular día en que S3 debe entrar
  const s3EntryDay = s1FirstDownDay - inductionDays - 1;

  // Calcular día en que S3 empieza a perforar
  const s3StartDrillingDay = s3EntryDay + 1 + inductionDays;

  // Generar ciclo base
  const baseCycle: SupervisorState[] = [];

  // Día 0: Subida (S)
  baseCycle.push("S");

  // Días de inducción (I)
  for (let i = 0; i < inductionDays; i++) {
    baseCycle.push("I");
  }

  // Días de perforación (P)
  for (let i = 0; i < drillingDaysPerCycle; i++) {
    baseCycle.push("P");
  }

  // Día final del ciclo de trabajo: Bajada (B)
  baseCycle.push("B");

  // Días de descanso (D)
  for (let i = 0; i < realRestDays; i++) {
    baseCycle.push("D");
  }

  const cycleLength = baseCycle.length; // N + M días

  // Generar cronograma para S1 (ciclo fijo)
  let day = 0;
  while (s1Schedule.length < totalDrillingDays) {
    const cycleDay = day % cycleLength;
    s1Schedule.push(baseCycle[cycleDay]);
    day++;
  }

  // Generar cronograma para S3 (desfasado)
  day = 0;
  while (s3Schedule.length < totalDrillingDays) {
    // S3 comienza en su día de entrada
    if (day < s3EntryDay) {
      s3Schedule.push("-");
    } else {
      const s3CycleDay = (day - s3EntryDay) % cycleLength;
      s3Schedule.push(baseCycle[s3CycleDay]);
    }
    day++;
  }

  // Generar cronograma para S2 (ajustable)
  day = 0;
  while (s2Schedule.length < totalDrillingDays) {
    if (day === 0) {
      // Día 0: S2 comienza con S1
      s2Schedule.push("S");
    } else if (day < inductionDays + 1) {
      // Días de inducción
      s2Schedule.push("I");
    } else if (day < s3StartDrillingDay - 1) {
      // Perforación hasta que S3 empieza
      s2Schedule.push("P");
    } else if (day === s3StartDrillingDay - 1) {
      // S2 baja antes de que S3 empiece a perforar
      s2Schedule.push("B");
    } else {
      // Ajustar S2 para mantener 2 perforando
      const s1State = s1Schedule[day];
      const s3State = s3Schedule[day];

      // Contar perforaciones actuales
      let drillingCount = 0;
      if (s1State === "P") drillingCount++;
      if (s3State === "P") drillingCount++;

      // Determinar estado de S2
      if (drillingCount === 2) {
        // Ya hay 2 perforando, S2 puede descansar o estar en transición
        const prevState = s2Schedule[day - 1];
        if (prevState === "B") {
          s2Schedule.push("D");
        } else if (prevState === "D") {
          // Verificar si necesita volver a subir
          const futureS1 =
            day + 1 < totalDrillingDays ? s1Schedule[day + 1] : "-";
          const futureS3 =
            day + 1 < totalDrillingDays ? s3Schedule[day + 1] : "-";
          const futureDrilling =
            (futureS1 === "P" ? 1 : 0) + (futureS3 === "P" ? 1 : 0);

          if (futureDrilling < 2) {
            s2Schedule.push("S");
          } else {
            s2Schedule.push("D");
          }
        } else {
          s2Schedule.push("D");
        }
      } else if (drillingCount === 1) {
        // Necesitamos que S2 perfore
        s2Schedule.push("P");
      } else {
        // No hay perforaciones, S2 debe perforar (pero esto no debería pasar)
        s2Schedule.push("P");
      }
    }
    day++;
  }

  // Asegurar que S2 tenga ciclos válidos (evitar S-S, S-B, etc.)
  for (let i = 1; i < s2Schedule.length; i++) {
    const prev = s2Schedule[i - 1];
    const current = s2Schedule[i];

    // Evitar S-S (dos subidas seguidas)
    if (prev === "B" && current === "S") {
      // Insertar día de descanso si es necesario
      if (i > 1 && s2Schedule[i - 2] !== "D") {
        s2Schedule[i - 1] = "D";
        s2Schedule[i] = "B";
      }
    }

    // Evitar S-B (subida y bajada sin perforar)
    if (prev === "S" && current === "B") {
      // Insertar días de perforación
      const drillingNeeded = Math.max(3, drillingDaysPerCycle);
      for (let j = 0; j < drillingNeeded && i + j < s2Schedule.length; j++) {
        s2Schedule[i + j] = "P";
      }
      // Marcar bajada después
      if (i + drillingNeeded < s2Schedule.length) {
        s2Schedule[i + drillingNeeded] = "B";
      }
    }
  }

  // Construir cronograma completo
  for (let day = 0; day < totalDrillingDays; day++) {
    const s1 = s1Schedule[day];
    const s2 = s2Schedule[day];
    const s3 = s3Schedule[day];

    // Contar perforaciones
    let drillingCount = 0;
    if (s1 === "P") drillingCount++;
    if (s2 === "P") drillingCount++;
    if (s3 === "P") drillingCount++;

    schedule.push({
      day,
      s1,
      s2,
      s3,
      drillingCount,
    });
  }

  // Validaciones
  let s3Active = false;
  for (const daySchedule of schedule) {
    // Verificar si S3 ya está activo
    if (daySchedule.s3 !== "-" && daySchedule.s3 !== "D") {
      s3Active = true;
    }

    // Error: 3 perforando
    if (daySchedule.drillingCount > 2) {
      errors.push(
        `Día ${daySchedule.day}: 3 supervisores perforando simultáneamente`
      );
    }

    // Error: 1 perforando cuando S3 ya está activo
    if (s3Active && daySchedule.drillingCount < 2) {
      errors.push(
        `Día ${daySchedule.day}: Solo ${daySchedule.drillingCount} supervisor(es) perforando`
      );
    }

    // Validar patrones inválidos en S2
    if (daySchedule.day > 0) {
      const prevDay = schedule[daySchedule.day - 1];

      // Advertencia: S-S (subidas consecutivas)
      if (prevDay.s2 === "B" && daySchedule.s2 === "S") {
        warnings.push(
          `Día ${daySchedule.day}: S2 con subida consecutiva (S-S)`
        );
      }

      // Error: S-B (sube y baja sin perforar)
      if (prevDay.s2 === "S" && daySchedule.s2 === "B") {
        errors.push(
          `Día ${daySchedule.day}: S2 sube y baja sin perforar (S-B)`
        );
      }
    }
  }

  return { schedule, errors, warnings };
}

// Función para casos de prueba específicos
export function generateTestSchedule(caseNumber: number): ScheduleConfig {
  const cases = [
    { workDays: 14, restDays: 7, inductionDays: 5, totalDrillingDays: 90 },
    { workDays: 21, restDays: 7, inductionDays: 3, totalDrillingDays: 90 },
    { workDays: 10, restDays: 5, inductionDays: 2, totalDrillingDays: 90 },
    { workDays: 14, restDays: 6, inductionDays: 4, totalDrillingDays: 95 },
  ];

  return cases[caseNumber - 1] || cases[0];
}
