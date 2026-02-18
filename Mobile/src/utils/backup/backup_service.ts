// src/utils/backup/backup_service.ts
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { database } from "../../db/database";

// ✅ CORRECCIÓN: (FileSystem as any) evita el error si TS no encuentra la definición
const BASE_DIR = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? null;

// En web normalmente será null -> deshabilitamos backups sin crashear
const BACKUP_DIR = BASE_DIR ? `${BASE_DIR}backups/` : null;

function backupsSupported() {
  return Platform.OS !== "web" && !!BACKUP_DIR;
}

async function ensureDir() {
  if (!backupsSupported()) {
    throw new Error(
      "Backups no soportados en esta plataforma (documentDirectory/cacheDirectory es null)."
    );
  }

  const info = await FileSystem.getInfoAsync(BACKUP_DIR!);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BACKUP_DIR!, { intermediates: true });
  }
}

function safeParseJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Backup inválido (JSON corrupto).");
  }
}

export const backupService = {
  // Ruta base accesible públicamente (útil para debug en UI)
  BACKUP_DIR: BACKUP_DIR ?? "backups/",

  isSupported() {
    return backupsSupported();
  },

  getBackupPath(filename: string) {
    if (!BACKUP_DIR) return `backups/${filename}`;
    return `${BACKUP_DIR}${filename}`;
  },

  async listBackups(): Promise<string[]> {
    if (!backupsSupported()) return [];

    await ensureDir();
    const files = await FileSystem.readDirectoryAsync(BACKUP_DIR!);
    return files
      .filter((f) => f.toLowerCase().endsWith(".json"))
      .sort()
      .reverse();
  },

  async deleteBackup(filename: string) {
    await ensureDir();
    await FileSystem.deleteAsync(`${BACKUP_DIR!}${filename}`, { idempotent: true });
  },

  async createBackup(source: string): Promise<string> {
    await ensureDir();

    // Recolectamos toda la data
    const payload: any = {
      meta: { source, created_at: new Date().toISOString(), version: 1 },
      athletes: database.getAthletes(),
      exercises_custom: database.getExercises({ is_custom: 1 }),
      programs: database.getPrograms(),
      program_days: [] as any[],
      day_items: [] as any[],
    };

    // Llenamos datos relacionales
    for (const p of payload.programs) {
      const days = database.getProgramDays(p.id);
      payload.program_days.push(...days);

      for (const d of days) {
        const items = database.getDayItemsWithExercises(d.id).map((x: any) => {
          // Desacoplamos 'exercise' (objeto completo) para guardar solo IDs y datos puros
          const { exercise, ...rest } = x; 
          return rest;
        });
        payload.day_items.push(...items);
      }
    }

    const filename = `hexfit_${source}_${Date.now()}.json`;
    const path = `${BACKUP_DIR!}${filename}`;

    // Escribimos el archivo
    await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2)); // null, 2 para que sea legible en PC
    
    console.log("Backup creado en:", path);
    return path; 
  },

  async restoreBackup(uri: string): Promise<void> {
    // Leemos el archivo desde la URI (puede venir de DocumentPicker o ruta interna)
    const raw = await FileSystem.readAsStringAsync(uri);
    const data = safeParseJson(raw);

    if (!data?.meta || !Array.isArray(data.athletes)) {
      throw new Error("Backup inválido (estructura incorrecta).");
    }

    database.clearAllData();

    const ts = new Date().toISOString();
    // Acceso crudo a la DB para inserciones masivas
    const rawDb = (database as any).db as any;
    if (!rawDb?.runSync) {
      throw new Error("DB no disponible para restauración.");
    }

    // Usamos transacciones implícitas al insertar
    // NOTA: Si agregaste nuevas columnas a la tabla athletes (height, weight, birth_date),
    // asegúrate de actualizar este INSERT. Aquí pongo el genérico actualizado:
    
    for (const a of data.athletes) {
      // Intentamos insertar con los campos nuevos si existen en el JSON, sino nulos
      // AJUSTA ESTA QUERY SEGÚN TU SCHEMA REAL DE SQLITE
      try {
          rawDb.runSync(
            `INSERT INTO athletes(id,name,age,sex,avatar_seed,created_at,updated_at) 
             VALUES (?,?,?,?,?,?,?)`,
            [
                a.id, 
                a.name, 
                a.age, 
                a.sex, 
                a.avatar_seed ?? a.id, 
                a.created_at ?? ts, 
                a.updated_at ?? ts
                // Si agregas columnas en SQL, añádelas aquí: a.height, a.weight, a.birth_date
            ]
          );
      } catch (e) {
          console.error("Error restaurando atleta:", e);
      }
    }

    // Restaurar Ejercicios Custom
    for (const e of data.exercises_custom ?? []) {
      rawDb.runSync(
        "INSERT INTO exercises(id,name,muscle_group,equipment,image_uri,is_custom,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)",
        [e.id, e.name, e.muscle_group, e.equipment, e.image_uri, e.created_at ?? ts, e.updated_at ?? ts]
      );
    }

    // Restaurar Programas
    for (const p of data.programs ?? []) {
      rawDb.runSync(
        "INSERT INTO programs(id,athlete_id,name,notes,created_at,updated_at) VALUES (?,?,?,?,?,?)",
        [p.id, p.athlete_id, p.name, p.notes ?? null, p.created_at ?? ts, p.updated_at ?? ts]
      );
    }

    // Restaurar Días
    for (const d of data.program_days ?? []) {
      rawDb.runSync(
        "INSERT INTO program_days(id,program_id,day_of_week,title,created_at,updated_at) VALUES (?,?,?,?,?,?)",
        [d.id, d.program_id, d.day_of_week, d.title ?? null, d.created_at ?? ts, d.updated_at ?? ts]
      );
    }

    // Restaurar Items del día
    for (const it of data.day_items ?? []) {
      rawDb.runSync(
        `INSERT INTO day_items
          (id,program_day_id,exercise_id,order_index,sets,reps_min,reps_max,rest_seconds,notes,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          it.id,
          it.program_day_id,
          it.exercise_id,
          it.order_index ?? 0,
          it.sets,
          it.reps_min,
          it.reps_max,
          it.rest_seconds ?? 0,
          it.notes ?? null,
          it.created_at ?? ts,
          it.updated_at ?? ts,
        ]
      );
    }
  },
};