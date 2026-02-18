"""
Script para descargar todas las imágenes de ejercicios desde ExerciseDB
Ejecutar una vez para cachear todas las imágenes localmente
"""

import requests
import os
from pathlib import Path
import time

# Lista de ejercicios del catálogo (copiar nombres desde exercises_catalog.ts)
EXERCISES = [
    "barbell bench press",
    "barbell incline bench press",
    "dumbbell bench press",
    "push ups",
    "cable fly",
    "pull ups",
    "lat pulldown",
    "barbell row",
    "dumbbell row",
    "face pull",
    "barbell shoulder press",
    "dumbbell shoulder press",
    "dumbbell lateral raise",
    "dumbbell front raise",
    "dumbbell reverse fly",
    "barbell curl",
    "dumbbell curl",
    "dumbbell hammer curl",
    "cable curl",
    "barbell close grip bench press",
    "dips",
    "cable tricep pushdown",
    "dumbbell tricep extension",
    "barbell squat",
    "leg press",
    "leg extension",
    "dumbbell goblet squat",
    "smith machine squat",
    "leg curl",
    "barbell deadlift",
    "barbell romanian deadlift",
    "dumbbell deadlift",
    "barbell hip thrust",
    "hack squat",
    "bulgarian split squat",
    "barbell crunch",
    "machine crunch",
    "decline sit-ups",
    "cable crunch",
    "hanging leg raise",
    "plank",
    "running (treadmill)",
    "stationary bike",
    "jumping jacks",
]

BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"
OUTPUT_DIR = "desktop/assets/exercises/fixed"

def download_exercises():
    """Descarga todas las imágenes de ejercicios"""
    
    # Crear directorio si no existe
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    print(f"🔽 Descargando {len(EXERCISES)} ejercicios...")
    print(f"📁 Destino: {OUTPUT_DIR}\n")
    
    success_count = 0
    failed = []
    
    for i, exercise_name in enumerate(EXERCISES, 1):
        # Formatear URL (espacios → %20)
        url = f"{BASE_URL}/{exercise_name}.png"
        filename = f"{OUTPUT_DIR}/{exercise_name.replace(' ', '_')}.png"
        
        # Si ya existe, saltar
        if os.path.exists(filename):
            print(f"[{i}/{len(EXERCISES)}] ⏭️  {exercise_name} (ya existe)")
            success_count += 1
            continue
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"[{i}/{len(EXERCISES)}] ✅ {exercise_name}")
                success_count += 1
            else:
                print(f"[{i}/{len(EXERCISES)}] ❌ {exercise_name} (HTTP {response.status_code})")
                failed.append((exercise_name, response.status_code))
        except Exception as e:
            print(f"[{i}/{len(EXERCISES)}] ❌ {exercise_name} ({str(e)})")
            failed.append((exercise_name, str(e)))
        
        # Delay para no saturar el servidor
        time.sleep(0.3)
    
    print(f"\n{'='*60}")
    print(f"✅ Descargados: {success_count}/{len(EXERCISES)}")
    
    if failed:
        print(f"❌ Fallidos: {len(failed)}")
        print("\nLista de errores:")
        for name, error in failed:
            print(f"  - {name}: {error}")
    else:
        print("🎉 ¡Todas las imágenes descargadas correctamente!")
    
    print(f"{'='*60}\n")

def verify_downloads():
    """Verifica qué imágenes ya están descargadas"""
    
    if not os.path.exists(OUTPUT_DIR):
        print(f"❌ Directorio {OUTPUT_DIR} no existe")
        return
    
    downloaded = []
    missing = []
    
    for exercise_name in EXERCISES:
        filename = f"{OUTPUT_DIR}/{exercise_name.replace(' ', '_')}.png"
        if os.path.exists(filename):
            size = os.path.getsize(filename)
            downloaded.append((exercise_name, size))
        else:
            missing.append(exercise_name)
    
    print(f"📊 ESTADÍSTICAS DE DESCARGA")
    print(f"{'='*60}")
    print(f"✅ Descargados: {len(downloaded)}/{len(EXERCISES)}")
    print(f"❌ Faltantes: {len(missing)}/{len(EXERCISES)}")
    
    if missing:
        print(f"\n⚠️  Imágenes faltantes:")
        for name in missing:
            print(f"  - {name}")
    
    print(f"{'='*60}\n")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        verify_downloads()
    else:
        download_exercises()
        print("\n💡 Para verificar las descargas, ejecuta:")
        print("   python descargar_imagenes.py verify")
