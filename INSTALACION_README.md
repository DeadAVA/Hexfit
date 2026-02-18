# INSTRUCCIONES DE INSTALACIÓN Y CONFIGURACIÓN

## 🎯 DESCRIPCIÓN DEL PROYECTO

**Hexfit - App Offline-First para Creación de Rutinas de Entrenamiento**

Una aplicación móvil (React Native/Expo) y desktop (Python Tkinter) para crear y gestionar programas de entrenamiento personalizados sin necesidad de conexión a internet.

---

## 📦 ESTRUCTURA DEL PROYECTO

```
Hexfit/
├── Mobile/                              # Cliente React Native (Expo)
│   ├── App.tsx                         # Entry point
│   ├── package.json                    # Dependencias
│   ├── app.json                        # Configuración Expo
│   ├── tsconfig.json
│   ├── src/
│   │   ├── navigation/
│   │   │   └── RootNavigator.tsx       # Navegación con tabs
│   │   ├── screens/
│   │   │   ├── AthletesScreen.tsx
│   │   │   ├── ExercisesScreen.tsx
│   │   │   ├── ProgramsScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── ProgramEditorScreen.tsx
│   │   │   ├── ProgramDayEditorScreen.tsx
│   │   │   └── modals/
│   │   │       ├── EditAthleteModal.tsx
│   │   │       ├── CreateExerciseModal.tsx
│   │   │       └── CreateProgramModal.tsx
│   │   ├── components/
│   │   │   └── Avatar.tsx              # Avatar generado por seed
│   │   ├── db/
│   │   │   ├── database.ts             # DatabaseSync (Expo SQLite)
│   │   │   └── seeds/
│   │   │       └── exercises.ts        # Datos iniciales
│   │   ├── hooks/
│   │   │   └── useDatabase.ts          # Hook personalizado
│   │   └── utils/
│   │       └── backup/
│   │           └── backup_service.ts   # Export/Import ZIP
│   └── assets/                         # Recursos (imágenes locales)
│
├── desktop/                             # Cliente Python Tkinter
│   ├── main.py                         # Entry point Tkinter
│   ├── requirements.txt
│   ├── src/
│   │   ├── db.py                       # DatabaseSync para SQLite
│   │   ├── ui_main.py                  # Ventana principal
│   │   ├── ui_athletes.py              # Pestaña Atletas
│   │   ├── ui_exercises.py             # Pestaña Ejercicios
│   │   ├── ui_programs.py              # Pestaña Programas
│   │   ├── ui_backup.py                # Pestaña Backup/Restore
│   │   └── utils/
│   │       ├── avatar.py               # Avatar generator
│   │       └── backup_service.py       # Export/Import ZIP
│   ├── assets/
│   │   ├── exercises/
│   │   │   ├── fixed/                  # Ejercicios predefinidos
│   │   │   └── custom/                 # Ejercicios custom (generados)
│   │   └── app.db                      # Base de datos SQLite
│
├── shared/                              # Código compartido
│   ├── types.ts                        # Tipos TypeScript
│   ├── constants/
│   │   └── exercises_catalog.ts        # Catálogo de ejercicios
│   └── db/
│       └── schema.sql                  # Esquema SQLite
│
└── assets/
    ├── export_format.md                # Formato de exportación
    ├── schema.sql                      # Definición de tablas
    └── seed_exercises.json             # Datos de ejercicios iniciales
```

---

## 🚀 INSTALACIÓN Y EJECUCIÓN

### PARTE A: React Native (Expo) - MOBILE

#### Requisitos previos:
- Node.js 18+ y npm
- Expo CLI: `npm install -g expo-cli`
- Un teléfono con la app Expo Go instalada (iOS/Android)

#### Instalación:

```bash
cd Mobile

# Instalar dependencias
npm install

# Dependencias principales a instalar:
npm install expo-sqlite/next \
            expo-file-system \
            react-native-zip-archive \
            @react-navigation/native \
            @react-navigation/bottom-tabs \
            @react-navigation/native-stack \
            react-native-screens \
            react-native-safe-area-context \
            @expo/vector-icons \
            expo-image-picker \
            expo-constants

# Opcionalmente: agregar tipos de TypeScript
npm install --save-dev typescript @types/react @types/react-native
```

#### Ejecución:

```bash
# Terminal 1: Iniciar servidor Expo
expo start

# En tu teléfono:
# - Abre la app Expo Go
# - Escanea el código QR que aparecerá
# - O ingresa el host/puerto manualmente
```

#### Ejecutar en emulador (alternativa):

```bash
# Para Android (requiere Android Studio)
expo start --android

# Para iOS (requiere macOS y Xcode)
expo start --ios
```

---

### PARTE B: Python Tkinter - DESKTOP

#### Requisitos previos:
- Python 3.8+
- pip

#### Instalación:

```bash
cd desktop

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate
# Activar entorno (Linux/macOS)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Dependencies:
# - sqlite3 (built-in)
# - Pillow (imágenes)
# - python-dateutil
```

#### Ejecución:

```bash
python main.py
```

---

## 🎨 CARACTERÍSTICAS

### Atletas
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Avatar generado automáticamente por seed (hash del ID)
- ✅ Campos: Nombre, Edad, Sexo (M/F/X)
- ✅ Sin foto: avatar visual generado

### Ejercicios
- ✅ Catálogo fijo con 30+ ejercicios predefinidos
- ✅ Imágenes desde ExerciseDB (API pública)
- ✅ Filtros: músculo, equipo, búsqueda por texto
- ✅ Crear ejercicios custom con imagen local
- ✅ Guardar imagen en carpeta local (custom/)
- ✅ Base de datos con image_uri como file:// paths

### Programas
- ✅ Crear programa (elegir atleta + nombre + notas)
- ✅ Editor visual: 6 días Lunes a Sábado
- ✅ Multiselect de ejercicios por día
- ✅ Configurar: sets, reps_min/max, descanso, notas
- ✅ Reordenar ejercicios (drag & drop en móvil, botones en desktop)
- ✅ Guardar estructura completa en BD

### Backup/Restore
- ✅ Exportar: ZIP con app.db + meta.json
- ✅ Importar: restaurar respaldo (reemplaza BD)
- ✅ Listar backups disponibles
- ✅ Eliminar backups

---

## 📱 CONSIDERACIONES DE RUTAS DE IMÁGENES

### MOBILE (React Native / Expo)

**Ejercicios predefinidos:**
- Las imágenes se cargan desde URLs de ExerciseDB:
  ```
  https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{name}.png
  ```
- En `exercises_catalog.ts`, el campo `image_url` tiene estas URLs

**Ejercicios custom:**
- Se guardan en el sistema de archivos del dispositivo:
  ```
  file://{DocumentDirectory}/custom_exercises/{exerciseId}.jpg
  ```
- En Android: `/data/data/com.hexfit.app/files/`
- En iOS: `/var/mobile/Containers/Data/Application/.../`
- En base de datos: `image_uri = "file://..."`

**Backup:**
- Se almacenan en: `{DocumentDirectory}/backups/`
- Formato: `hexfit_backup_YYYY-MM-DDTHH-MM-SS.zip`

---

### DESKTOP (Python Tkinter)

**Ejercicios predefinidos:**
- Se descargan (una sola vez) desde ExerciseDB
- Se cachean en: `desktop/assets/exercises/fixed/{id}.png`
- En base de datos: `image_uri = "file://./assets/exercises/fixed/{id}.png"`

**Ejercicios custom:**
- Se guardan en: `desktop/assets/exercises/custom/{id}.jpg`
- En base de datos: `image_uri = "file://./assets/exercises/custom/{id}.jpg"`

**Rutas relativas:**
- Windows: `file://./assets/exercises/fixed/bench_press.png`
- Linux/macOS: `file://./assets/exercises/fixed/bench_press.png`

---

## 🗄️ ESQUEMA SQLite

```sql
-- ATLETAS
CREATE TABLE athletes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK(age >= 1 AND age <= 120),
  sex TEXT NOT NULL CHECK(sex IN ('M','F','X')),
  avatar_seed TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- EJERCICIOS
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  image_uri TEXT NOT NULL,     -- file://... o http://...
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- PROGRAMAS
CREATE TABLE programs (
  id TEXT PRIMARY KEY,
  athlete_id TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
);

-- DIAS DEL PROGRAMA (Lun-Sab)
CREATE TABLE program_days (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 6),
  title TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(program_id, day_of_week),
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- ITEMS DEL DIA (ejercicios + sets/reps/descanso)
CREATE TABLE day_items (
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
```

---

## 🎯 FLUJOS PRINCIPALES

### Crear un programa:

1. Tab "Programas" → Botón "Crear Programa"
2. Modal: Elegir Atleta + Nombre + Notas
3. Editor visual de 6 días (Lun-Sab)
4. Seleccionar ejercicios por día (multiselect)
5. Configurar sets/reps/descanso para cada ejercicio
6. Guardar programa

### Importar/Exportar:

1. **Exportar:**
   - Tab "Ajustes/Backup" → "Crear Backup"
   - Se crea ZIP en Documentos/backups/
   - Compartir el archivo (email, cloud, etc.)

2. **Importar:**
   - Tab "Ajustes/Backup" → "Restaurar Backup"
   - Seleccionar archivo ZIP
   - Confirmar (reemplaza BD actual)

---

## 🔗 DESCARGA DE IMÁGENES (ExerciseDB)

Las imágenes de ejercicios se descargan desde:
```
https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/
```

**Script para descargar todas (Python):**

```python
import requests
import os
from pathlib import Path

exercises = [
    "barbell bench press", "dumbbell bench press", 
    "incline bench press", "push ups",
    # ... etc (ver exercises_catalog.ts)
]

output_dir = "assets/exercises/fixed"
Path(output_dir).mkdir(parents=True, exist_ok=True)

for exercise in exercises:
    url = f"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{exercise}.png"
    filename = f"{output_dir}/{exercise.replace(' ', '_')}.png"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"✓ {exercise}")
        else:
            print(f"✗ {exercise} (404)")
    except Exception as e:
        print(f"✗ {exercise} ({e})")
```

---

## 🐛 TROUBLESHOOTING

### Mobile (Expo):

**Error: "Cannot find module 'expo-sqlite/next'"**
```bash
npm install expo-sqlite/next
```

**Error: "Database is locked"**
- Cierra otras conexiones
- Reinicia el servidor Expo

**Las imágenes no se cargan**
- Verificar que ExerciseDB esté disponible
- En desarrollo, pueden carecer las URLs
- Para producción, descargar imágenes localmente

### Desktop (Tkinter):

**Error: "ModuleNotFoundError: No module named 'sqlite3'"**
- Python 3.8+ incluye sqlite3
- Reinstalar Python si es necesario

**Las imágenes no se muestran**
- Verificar rutas relativas desde `main.py`
- En Windows, usar `\\` o raw strings (`r"..."`)

**Base de datos no se sincroniza**
- Eliminar `app.db` y dejar que se recree
- Verificar permisos de escritura en carpeta

---

## 📝 NOTAS IMPORTANTES

1. **Sincronización entre plataformas:**
   - Mobile y Desktop usan mismo esquema SQLite
   - Usar backup/restore para sincronizar (exportar desde Mobile, importar en Desktop)
   - No hay sincronización automática en la nube

2. **Imágenes:**
   - Ejercicios predefinidos: URLs públicas (sin descargar)
   - Ejercicios custom: almacenadas localmente en el dispositivo
   - Respaldo: incluye solo metadatos, no imágenes

3. **IDs:**
   - IDs cortos generados con: `random(36).substring(2, 9)`
   - Ejemplo: `"a7f9x2k"`
   - Usados como seeds para avatares

4. **Timestamps:**
   - Formato ISO 8601: `"2026-02-01T10:30:00.000Z"`
   - Generados automáticamente por DB layer

---

## 📞 SOPORTE

Para reportar bugs o solicitar features:
1. Verificar que se cumplan los requisitos
2. Limpiar caché/datos de la app
3. Reiniciar el dispositivo/servidor
4. Revisar los logs en la consola

