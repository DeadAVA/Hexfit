import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("app.db");

export function nowIso() {
  return new Date().toISOString();
}
