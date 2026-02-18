/**
 * Catálogo de ejercicios predefinio con imágenes de ExerciseDB (API pública)
 * Las imágenes están alojadas en: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{id}.json
 * Las imágenes png están en: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{exercise_id}.png
 * 
 * IMPORTANTE: Para producción, descargar todas las imágenes localmente y cambiar image_uri a file:// paths
 * Script de descarga proporcionado en descargar_imagenes.py
 */

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  image_url: string; // URL pública temporal o file:// local
  target_muscles?: string[];
}

export const EXERCISE_CATALOG: ExerciseCatalogItem[] = [
  // ===== PECHO =====
  {
    id: "bench_press_barbell",
    name: "Bench Press (Barra)",
    muscle_group: "Pecho",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20bench%20press.png",
    target_muscles: ["Pecho", "Tríceps", "Hombros"],
  },
  {
    id: "incline_bench_press",
    name: "Incline Bench Press",
    muscle_group: "Pecho",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20incline%20bench%20press.png",
    target_muscles: ["Pecho Superior", "Hombros"],
  },
  {
    id: "dumbbell_bench_press",
    name: "Dumbbell Bench Press",
    muscle_group: "Pecho",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20bench%20press.png",
    target_muscles: ["Pecho", "Tríceps"],
  },
  {
    id: "push_ups",
    name: "Push-ups",
    muscle_group: "Pecho",
    equipment: "Peso Corporal",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/push%20ups.png",
    target_muscles: ["Pecho", "Tríceps", "Hombros"],
  },
  {
    id: "cable_fly",
    name: "Cable Fly",
    muscle_group: "Pecho",
    equipment: "Cables",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/cable%20fly.png",
    target_muscles: ["Pecho"],
  },

  // ===== ESPALDA =====
  {
    id: "pull_ups",
    name: "Pull-ups",
    muscle_group: "Espalda",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/pull%20ups.png",
    target_muscles: ["Espalda Dorsal", "Bíceps"],
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    muscle_group: "Espalda",
    equipment: "Máquina",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/lat%20pulldown.png",
    target_muscles: ["Espalda Dorsal", "Bíceps"],
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    muscle_group: "Espalda",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20row.png",
    target_muscles: ["Espalda", "Bíceps"],
  },
  {
    id: "dumbbell_row",
    name: "Dumbbell Row",
    muscle_group: "Espalda",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20row.png",
    target_muscles: ["Espalda", "Bíceps"],
  },
  {
    id: "face_pull",
    name: "Face Pull",
    muscle_group: "Espalda",
    equipment: "Cables",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/face%20pull.png",
    target_muscles: ["Espalda Posterior", "Hombros"],
  },

  // ===== HOMBROS =====
  {
    id: "overhead_press",
    name: "Overhead Press",
    muscle_group: "Hombros",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20shoulder%20press.png",
    target_muscles: ["Hombros", "Tríceps"],
  },
  {
    id: "dumbbell_shoulder_press",
    name: "Dumbbell Shoulder Press",
    muscle_group: "Hombros",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20shoulder%20press.png",
    target_muscles: ["Hombros", "Tríceps"],
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise",
    muscle_group: "Hombros",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20lateral%20raise.png",
    target_muscles: ["Hombros Laterales"],
  },
  {
    id: "front_raise",
    name: "Front Raise",
    muscle_group: "Hombros",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20front%20raise.png",
    target_muscles: ["Hombros Anteriores"],
  },
  {
    id: "reverse_fly",
    name: "Reverse Fly",
    muscle_group: "Hombros",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20reverse%20fly.png",
    target_muscles: ["Espalda Posterior", "Hombros"],
  },

  // ===== BRAZOS (BÍCEPS) =====
  {
    id: "barbell_curl",
    name: "Barbell Curl",
    muscle_group: "Brazos",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20curl.png",
    target_muscles: ["Bíceps"],
  },
  {
    id: "dumbbell_curl",
    name: "Dumbbell Curl",
    muscle_group: "Brazos",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20curl.png",
    target_muscles: ["Bíceps"],
  },
  {
    id: "hammer_curl",
    name: "Hammer Curl",
    muscle_group: "Brazos",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20hammer%20curl.png",
    target_muscles: ["Bíceps"],
  },
  {
    id: "cable_curl",
    name: "Cable Curl",
    muscle_group: "Brazos",
    equipment: "Cables",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/cable%20curl.png",
    target_muscles: ["Bíceps"],
  },

  // ===== BRAZOS (TRÍCEPS) =====
  {
    id: "close_grip_press",
    name: "Close Grip Bench Press",
    muscle_group: "Brazos",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20close%20grip%20bench%20press.png",
    target_muscles: ["Tríceps", "Pecho"],
  },
  {
    id: "tricep_dips",
    name: "Tricep Dips",
    muscle_group: "Brazos",
    equipment: "Peso Corporal",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dips.png",
    target_muscles: ["Tríceps"],
  },
  {
    id: "tricep_pushdown",
    name: "Tricep Pushdown",
    muscle_group: "Brazos",
    equipment: "Cables",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/cable%20tricep%20pushdown.png",
    target_muscles: ["Tríceps"],
  },
  {
    id: "dumbbell_tricep_extension",
    name: "Dumbbell Tricep Extension",
    muscle_group: "Brazos",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20tricep%20extension.png",
    target_muscles: ["Tríceps"],
  },

  // ===== PIERNAS (CUÁDRICEPS) =====
  {
    id: "barbell_squat",
    name: "Barbell Squat",
    muscle_group: "Piernas",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20squat.png",
    target_muscles: ["Cuádriceps", "Glúteos"],
  },
  {
    id: "leg_press",
    name: "Leg Press",
    muscle_group: "Piernas",
    equipment: "Máquina",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/leg%20press.png",
    target_muscles: ["Cuádriceps", "Glúteos"],
  },
  {
    id: "leg_extension",
    name: "Leg Extension",
    muscle_group: "Piernas",
    equipment: "Máquina",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/leg%20extension.png",
    target_muscles: ["Cuádriceps"],
  },
  {
    id: "dumbbell_goblet_squat",
    name: "Goblet Squat",
    muscle_group: "Piernas",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20goblet%20squat.png",
    target_muscles: ["Cuádriceps", "Glúteos"],
  },
  {
    id: "smith_machine_squat",
    name: "Smith Machine Squat",
    muscle_group: "Piernas",
    equipment: "Smith Machine",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/smith%20machine%20squat.png",
    target_muscles: ["Cuádriceps"],
  },

  // ===== PIERNAS (ISQUIOTIBIALES) =====
  {
    id: "leg_curl",
    name: "Leg Curl",
    muscle_group: "Piernas",
    equipment: "Máquina",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/leg%20curl.png",
    target_muscles: ["Isquiotibiales"],
  },
  {
    id: "barbell_deadlift",
    name: "Barbell Deadlift",
    muscle_group: "Piernas",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20deadlift.png",
    target_muscles: ["Isquiotibiales", "Espalda", "Glúteos"],
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    muscle_group: "Piernas",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20romanian%20deadlift.png",
    target_muscles: ["Isquiotibiales", "Glúteos"],
  },
  {
    id: "dumbbell_deadlift",
    name: "Dumbbell Deadlift",
    muscle_group: "Piernas",
    equipment: "Mancuernas",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell%20deadlift.png",
    target_muscles: ["Isquiotibiales", "Espalda"],
  },

  // ===== GLÚTEOS =====
  {
    id: "hip_thrust",
    name: "Hip Thrust",
    muscle_group: "Glúteos",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20hip%20thrust.png",
    target_muscles: ["Glúteos"],
  },
  {
    id: "hack_squat",
    name: "Hack Squat",
    muscle_group: "Glúteos",
    equipment: "Smith Machine",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/hack%20squat.png",
    target_muscles: ["Glúteos", "Cuádriceps"],
  },
  {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    muscle_group: "Glúteos",
    equipment: "Peso Corporal",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/bulgarian%20split%20squat.png",
    target_muscles: ["Glúteos", "Cuádriceps"],
  },

  // ===== CORE/ABS =====
  {
    id: "barbell_crunch",
    name: "Barbell Crunch",
    muscle_group: "Core",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell%20crunch.png",
    target_muscles: ["Abdominales"],
  },
  {
    id: "ab_crunch",
    name: "Crunch",
    muscle_group: "Core",
    equipment: "Máquina",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/machine%20crunch.png",
    target_muscles: ["Abdominales"],
  },
  {
    id: "decline_situps",
    name: "Decline Sit-ups",
    muscle_group: "Core",
    equipment: "Peso Corporal",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/decline%20sit-ups.png",
    target_muscles: ["Abdominales"],
  },
  {
    id: "cable_crunch",
    name: "Cable Crunch",
    muscle_group: "Core",
    equipment: "Cables",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/cable%20crunch.png",
    target_muscles: ["Abdominales"],
  },
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    muscle_group: "Core",
    equipment: "Barra",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/hanging%20leg%20raise.png",
    target_muscles: ["Abdominales"],
  },
  {
    id: "planks",
    name: "Plank",
    muscle_group: "Core",
    equipment: "Peso Corporal",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/plank.png",
    target_muscles: ["Core"],
  },

  // ===== CARDIO =====
  {
    id: "treadmill_running",
    name: "Running (Treadmill)",
    muscle_group: "Cardio",
    equipment: "Máquina",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/running%20(treadmill).png",
    target_muscles: ["Piernas", "Cardiovascular"],
  },
  {
    id: "stationary_bike",
    name: "Stationary Bike",
    muscle_group: "Cardio",
    equipment: "Máquina",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/stationary%20bike.png",
    target_muscles: ["Piernas", "Cardiovascular"],
  },
  {
    id: "jumping_jacks",
    name: "Jumping Jacks",
    muscle_group: "Cardio",
    equipment: "Peso Corporal",
    image_url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/jumping%20jacks.png",
    target_muscles: ["Cuerpo Completo"],
  },
];

export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Brazos",
  "Piernas",
  "Glúteos",
  "Core",
  "Cardio",
];

export const EQUIPMENT_OPTIONS = [
  "Barra",
  "Mancuernas",
  "Cables",
  "Máquina",
  "Peso Corporal",
  "Smith Machine",
];
