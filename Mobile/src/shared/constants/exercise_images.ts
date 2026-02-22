/**
 * Mapeo de IDs de ejercicios a sus imágenes locales
 * React Native requiere require() estático para assets empaquetados
 */

export const EXERCISE_IMAGES: Record<string, any> = {
  // Pecho
  bench_press_barbell: require("../../../assets/exercises/Bench Press - fondo blanco.png"),
  incline_bench_press: require("../../../assets/exercises/Bench Press - fondo blanco.png"),
  dumbbell_bench_press: require("../../../assets/exercises/Dumbbell_Bench_Press - fondo blanco.png"),
  push_ups: require("../../../assets/exercises/white_Push-ups.png"),
  cable_fly: require("../../../assets/exercises/Cable Fly - fondo blanco.png"),

  // Espalda
  pull_ups: require("../../../assets/exercises/white_Pull-ups.png"),
  lat_pulldown: require("../../../assets/exercises/Lat_Pulldown.png"),
  barbell_row: require("../../../assets/exercises/Barbell Row - fondo blanco.png"),
  dumbbell_row: require("../../../assets/exercises/Dumbbell_Row - fondo blanco.png"),
  face_pull: require("../../../assets/exercises/Face_Pull - fondo blanco.png"),

  // Hombros
  overhead_press: require("../../../assets/exercises/Overhead_Press_white_background.png"),
  dumbbell_shoulder_press: require("../../../assets/exercises/Dumbbell_Shoulder_Press - fondo blanco.png"),
  lateral_raise: require("../../../assets/exercises/frontheben-kurzhanteln-800x448 - fondo blanco.png"),
  front_raise: require("../../../assets/exercises/Front_Raise - fondo blanco.png"),
  reverse_fly: require("../../../assets/exercises/white_Reverse_Fly.png"),

  // Brazos - Bíceps
  barbell_curl: require("../../../assets/exercises/Barbell Curl - fondo blanco.png"),
  dumbbell_curl: require("../../../assets/exercises/Barbell Curl - fondo blanco.png"),
  hammer_curl: require("../../../assets/exercises/Hammer_Curl - fondo blanco.png"),
  cable_curl: require("../../../assets/exercises/Cable Curl - fondo blanco.png"),

  // Brazos - Tríceps
  close_grip_press: require("../../../assets/exercises/Close_Grip_Bench_Press - fondo blanco.png"),
  tricep_dips: require("../../../assets/exercises/white_Tricep_Dips.png"),
  tricep_pushdown: require("../../../assets/exercises/white_Tricep_Pushdown.png"),
  dumbbell_tricep_extension: require("../../../assets/exercises/Dumbbell_Tricep_Extension - fondo blanco.png"),

  // Piernas - Cuádriceps
  barbell_squat: require("../../../assets/exercises/Barbell Squat - fondo blanco.png"),
  leg_press: require("../../../assets/exercises/Leg_Press_white_background.png"),
  leg_extension: require("../../../assets/exercises/white_Leg_Extension.png"),
  dumbbell_goblet_squat: require("../../../assets/exercises/Goblet_Squat - fondo blanco.png"),
  smith_machine_squat: require("../../../assets/exercises/Smith_Machine_Squat_white_background.png"),

  // Piernas - Isquiotibiales
  leg_curl: require("../../../assets/exercises/white_Leg_Curl.png"),
  barbell_deadlift: require("../../../assets/exercises/Barbell Deadlift - fondo blanco.png"),
  romanian_deadlift: require("../../../assets/exercises/white_Romanian_Deadlift.png"),
  dumbbell_deadlift: require("../../../assets/exercises/Dumbbell_Deadlift - fondo blanco.png"),

  // Glúteos
  hip_thrust: require("../../../assets/exercises/Hip_Thrust_white_background.png"),
  hack_squat: require("../../../assets/exercises/Hack_Squat - fondo blanco.png"),
  bulgarian_split_squat: require("../../../assets/exercises/Bulgarian Split Squat - fondo blanco.png"),

  // Core
  barbell_crunch: require("../../../assets/exercises/Barbell Crunch - fondo blanco.png"),
  ab_crunch: require("../../../assets/exercises/Crunch - fondo blanco.png"),
  decline_situps: require("../../../assets/exercises/Decline_Sit-ups - fondo blanco.png"),
  cable_crunch: require("../../../assets/exercises/Cable Crunch - fondo blanco.png"),
  hanging_leg_raise: require("../../../assets/exercises/Hanging_Leg_Raise.png"),
  planks: require("../../../assets/exercises/Plank.png"),

  // Cardio
  treadmill_running: require("../../../assets/exercises/Running_Treadmill.png"),
  stationary_bike: require("../../../assets/exercises/Stationary_Bike.png"),
  jumping_jacks: require("../../../assets/exercises/Jumping_Jacks.png"),
};

/**
 * Obtiene la imagen de un ejercicio por su ID
 * @param exerciseId ID del ejercicio
 * @returns El asset requerido o undefined si no existe
 */
export function getExerciseImage(exerciseId: string): any {
  return EXERCISE_IMAGES[exerciseId];
}
