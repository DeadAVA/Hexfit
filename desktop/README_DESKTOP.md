# Hexfit - Aplicación Desktop

Aplicación de escritorio para gestión de programas de ejercicio y seguimiento de atletas.

## Características

### Atletas
- ✅ Crear, editar y eliminar atletas
- ✅ Guardar información completa: nombre, edad, fecha de nacimiento, peso, altura y sexo
- ✅ Gestión fácil con interfaz de tabla
- ✅ Doble clic para editar, Eliminar para borrar

### Ejercicios
- ✅ Catálogo de 35+ ejercicios predefinidos
- ✅ Crear ejercicios personalizados
- ✅ Filtrar por grupo muscular (Pecho, Espalda, Hombros, Brazos, Abdominales, Piernas, Glúteos)
- ✅ Soporte para imágenes en ejercicios personalizados
- ✅ Eliminar ejercicios personalizados

### Programas
- ✅ Crear programas de entrenamiento por atleta
- ✅ Organizar días de la semana
- ✅ Asignar ejercicios a cada día
- ✅ Configurar series, repeticiones y descanso
- ✅ Notas para cada programa

### Ajustes
- ✅ Crear copias de seguridad automáticas
- ✅ Restaurar desde backup
- ✅ Exportar base de datos como SQL
- ✅ Optimizar base de datos

## Instalación

### Requisitos
- Python 3.8+
- Dependencias: `pip install -r requirements.txt`

### Ejecución

1. Clonar o descargar el proyecto
2. Instalar dependencias: `pip install -r requirements.txt`
3. (Opcional) Cargar ejercicios iniciales: `python seed_database.py`
4. Ejecutar: `python main.py`

## Base de Datos

La aplicación almacena datos en:
```
~/.rutinas_offline/app.db
```

Las copias de seguridad se guardan en:
```
~/.rutinas_offline/backups/
```

Los ejercicios personalizados se almacenan en:
```
~/.rutinas_offline/custom_exercises/
```

## Interfaz

### Tabs principales
1. **Atletas**: Gestión de perfiles de atletas
2. **Ejercicios**: Catálogo y ejercicios personalizados
3. **Programas**: Creación de planes de entrenamiento
4. **Ajustes**: Copias de seguridad y configuración

### Controles rápidos
- **Doble clic**: Editar item seleccionado
- **Eliminar (Delete)**: Borrar item seleccionado
- **+ Nuevo**: Crear nuevo item

## Estructura de Carpetas

```
desktop/
├── main.py                 # Punto de entrada
├── seed_database.py        # Script para cargar ejercicios iniciales
├── requirements.txt        # Dependencias
└── src/
    ├── db.py              # Conexión a SQLite
    ├── schema.py          # Schema de base de datos y migraciones
    ├── theme.py           # Temas y estilos
    ├── ui_athletes.py     # Interfaz de atletas
    ├── ui_exercises.py    # Interfaz de ejercicios
    ├── ui_programs.py     # Interfaz de programas
    └── ui_settings.py     # Interfaz de ajustes
```

## Versión

Hexfit v1.0 - Abril 2024

## Notas de Desarrollo

- La aplicación usa SQLite3 para almacenamiento offline
- Theme system compatible con dark mode
- Schema sincronizado con versión mobile (React Native)
- Migraciones automáticas para nuevas columnas

## Troubleshooting

**Error: "no such column: birth_date"**
- La migración automática debería crear las columnas. Si persiste, ejecutar:
  ```python
  from src.schema import migrate_database
  from src.db import connect
  migrate_database(connect())
  ```

**La aplicación se cierra al iniciar**
- Verificar que Python 3.8+ está instalado
- Confirmar que tkinter está disponible
- En Linux: `sudo apt-get install python3-tk`

**Errores de permisos**
- Verificar permisos en carpeta `~/.rutinas_offline/`
