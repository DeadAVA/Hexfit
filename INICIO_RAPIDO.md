# 🚀 INICIO RÁPIDO - HEXFIT

## ⚡ Ejecutar Mobile (React Native) - 3 minutos

```bash
# 1. Ir a carpeta Mobile
cd Mobile

# 2. Instalar dependencias (solo primera vez)
npm install

# 3. Iniciar servidor Expo
expo start

# 4. Escanear QR con app "Expo Go" en tu teléfono
#    (Disponible en App Store / Google Play)
```

**¿No tienes Expo Go?**
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## 🖥️ Ejecutar Desktop (Python) - 2 minutos

```bash
# 1. Ir a carpeta desktop
cd desktop

# 2. Instalar dependencias (solo primera vez)
pip install -r requirements.txt

# 3. Ejecutar aplicación
python main.py
```

**Nota:** La UI de Desktop está en desarrollo. Solo verás una ventana básica de atletas.

---

## 📥 Descargar Imágenes de Ejercicios (Opcional)

```bash
# Desde la raíz del proyecto
python descargar_imagenes.py

# Esto descarga 50+ imágenes a: desktop/assets/exercises/fixed/
```

---

## 🎯 Flujo de Uso Rápido

### 1. Crear un Atleta
- Tab "Atletas" → Botón "Agregar Atleta"
- Ingresa: Nombre, Edad, Sexo
- Guardar

### 2. Explorar Ejercicios
- Tab "Ejercicios"
- Filtra por músculo o equipo
- Busca por nombre
- (Opcional) Crea ejercicio custom con imagen local

### 3. Crear un Programa
- Tab "Programas" → Botón "Crear Programa"
- Selecciona atleta
- Ingresa nombre del programa
- Toca un día (Lunes-Sábado)
- Agrega ejercicios
- Configura sets/reps/descanso

### 4. Hacer Backup
- Tab "Ajustes"
- Botón "Crear Backup"
- Se genera ZIP en tu dispositivo
- Comparte vía email/drive/etc.

---

## 🐛 Problemas Comunes

### Mobile: "Cannot find module 'expo-sqlite/next'"
```bash
npm install expo-sqlite@next
```

### Mobile: "Metro bundler stuck"
```bash
expo start --clear
```

### Desktop: "ModuleNotFoundError: No module named 'PIL'"
```bash
pip install Pillow
```

### Desktop: "No such file or directory: 'app.db'"
```bash
# Ejecuta desde la carpeta desktop/, no desde src/
cd desktop
python main.py
```

---

## 📱 Captura de Pantalla

```
┌─────────────────────────────────┐
│  HEXFIT                         │
├─────────────────────────────────┤
│  👥 Atletas  📅 Programas       │
│  💪 Ejercicios  ⚙️ Ajustes      │
├─────────────────────────────────┤
│                                 │
│  [+] Agregar Atleta             │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 👤 JD  John Doe           │  │
│  │        25 años • M        │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 👤 AS  Ana Smith          │  │
│  │        28 años • F        │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

## 📚 Documentación Completa

- **[README.md](README.md)** - Descripción general
- **[INSTALACION_README.md](INSTALACION_README.md)** - Guía detallada
- **[RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md)** - Arquitectura completa
- **[GUIA_IMAGENES.md](GUIA_IMAGENES.md)** - Fuentes de imágenes
- **[CHECKLIST.md](CHECKLIST.md)** - Estado del proyecto

---

## 💬 ¿Necesitas Ayuda?

1. Revisa [INSTALACION_README.md](INSTALACION_README.md)
2. Revisa [RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md)
3. Verifica que todas las dependencias estén instaladas
4. Limpia el caché con `expo start --clear`

---

## 🎉 ¡Listo!

Tu app offline de rutinas está lista para usar. Crea tus programas de entrenamiento sin necesidad de internet.

**Mobile:** ✅ Funcional  
**Desktop:** ⚠️ En desarrollo

---

**Tiempo de setup:** 5 minutos  
**Primera ejecución:** Instantánea  
**Internet requerido:** Solo para imágenes (auto-cache)
