import sqlite3
from pathlib import Path

APP_DIR = Path.home() / ".rutinas_offline"
APP_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = str(APP_DIR / "app.db")

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn
