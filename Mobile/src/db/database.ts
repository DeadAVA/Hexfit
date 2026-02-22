/**
 * DB Layer para React Native (Expo) usando expo-sqlite
 * Inicializa la BD y proporciona métodos CRUD sync
 */

import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import {
  Athlete,
  Exercise,
  Program,
  ProgramDay,
  DayItem,
  DayItemWithExercise,
} from "../shared/types";
import { EXERCISE_CATALOG } from "../shared/constants/exercises_catalog";

// ID corto similar a Hexfit
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export class DatabaseSync {
  private db: SQLiteDatabase;

  constructor() {
    this.db = openDatabaseSync("hexfit.db");
    this.initDatabase();
  }

  /** ÚTIL para backup/restore (sin hack database["db"]) */
  getRawDb(): SQLiteDatabase {
    return this.db;
  }

  private initDatabase() {
    try {
      // Habilitar FK
      this.db.execSync("PRAGMA foreign_keys = ON;");

      // TABLA: ATHLETES
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS athletes (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER NOT NULL CHECK(age >= 1 AND age <= 120),
          sex TEXT NOT NULL CHECK(sex IN ('M','F','X')),
          avatar_seed TEXT NOT NULL,
          birth_date TEXT,
          height TEXT,
          weight TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // TABLA: EXERCISES
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS exercises (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          muscle_group TEXT NOT NULL,
          equipment TEXT NOT NULL,
          image_uri TEXT NOT NULL,
          is_custom INTEGER NOT NULL DEFAULT 0,
          description TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
        CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
      `);

      // TABLA: PROGRAMS
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS programs (
          id TEXT PRIMARY KEY,
          athlete_id TEXT NOT NULL,
          name TEXT NOT NULL,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
        );
      `);

      // TABLA: PROGRAM_DAYS
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS program_days (
          id TEXT PRIMARY KEY,
          program_id TEXT NOT NULL,
          day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 6),
          title TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(program_id, day_of_week),
          FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
        );
      `);

      // TABLA: DAY_ITEMS
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS day_items (
          id TEXT PRIMARY KEY,
          program_day_id TEXT NOT NULL,
          exercise_id TEXT NOT NULL,
          order_index INTEGER NOT NULL DEFAULT 0,
          sets INTEGER NOT NULL CHECK(sets BETWEEN 1 AND 50),
          reps_min INTEGER NOT NULL CHECK(reps_min BETWEEN 1 AND 200),
          reps_max INTEGER NOT NULL CHECK(reps_max BETWEEN 1 AND 200),
          rest_seconds INTEGER NOT NULL CHECK(rest_seconds BETWEEN 0 AND 3600),
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (program_day_id) REFERENCES program_days(id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
        );
        CREATE INDEX IF NOT EXISTS idx_day_items_day ON day_items(program_day_id);
      `);

      // Seed de ejercicios predefinidos (solo si no existen)
      this.seedExercises();

      // Migración: agregar nuevas columnas si no existen
      this.migrateDatabase();
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  private migrateDatabase() {
    try {
      // Verificar si las columnas nuevas existen
      const columns = this.db.getAllSync<{ name: string }>(
        "PRAGMA table_info(athletes);"
      );
      const columnNames = columns.map((c) => c.name);

      // Agregar birth_date si no existe
      if (!columnNames.includes("birth_date")) {
        this.db.execSync("ALTER TABLE athletes ADD COLUMN birth_date TEXT;");
        console.log("✅ Columna birth_date agregada");
      }

      // Agregar height si no existe
      if (!columnNames.includes("height")) {
        this.db.execSync("ALTER TABLE athletes ADD COLUMN height TEXT;");
        console.log("✅ Columna height agregada");
      }

      // Agregar weight si no existe
      if (!columnNames.includes("weight")) {
        this.db.execSync("ALTER TABLE athletes ADD COLUMN weight TEXT;");
        console.log("✅ Columna weight agregada");
      }
    } catch (error) {
      console.error("Error en migración:", error);
    }
  }

  private seedExercises() {
    try {
      const now = getCurrentTimestamp();
      // Actualizar o insertar ejercicios predefinidos
      for (const exercise of EXERCISE_CATALOG) {
        // Verificar si existe
        const existing = this.db.getFirstSync<{ id: string; created_at: string }>(
          "SELECT id, created_at FROM exercises WHERE id = ?;",
          [exercise.id]
        );
        
        if (existing) {
          // Actualizar ejercicio existente (mantener created_at original)
          this.db.runSync(
            `
            UPDATE exercises 
            SET name = ?, muscle_group = ?, equipment = ?, image_uri = ?, description = ?, updated_at = ?
            WHERE id = ? AND is_custom = 0;
          `,
            [
              exercise.name,
              exercise.muscle_group,
              exercise.equipment,
              exercise.image_url,
              exercise.description || null,
              now,
              exercise.id,
            ]
          );
        } else {
          // Insertar nuevo ejercicio
          this.db.runSync(
            `
            INSERT INTO exercises 
            (id, name, muscle_group, equipment, image_uri, is_custom, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?);
          `,
            [
              exercise.id,
              exercise.name,
              exercise.muscle_group,
              exercise.equipment,
              exercise.image_url,
              exercise.description || null,
              now,
              now,
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error seeding exercises:", error);
    }
  }

  // ===== ATHLETES =====
  createAthlete(
    name: string,
    age: number,
    sex: "M" | "F" | "X",
    birthDate?: string,
    height?: string,
    weight?: string
  ): Athlete {
    const id = generateId();
    const now = getCurrentTimestamp();
    this.db.runSync(
      `
      INSERT INTO athletes (id, name, age, sex, avatar_seed, birth_date, height, weight, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
      [id, name, age, sex, id, birthDate || null, height || null, weight || null, now, now]
    );
    return {
      id,
      name,
      age,
      sex,
      avatar_seed: id,
      birth_date: birthDate,
      height,
      weight,
      created_at: now,
      updated_at: now,
    };
  }

  getAthletes(): Athlete[] {
    return (
      this.db.getAllSync<Athlete>("SELECT * FROM athletes ORDER BY name;") || []
    );
  }

  getAthleteById(id: string): Athlete | null {
    return (
      this.db.getFirstSync<Athlete>("SELECT * FROM athletes WHERE id = ?;", [
        id,
      ]) || null
    );
  }

  updateAthlete(
    id: string,
    name: string,
    age: number,
    sex: "M" | "F" | "X",
    birthDate?: string,
    height?: string,
    weight?: string
  ) {
    const now = getCurrentTimestamp();
    this.db.runSync(
      "UPDATE athletes SET name = ?, age = ?, sex = ?, birth_date = ?, height = ?, weight = ?, updated_at = ? WHERE id = ?;",
      [name, age, sex, birthDate || null, height || null, weight || null, now, id]
    );
  }

  deleteAthlete(id: string) {
    this.db.runSync("DELETE FROM athletes WHERE id = ?;", [id]);
  }

  // ===== EXERCISES =====
  getExercises(filters?: {
    muscle_group?: string;
    equipment?: string;
    search?: string;
    is_custom?: number;
  }): Exercise[] {
    let query = "SELECT * FROM exercises WHERE 1=1";
    const params: any[] = [];

    if (filters?.muscle_group) {
      query += " AND muscle_group = ?";
      params.push(filters.muscle_group);
    }
    if (filters?.equipment) {
      query += " AND equipment = ?";
      params.push(filters.equipment);
    }
    if (filters?.search) {
      query += " AND name LIKE ?";
      params.push(`%${filters.search}%`);
    }
    if (filters?.is_custom !== undefined) {
      query += " AND is_custom = ?";
      params.push(filters.is_custom);
    }

    query += " ORDER BY muscle_group, name;";
    return this.db.getAllSync<Exercise>(query, params) || [];
  }

  getExerciseById(id: string): Exercise | null {
    return (
      this.db.getFirstSync<Exercise>("SELECT * FROM exercises WHERE id = ?;", [
        id,
      ]) || null
    );
  }

  createCustomExercise(
    name: string,
    muscle_group: string,
    equipment: string,
    image_uri: string
  ): Exercise {
    const id = generateId();
    const now = getCurrentTimestamp();
    this.db.runSync(
      `
      INSERT INTO exercises 
      (id, name, muscle_group, equipment, image_uri, is_custom, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?);
    `,
      [id, name, muscle_group, equipment, image_uri, now, now]
    );
    return {
      id,
      name,
      muscle_group,
      equipment,
      image_uri,
      is_custom: 1,
      created_at: now,
      updated_at: now,
    };
  }

  updateExercise(id: string, name: string, muscle_group: string, equipment: string) {
    const now = getCurrentTimestamp();
    this.db.runSync(
      "UPDATE exercises SET name = ?, muscle_group = ?, equipment = ?, updated_at = ? WHERE id = ?;",
      [name, muscle_group, equipment, now, id]
    );
  }

  deleteExercise(id: string) {
    this.db.runSync("DELETE FROM exercises WHERE id = ? AND is_custom = 1;", [id]);
  }

  // ===== PROGRAMS =====
  createProgram(athlete_id: string, name: string, notes?: string): Program {
    const id = generateId();
    const now = getCurrentTimestamp();
    this.db.runSync(
      `
      INSERT INTO programs (id, athlete_id, name, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `,
      [id, athlete_id, name, notes || null, now, now]
    );
    return { id, athlete_id, name, notes, created_at: now, updated_at: now };
  }

  getPrograms(athlete_id?: string): Program[] {
    let query = "SELECT * FROM programs WHERE 1=1";
    const params: any[] = [];

    if (athlete_id) {
      query += " AND athlete_id = ?";
      params.push(athlete_id);
    }

    query += " ORDER BY created_at DESC;";
    return this.db.getAllSync<Program>(query, params) || [];
  }

  getProgramById(id: string): Program | null {
    return (
      this.db.getFirstSync<Program>("SELECT * FROM programs WHERE id = ?;", [
        id,
      ]) || null
    );
  }

  updateProgram(id: string, name: string, notes?: string) {
    const now = getCurrentTimestamp();
    this.db.runSync(
      "UPDATE programs SET name = ?, notes = ?, updated_at = ? WHERE id = ?;",
      [name, notes || null, now, id]
    );
  }

  deleteProgram(id: string) {
    this.db.runSync("DELETE FROM programs WHERE id = ?;", [id]);
  }

  // ===== PROGRAM_DAYS =====
  createProgramDay(program_id: string, day_of_week: number, title?: string): ProgramDay {
    const id = generateId();
    const now = getCurrentTimestamp();
    this.db.runSync(
      `
      INSERT INTO program_days (id, program_id, day_of_week, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `,
      [id, program_id, day_of_week, title || null, now, now]
    );
    return { id, program_id, day_of_week, title, created_at: now, updated_at: now };
  }

  getProgramDays(program_id: string): ProgramDay[] {
    return (
      this.db.getAllSync<ProgramDay>(
        "SELECT * FROM program_days WHERE program_id = ? ORDER BY day_of_week;",
        [program_id]
      ) || []
    );
  }

  getProgramDay(program_id: string, day_of_week: number): ProgramDay | null {
    return (
      this.db.getFirstSync<ProgramDay>(
        "SELECT * FROM program_days WHERE program_id = ? AND day_of_week = ?;",
        [program_id, day_of_week]
      ) || null
    );
  }

  updateProgramDay(id: string, title?: string) {
    const now = getCurrentTimestamp();
    this.db.runSync("UPDATE program_days SET title = ?, updated_at = ? WHERE id = ?;", [
      title || null,
      now,
      id,
    ]);
  }

  deleteProgramDay(id: string) {
    this.db.runSync("DELETE FROM program_days WHERE id = ?;", [id]);
  }

  // ===== DAY_ITEMS =====
  createDayItem(
    program_day_id: string,
    exercise_id: string,
    order_index: number,
    sets: number,
    reps_min: number,
    reps_max: number,
    rest_seconds: number,
    notes?: string
  ): DayItem {
    const id = generateId();
    const now = getCurrentTimestamp();

    this.db.runSync(
      `
      INSERT INTO day_items 
      (id, program_day_id, exercise_id, order_index, sets, reps_min, reps_max, rest_seconds, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
      [
        id,
        program_day_id,
        exercise_id,
        order_index,
        sets,
        reps_min,
        reps_max,
        rest_seconds,
        notes || null,
        now,
        now,
      ]
    );

    return {
      id,
      program_day_id,
      exercise_id,
      order_index,
      sets,
      reps_min,
      reps_max,
      rest_seconds,
      notes,
      created_at: now,
      updated_at: now,
    };
  }

  getDayItems(program_day_id: string): DayItem[] {
    return (
      this.db.getAllSync<DayItem>(
        "SELECT * FROM day_items WHERE program_day_id = ? ORDER BY order_index;",
        [program_day_id]
      ) || []
    );
  }

  getDayItemsWithExercises(program_day_id: string): DayItemWithExercise[] {
    const rows =
      this.db.getAllSync<any>(
        `
        SELECT 
          di.*,
          e.id as ex_id,
          e.name as ex_name,
          e.muscle_group as ex_muscle_group,
          e.equipment as ex_equipment,
          e.image_uri as ex_image_uri,
          e.is_custom as ex_is_custom,
          e.created_at as ex_created_at,
          e.updated_at as ex_updated_at
        FROM day_items di
        LEFT JOIN exercises e ON di.exercise_id = e.id
        WHERE di.program_day_id = ?
        ORDER BY di.order_index;
      `,
        [program_day_id]
      ) || [];

    return rows.map((row: any) => ({
      id: row.id,
      program_day_id: row.program_day_id,
      exercise_id: row.exercise_id,
      order_index: row.order_index,
      sets: row.sets,
      reps_min: row.reps_min,
      reps_max: row.reps_max,
      rest_seconds: row.rest_seconds,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      exercise: row.ex_name
        ? {
            id: row.ex_id,
            name: row.ex_name,
            muscle_group: row.ex_muscle_group,
            equipment: row.ex_equipment,
            image_uri: row.ex_image_uri,
            is_custom: row.ex_is_custom,
            created_at: row.ex_created_at,
            updated_at: row.ex_updated_at,
          }
        : undefined,
    }));
  }

  updateDayItem(
    id: string,
    sets: number,
    reps_min: number,
    reps_max: number,
    rest_seconds: number,
    notes?: string,
    order_index?: number
  ) {
    const now = getCurrentTimestamp();
    const oi = typeof order_index === "number" ? order_index : 0;

    this.db.runSync(
      `
      UPDATE day_items 
      SET sets = ?, reps_min = ?, reps_max = ?, rest_seconds = ?, notes = ?, order_index = ?, updated_at = ? 
      WHERE id = ?;
    `,
      [sets, reps_min, reps_max, rest_seconds, notes || null, oi, now, id]
    );
  }

  deleteDayItem(id: string) {
    this.db.runSync("DELETE FROM day_items WHERE id = ?;", [id]);
  }

  // ===== UTILITIES =====
  clearAllData() {
    this.db.execSync("DELETE FROM day_items;");
    this.db.execSync("DELETE FROM program_days;");
    this.db.execSync("DELETE FROM programs;");
    this.db.execSync("DELETE FROM athletes;");
    this.db.execSync("DELETE FROM exercises WHERE is_custom = 1;");
  }
}

// Singleton instance
export const database = new DatabaseSync();
