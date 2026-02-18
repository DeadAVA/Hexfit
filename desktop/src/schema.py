SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

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

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);

CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS program_days (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  title TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(program_id, day_of_week),
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

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
"""

def migrate_database(conn):
    """Realiza migraciones de esquema si es necesario"""
    cursor = conn.execute("PRAGMA table_info(athletes)")
    columns = {row[1] for row in cursor.fetchall()}
    
    # Agregar columnas faltantes a athletes
    if 'birth_date' not in columns:
        conn.execute("ALTER TABLE athletes ADD COLUMN birth_date TEXT")
        print("✓ Agregado: athletes.birth_date")
    
    if 'height' not in columns:
        conn.execute("ALTER TABLE athletes ADD COLUMN height TEXT")
        print("✓ Agregado: athletes.height")
    
    if 'weight' not in columns:
        conn.execute("ALTER TABLE athletes ADD COLUMN weight TEXT")
        print("✓ Agregado: athletes.weight")
    
    conn.commit()
