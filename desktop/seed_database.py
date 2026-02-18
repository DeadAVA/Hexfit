"""Script para poblar la base de datos con ejercicios iniciales"""

import uuid
from datetime import datetime
from src.db import connect, DB_PATH
from src.schema import SCHEMA_SQL, migrate_database

def now_iso():
    return datetime.utcnow().isoformat()

EXERCISES_SEED = [
    # PECHO
    {"name": "Flexiones", "muscle": "Pecho", "equipment": "Peso corporal"},
    {"name": "Press banca con barra", "muscle": "Pecho", "equipment": "Barra"},
    {"name": "Press banca con mancuernas", "muscle": "Pecho", "equipment": "Mancuerna"},
    {"name": "Aperturas con mancuernas", "muscle": "Pecho", "equipment": "Mancuerna"},
    {"name": "Máquina prensa de pecho", "muscle": "Pecho", "equipment": "Máquina"},
    
    # ESPALDA
    {"name": "Dominadas", "muscle": "Espalda", "equipment": "Peso corporal"},
    {"name": "Remo con barra", "muscle": "Espalda", "equipment": "Barra"},
    {"name": "Remo con mancuerna", "muscle": "Espalda", "equipment": "Mancuerna"},
    {"name": "Peso muerto", "muscle": "Espalda", "equipment": "Barra"},
    {"name": "Jalón a la pecho", "muscle": "Espalda", "equipment": "Cable"},
    
    # HOMBROS
    {"name": "Press de hombro con barra", "muscle": "Hombros", "equipment": "Barra"},
    {"name": "Press de hombro con mancuernas", "muscle": "Hombros", "equipment": "Mancuerna"},
    {"name": "Elevaciones laterales", "muscle": "Hombros", "equipment": "Mancuerna"},
    {"name": "Elevaciones frontales", "muscle": "Hombros", "equipment": "Mancuerna"},
    {"name": "Pájaros en máquina", "muscle": "Hombros", "equipment": "Máquina"},
    
    # BRAZOS
    {"name": "Flexiones de bíceps con barra", "muscle": "Brazos", "equipment": "Barra"},
    {"name": "Flexiones de bíceps con mancuernas", "muscle": "Brazos", "equipment": "Mancuerna"},
    {"name": "Flexiones de bíceps en polea", "muscle": "Brazos", "equipment": "Cable"},
    {"name": "Fondos para tríceps", "muscle": "Brazos", "equipment": "Peso corporal"},
    {"name": "Extensiones de tríceps", "muscle": "Brazos", "equipment": "Mancuerna"},
    
    # ABDOMINALES
    {"name": "Abdominales", "muscle": "Abdominales", "equipment": "Peso corporal"},
    {"name": "Abdominales en máquina", "muscle": "Abdominales", "equipment": "Máquina"},
    {"name": "Plancha", "muscle": "Abdominales", "equipment": "Peso corporal"},
    {"name": "Abdominales en banco inclinado", "muscle": "Abdominales", "equipment": "Otro"},
    
    # PIERNAS
    {"name": "Sentadillas", "muscle": "Piernas", "equipment": "Peso corporal"},
    {"name": "Sentadillas con barra", "muscle": "Piernas", "equipment": "Barra"},
    {"name": "Sentadillas en máquina", "muscle": "Piernas", "equipment": "Máquina"},
    {"name": "Estocadas", "muscle": "Piernas", "equipment": "Mancuerna"},
    {"name": "Prensa de piernas", "muscle": "Piernas", "equipment": "Máquina"},
    {"name": "Extensiones de cuádriceps", "muscle": "Piernas", "equipment": "Máquina"},
    {"name": "Flexiones de isquiotibiales", "muscle": "Piernas", "equipment": "Máquina"},
    
    # GLÚTEOS
    {"name": "Hip thrust", "muscle": "Glúteos", "equipment": "Barra"},
    {"name": "Patadas de glúteos", "muscle": "Glúteos", "equipment": "Cable"},
    {"name": "Extensión de cadera en máquina", "muscle": "Glúteos", "equipment": "Máquina"},
    {"name": "Sentadillas búlgaras", "muscle": "Glúteos", "equipment": "Mancuerna"},
]

def seed_database():
    """Carga ejercicios iniciales en la base de datos"""
    conn = connect()
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    migrate_database(conn)
    
    # Verificar si hay ejercicios
    cur = conn.execute("SELECT COUNT(*) FROM exercises")
    count = cur.fetchone()[0]
    
    if count == 0:
        print("Cargando ejercicios iniciales...")
        ts = now_iso()
        
        for exercise in EXERCISES_SEED:
            ex_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO exercises (id, name, muscle_group, equipment, image_uri, is_custom, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (ex_id, exercise["name"], exercise["muscle"], exercise["equipment"], "", 0, ts, ts)
            )
        
        conn.commit()
        print(f"✓ {len(EXERCISES_SEED)} ejercicios cargados")
    else:
        print(f"✓ Base de datos ya contiene {count} ejercicios")
    
    conn.close()

if __name__ == "__main__":
    seed_database()
