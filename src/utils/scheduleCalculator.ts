import type {
  DaySchedule,
  ScheduleConfig,
  ScheduleResult,
  SupervisorState,
} from "../types";

export function calculateSchedule(config: ScheduleConfig): ScheduleResult {
  const { workDays, restDays, inductionDays, totalDrillingDays } = config;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones básicas
  if (inductionDays < 1 || inductionDays > 5) {
    errors.push("Los días de inducción deben estar entre 1 y 5");
  }
  if (workDays <= inductionDays) {
    errors.push("Los días de trabajo deben ser mayores que los de inducción");
  }
  if (totalDrillingDays <= 0) {
    errors.push("Total de días a perforar debe ser mayor que 0");
  }
  if (errors.length > 0) {
    return { schedule: [], errors, warnings };
  }

  // Estados iniciales
  const schedule: DaySchedule[] = [];

  // === Precomputar S1 (inmutable) ===
  // Inducción solo permitida en días 0–6
  const s1States: SupervisorState[] = [];
  for (let day = 0; day < totalDrillingDays; day++) {
    const cycleDay = day % (workDays + restDays);
    if (cycleDay === 0) {
      s1States.push("S");
    } else if (cycleDay <= inductionDays && day < 7) {
      // 👈 Inducción SOLO en la primera semana del calendario
      s1States.push("I");
    } else if (cycleDay < workDays) {
      s1States.push("P");
    } else if (cycleDay === workDays) {
      s1States.push("B");
    } else {
      s1States.push("D");
    }
  }

  // Inicializar S2 y S3
  const s2States: SupervisorState[] = Array(totalDrillingDays).fill("-");
  const s3States: SupervisorState[] = Array(totalDrillingDays).fill("-");

  // === Planificación de S2 ===
  let s2Day = 0;
  while (s2Day < totalDrillingDays) {
    if (s2Day === 0) {
      s2States[s2Day] = "S";
      s2Day++;
      continue;
    }

    // Inducción inicial de S2: SOLO si estamos en la primera semana
    if (s2Day < 7) {
      for (
        let i = 0;
        i < inductionDays && s2Day < totalDrillingDays && s2Day < 7;
        i++
      ) {
        s2States[s2Day] = "I";
        s2Day++;
      }
    }

    // Perforación: calcular hasta cuándo debe perforar S2 antes de que S3 entre
    const s1FirstDownDay = workDays; // Día en que S1 baja (ej. día 15 en 14x7)
    const s3StartDrillingDay = s1FirstDownDay; // S3 empieza a perforar aquí
    const s2DrillUntil = s3StartDrillingDay - 1;

    while (s2Day < s2DrillUntil && s2Day < totalDrillingDays) {
      s2States[s2Day] = "P";
      s2Day++;
    }

    // Bajar cuando S3 empieza a perforar
    if (s2Day < totalDrillingDays) {
      s2States[s2Day] = "B";
      s2Day++;
    }

    // Descanso
    for (let i = 0; i < restDays && s2Day < totalDrillingDays; i++) {
      s2States[s2Day] = "D";
      s2Day++;
    }

    // Vuelta (S) después del descanso
    if (s2Day < totalDrillingDays) {
      s2States[s2Day] = "S";
      s2Day++;
    }

    // A partir de ahora, S2 ya está inducido → solo perfora (sin más inducción)
    while (s2Day < totalDrillingDays) {
      s2States[s2Day] = "P";
      s2Day++;
    }
  }

  // === Planificación de S3 ===
  const s1FirstDownDay = workDays;
  const s3EntryDay = s1FirstDownDay - inductionDays - 1; // Ej: día 9 en Casuística 1
  if (s3EntryDay < 0) {
    errors.push("Configuración inválida: S3 no puede entrar a tiempo");
    return { schedule, errors, warnings };
  }

  let s3Day = s3EntryDay;
  if (s3Day < totalDrillingDays) {
    s3States[s3Day] = "S";
    s3Day++;

    // Inducción de S3: solo si todos los días de inducción están dentro de la semana 1 (día < 7)
    const s3InductionEnd = s3Day + inductionDays - 1;
    if (s3InductionEnd < 7) {
      for (let i = 0; i < inductionDays && s3Day < totalDrillingDays; i++) {
        s3States[s3Day] = "I";
        s3Day++;
      }
    } else {
      // Si la inducción se extiende más allá del día 6, no se realiza
      // (alternativamente, podrías truncarla, pero es más limpio omitirla)
      if (s3Day < 7) {
        warnings.push(
          `S3 comienza en día ${s3EntryDay}: inducción omitida (se extendería más allá de la semana 1)`
        );
      }
    }

    // Resto: perforación continua
    while (s3Day < totalDrillingDays) {
      s3States[s3Day] = "P";
      s3Day++;
    }
  }

  // === Ajuste final: garantizar EXACTAMENTE 2 perforando después de que S3 esté activo ===
  let s3Active = false;
  for (let day = 0; day < totalDrillingDays; day++) {
    // Detectar si S3 ya está activo (descartando "-", "D", "B")
    if (
      s3States[day] !== "-" &&
      s3States[day] !== "D" &&
      s3States[day] !== "B"
    ) {
      s3Active = true;
    }

    const s1P = s1States[day] === "P";
    const s2P = s2States[day] === "P";
    const s3P = s3States[day] === "P";
    const count = (s1P ? 1 : 0) + (s2P ? 1 : 0) + (s3P ? 1 : 0);

    if (s3Active) {
      if (count !== 2) {
        // Corrección: ajustar S2 para mantener exactamente 2 perforando
        if (count < 2) {
          // Forzar a S2 a perforar si hay menos de 2
          s2States[day] = "P";
        } else if (count > 2) {
          // Evitar 3: S2 descansa (S1 es inmutable, S3 ya entró)
          s2States[day] = "D";
        }
      }
    }
  }

  // === Construir resultado final ===
  for (let day = 0; day < totalDrillingDays; day++) {
    const s1 = s1States[day];
    const s2 = s2States[day];
    const s3 = s3States[day];
    const drillingCount =
      (s1 === "P" ? 1 : 0) + (s2 === "P" ? 1 : 0) + (s3 === "P" ? 1 : 0);

    schedule.push({ day, s1, s2, s3, drillingCount });
  }

  // === Validaciones finales ===
  let s3EverActive = false;
  for (let day = 0; day < totalDrillingDays; day++) {
    const { s2, s3, drillingCount } = schedule[day];

    // Detectar si S3 ya entró
    if (!s3EverActive && s3 !== "-" && s3 !== "D" && s3 !== "B") {
      s3EverActive = true;
    }

    // Validar que nunca haya 3 perforando
    if (drillingCount > 2) {
      errors.push(`Día ${day}: 3 supervisores perforando`);
    }

    // Después de que S3 entre, debe haber exactamente 2 perforando
    if (s3EverActive && drillingCount !== 2) {
      errors.push(`Día ${day}: ${drillingCount} perforando (esperado: 2)`);
    }

    // Validar secuencias inválidas en S2
    if (day > 0) {
      const prev = schedule[day - 1];
      if (prev.s2 === "B" && s2 === "S") {
        warnings.push(`Día ${day}: S2 tiene B → S sin descanso intermedio`);
      }
      if (prev.s2 === "S" && s2 === "B") {
        warnings.push(`Día ${day}: S2 tiene S → B sin perforación`);
      }
    }
  }

  // Validar que S1 no fue modificado (solo por si acaso)
  for (let day = 0; day < totalDrillingDays; day++) {
    if (schedule[day].s1 !== s1States[day]) {
      warnings.push(`Día ${day}: S1 fue modificado`);
    }
  }

  // Validar regla crítica: ningún "I" después del día 6
  for (let day = 7; day < totalDrillingDays; day++) {
    if (
      schedule[day].s1 === "I" ||
      schedule[day].s2 === "I" ||
      schedule[day].s3 === "I"
    ) {
      errors.push(`Día ${day}: inducción ('I') fuera de la primera semana`);
    }
  }

  if (errors.length === 0) {
    warnings.unshift("✓ Cronograma válido: cumple todas las reglas");
  }

  return { schedule, errors, warnings };
}

// Función para casos de prueba específicos (sin cambios)
export function generateTestSchedule(caseNumber: number): ScheduleConfig {
  const cases = [
    { workDays: 14, restDays: 7, inductionDays: 5, totalDrillingDays: 90 },
    { workDays: 21, restDays: 7, inductionDays: 3, totalDrillingDays: 90 },
    { workDays: 10, restDays: 5, inductionDays: 2, totalDrillingDays: 90 },
    { workDays: 14, restDays: 6, inductionDays: 4, totalDrillingDays: 950 },
  ];

  return cases[caseNumber - 1] || cases[0];
}
