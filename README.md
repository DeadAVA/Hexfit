# 🏋️ HEXFIT - Offline Workout Routine Builder

Aplicación offline-first para crear y gestionar rutinas de entrenamiento personalizado sin conexión a internet.

## 🎯 Características

- ✅ **Offline-first**: funciona sin internet después de la instalación
- ✅ **Multiplataforma**: Mobile (iOS/Android) + Desktop (Windows/macOS/Linux)
- ✅ **SQLite**: misma base de datos en ambas plataformas
- ✅ **Backup/Restore**: exporta e importa tus datos en ZIP
- ✅ **50+ Ejercicios**: catálogo predefinido con imágenes
- ✅ **Ejercicios custom**: crea tus propios ejercicios con imágenes locales
- ✅ **Programas semanales**: rutinas de Lunes a Sábado
- ✅ **Configuración detallada**: sets, reps, descanso, notas por ejercicio

## 🚀 Instalación Rápida

### Mobile (React Native + Expo)

```bash
cd Mobile
npm install
expo start
```

Escanea el código QR con **Expo Go** en tu teléfono.

### Desktop (Python + Tkinter)

```bash
cd desktop
pip install -r requirements.txt
python main.py
```

## 📖 Documentación Completa

- **[INSTALACION_README.md](INSTALACION_README.md)** - Guía detallada de instalación y configuración
- **[RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md)** - Estado del proyecto y arquitectura completa

## 🗂️ Estructura del Proyecto

```
Hexfit/
├── Mobile/           # React Native (Expo) - ✅ Completo
├── desktop/          # Python Tkinter - ⚠️ Base implementada
├── shared/           # Tipos y constantes compartidos
├── assets/           # Esquemas y recursos
└── docs/             # Documentación
```

## 🎨 Capturas de Pantalla

### Mobile
- Tab Atletas: CRUD completo con avatares generados
- Tab Ejercicios: Catálogo con filtros y búsqueda
- Tab Programas: Editor semanal con configuración por ejercicio
- Tab Ajustes: Backup/Restore en ZIP

## 🗄️ Base de Datos

**SQLite** con 5 tablas:
- `athletes` - Información de atletas
- `exercises` - Catálogo de ejercicios (fijos + custom)
- `programs` - Programas asignados a atletas
- `program_days` - Días de la semana del programa
- `day_items` - Ejercicios por día con sets/reps/descanso

Ver esquema completo en [assets/schema.sql](assets/schema.sql)

## 🔗 Imágenes de Ejercicios

Las imágenes se obtienen de **ExerciseDB** (repositorio público en GitHub):
```
https://github.com/yuhonas/free-exercise-db
```

Para descargar todas las imágenes localmente:
```bash
python descargar_imagenes.py
```

## 📝 Catálogo de Ejercicios

50+ ejercicios organizados por grupo muscular:
- Pecho (8)
- Espalda (5)
- Hombros (5)
- Brazos (8)
- Piernas (9)
- Glúteos (3)
- Core (6)
- Cardio (3)

Ver catálogo completo en [shared/constants/exercises_catalog.ts](shared/constants/exercises_catalog.ts)

## 🛠️ Tecnologías

### Mobile
- **React Native** (Expo SDK 54)
- **TypeScript** 5.9
- **expo-sqlite/next** - Base de datos
- **expo-file-system** - Gestión de archivos
- **React Navigation** 6 - Navegación
- **react-native-zip-archive** - Backup ZIP

### Desktop
- **Python** 3.8+
- **Tkinter** - Interfaz gráfica
- **SQLite3** (built-in)
- **Pillow** - Gestión de imágenes

## 📦 Backup y Sincronización

1. Exporta desde Mobile → ZIP con `hexfit.db` + metadata
2. Comparte el ZIP (email, Drive, etc.)
3. Importa en Desktop → reemplaza BD local
4. Viceversa para sincronizar Desktop → Mobile

**Formato del backup:**
```
hexfit_backup_2026-02-01T10-30-00.zip
├── hexfit.db
└── meta.json
```

## ⚠️ Estado Actual

### ✅ Mobile (100% Funcional)
- Todas las pantallas implementadas
- Navegación completa
- CRUD de atletas, ejercicios y programas
- Editor de rutinas semanal
- Backup/Restore funcional

### ⚠️ Desktop (Base Implementada)
- Módulo de BD completo (`src/db.py`)
- Requiere completar UI de Tkinter
- Ver [RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md) para detalles

## 🐛 Troubleshooting

### Mobile
```bash
# Error con expo-sqlite
npm install expo-sqlite@next

# Limpiar caché
expo start --clear
```

### Desktop
```bash
# Error con PIL
pip install Pillow

# Permisos en BD
chmod 755 desktop/assets/
```

## 📞 Soporte

Ver documentación completa en:
- [INSTALACION_README.md](INSTALACION_README.md) - Instalación paso a paso
- [RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md) - Arquitectura completa

## 📄 Licencia

MIT

---

**Versión:** 1.0.0  
**Fecha:** 1 de febrero de 2026  
**Estado:** Mobile ✅ | Desktop ⚠️
