# 🚀 GUÍA RÁPIDA - HEXFIT DESKTOP

## Inicio Rápido

### 1. Instalar
```bash
cd C:\Users\alanv\Desktop\Hexfit\desktop
pip install -r requirements.txt
```

### 2. Cargar datos (primera vez)
```bash
python seed_database.py
```

### 3. Ejecutar
```bash
python main.py
```

---

## Controles Principales

| Acción | Atajo |
|--------|-------|
| Editar | Doble clic |
| Eliminar | Tecla Delete |
| Nuevo | Botón "+ Nuevo/Alta/Personalizado" |

---

## Secciones

### 📋 ATLETAS
- ➕ Crear atleta nuevo
- ✏️ Doble clic para editar
- 🗑️ Delete para eliminar
- Campos: Nombre, Edad, F.Nacimiento, Peso, Altura, Sexo

### 💪 EJERCICIOS
- 🏷️ 35 ejercicios predefinidos
- 🔍 Filtrar por grupo muscular
- ➕ Crear personalizados
- 📷 Soporte de imágenes

### 📅 PROGRAMAS
- Crear plan de entrenamiento
- Asignar atleta
- Agregar días de la semana
- Especificar ejercicios, series, reps, descanso

### ⚙️ AJUSTES
- 💾 Crear/Restaurar backup
- 📊 Exportar base de datos
- 🔧 Optimizar BD

---

## Ubicaciones de Archivos

### Base de datos
```
C:\Users\{Usuario}\.rutinas_offline\app.db
```

### Backups
```
C:\Users\{Usuario}\.rutinas_offline\backups\
```

### Ejercicios personalizados
```
C:\Users\{Usuario}\.rutinas_offline\custom_exercises\
```

---

## Ejemplo: Crear Programa

1. Ir a **Programas** tab
2. Clic en "+ Nuevo"
3. Llenar:
   - Nombre: "Rutina Push Pull"
   - Atleta: "Juan"
   - Notas: "4 semanas"
4. Guardar
5. Doble clic en el programa
6. Los días aparecerán para editar
7. Doble clic en un día para agregar ejercicios

---

## Troubleshooting Rápido

**P: "RuntimeError: no such table"**  
R: Ejecutar `python seed_database.py`

**P: "Tkinter not found"**  
R: Windows ya lo incluye. En Linux: `sudo apt install python3-tk`

**P: "Permisos denegados"**  
R: Ejecutar como administrador o cambiar permisos de carpeta

**P: ¿Cómo sincronizar con mobile?**  
R: En ajustes → Crear Copia → Transferir archivo a mobile

---

## Datos Iniciales

Al ejecutar `seed_database.py` se carga:
- ✅ 35 ejercicios del catálogo
- ✅ Schema completo con todas las tablas
- ✅ Migraciones automáticas aplicadas

---

## Versión
Hexfit v1.0 - Desktop Edition
