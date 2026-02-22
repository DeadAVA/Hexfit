/**
 * ExercisesScreen - Catálogo de ejercicios con filtros (SIN ASSETS / SIN CRASH)
 * - Soporta URIs reales (file://, content://, http(s)://) para custom
 * - Si no hay imagen válida, muestra placeholder (icono) en lugar de <Image/>
 * - Así Metro NO falla por rutas de assets inexistentes
 *
 * + BOTÓN "COPIAR CÓDIGO" (expo-clipboard)
 *
 * + FILTROS arreglados:
 *   - No se amontonan / no se aplastan
 *   - Separación correcta entre filas
 *   - Empty state cuando no hay resultados (especialmente en Custom)
 *   - Botón "Limpiar filtros"
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import { database } from "../db/database";
import { Exercise } from "../shared/types";
import { MUSCLE_GROUPS, EQUIPMENT_OPTIONS } from "../shared/constants/exercises_catalog";
import { EXERCISE_IMAGES } from "../shared/constants/exercise_images";
import ExerciseDetailModal from "./modals/ExerciseDetailModal";

function isRealUri(uri?: string) {
  if (!uri) return false;
  const u = uri.trim();
  return (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("file://") ||
    u.startsWith("content://")
  );
}

function getImageUri(item: Exercise) {
  const raw = (item.image_uri || "").trim();
  if (isRealUri(raw)) return raw;
  return ""; // si no es URI real, no intentamos cargar imagen
}

// ✅ Copia robusta (content:// -> base64 fallback)
async function copyImageToAppDir(srcUri: string, destUri: string) {
  try {
    await FileSystem.copyAsync({ from: srcUri, to: destUri });
    return;
  } catch (e) {
    const base64 = await FileSystem.readAsStringAsync(srcUri, {
      encoding: "base64", // ✅ en vez de FileSystem.EncodingType.Base64
    });

    await FileSystem.writeAsStringAsync(destUri, base64, {
      encoding: "base64", // ✅ en vez de FileSystem.EncodingType.Base64
    });
  }
}


export default function ExercisesScreen({ navigation }: any) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  // Modal para crear ejercicio custom
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    muscle_group: "Pecho",
    equipment: "Barra",
    image_uri: "",
  });

  // Modal para ver detalles del ejercicio
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const loadExercises = () => {
    try {
      const data = database.getExercises();
      setExercises(data);
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  useEffect(() => {
    loadExercises();
    const unsub = navigation?.addListener?.("focus", loadExercises);
    return unsub;
  }, [navigation]);

  const filteredExercises = useMemo(() => {
    let filtered = [...exercises];

    if (showCustomOnly) filtered = filtered.filter((e) => e.is_custom === 1);
    if (selectedMuscle) filtered = filtered.filter((e) => e.muscle_group === selectedMuscle);
    if (selectedEquipment) filtered = filtered.filter((e) => e.equipment === selectedEquipment);

    const s = searchText.trim().toLowerCase();
    if (s) filtered = filtered.filter((e) => e.name.toLowerCase().includes(s));

    return filtered;
  }, [exercises, searchText, selectedMuscle, selectedEquipment, showCustomOnly]);

  const handleAddCustom = () => {
    setFormData({ name: "", muscle_group: "Pecho", equipment: "Barra", image_uri: "" });
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso", "Se requiere acceso a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      setFormData((p) => ({ ...p, image_uri: result.assets[0].uri }));
    }
  };

  const ensureCustomDir = async () => {
    const docDir = (FileSystem as any).documentDirectory as string | null | undefined;
    const cacheDir = (FileSystem as any).cacheDirectory as string | null | undefined;
    const base = docDir ?? cacheDir;
    if (!base) throw new Error("No hay directorio de FileSystem disponible");

    const customDir = `${base}custom_exercises/`;
    const dirInfo = await FileSystem.getInfoAsync(customDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(customDir, { intermediates: true });
    }
    return customDir;
  };

  const handleSaveCustom = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }

    try {
      let finalImageUri = "";

      if (formData.image_uri) {
        const customDir = await ensureCustomDir();
        const exerciseId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const guessedExt =
          formData.image_uri.split("?")[0].split(".").pop()?.toLowerCase() || "";
        const ext = ["jpg", "jpeg", "png", "webp"].includes(guessedExt) ? guessedExt : "jpg";

        const filename = `${exerciseId}.${ext}`;
        const newPath = `${customDir}${filename}`;

        await copyImageToAppDir(formData.image_uri, newPath);
        finalImageUri = newPath;
      } else {
        finalImageUri = "";
      }

      database.createCustomExercise(
        formData.name.trim(),
        formData.muscle_group,
        formData.equipment,
        finalImageUri
      );

      setModalVisible(false);
      loadExercises();
      Alert.alert("Éxito", "Ejercicio creado");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el ejercicio");
      console.error(error);
    }
  };

  const handleDeleteCustom = (id: any, name: string, imageUri?: string) => {
    Alert.alert("Eliminar", `¿Eliminar ejercicio "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const uri = (imageUri || "").trim();
            if (uri.startsWith("file://") && uri.includes("custom_exercises/")) {
              try {
                await FileSystem.deleteAsync(uri, { idempotent: true });
              } catch {}
            }

            database.deleteExercise(String(id));
            loadExercises();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const ExerciseImage = ({ item }: { item: Exercise }) => {
    // Si es ejercicio predefinido (no custom), usar assets locales
    if (item.is_custom === 0) {
      const assetImage = EXERCISE_IMAGES[item.id];
      if (assetImage) {
        return (
          <Image
            source={assetImage}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        );
      }
    }

    // Si es custom o no tiene asset, intentar cargar desde URI
    const uri = getImageUri(item);
    if (!uri) {
      return (
        <View style={styles.exerciseImagePlaceholder}>
          <Ionicons name="barbell-outline" size={34} color="#666" />
          <Text style={styles.placeholderText} numberOfLines={1}>
            Sin imagen
          </Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri }}
        style={styles.exerciseImage}
        resizeMode="cover"
        onError={(e) => {
          console.log("Image error:", item.name, item.image_uri, e.nativeEvent?.error);
        }}
      />
    );
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => {
        setSelectedExercise(item);
        setDetailModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <ExerciseImage item={item} />

      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.exerciseDetails} numberOfLines={1}>
          {item.muscle_group} • {item.equipment}
        </Text>

        {item.is_custom === 1 && (
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteCustom((item as any).id, item.name, item.image_uri);
            }}
          >
            <Ionicons name="trash" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterChip = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      style={[styles.filterChip, isSelected && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const hasAnyFilter =
    showCustomOnly || !!selectedMuscle || !!selectedEquipment || !!searchText.trim();

  const clearAllFilters = () => {
    setShowCustomOnly(false);
    setSelectedMuscle("");
    setSelectedEquipment("");
    setSearchText("");
  };

  // ✅ Código completo para copiar al portapapeles (opcional, pero lo dejamos)
  const FULL_SCREEN_CODE = "Pega aquí tu código si quieres que copie TODO el archivo tal cual.";

  const handleCopyCode = async () => {
    // Si quieres copiar literalmente el archivo completo, puedes reemplazar FULL_SCREEN_CODE
    // por el contenido completo (String.raw`...`) como lo tenías antes.
    await Clipboard.setStringAsync(FULL_SCREEN_CODE);
    Alert.alert("Copiado", "El código fue copiado al portapapeles ✅");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicios..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* ✅ Botón Copiar Código */}
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Ionicons name="copy-outline" size={22} color="#00d4ff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAddCustom}>
          <Ionicons name="add-circle" size={32} color="#00d4ff" />
        </TouchableOpacity>
      </View>

      {/* ✅ FILTROS ARREGLADOS */}
      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.filtersRow}
        >
          {renderFilterChip("Custom", showCustomOnly, () => setShowCustomOnly((p) => !p))}

          {MUSCLE_GROUPS.map((muscle) => (
            <View key={muscle}>
              {renderFilterChip(muscle, selectedMuscle === muscle, () =>
                setSelectedMuscle((p) => (p === muscle ? "" : muscle))
              )}
            </View>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.filtersRow}
        >
          {EQUIPMENT_OPTIONS.map((eq) => (
            <View key={eq}>
              {renderFilterChip(eq, selectedEquipment === eq, () =>
                setSelectedEquipment((p) => (p === eq ? "" : eq))
              )}
            </View>
          ))}
        </ScrollView>

        {hasAnyFilter && (
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
            <Ionicons name="close-circle" size={18} color="#00d4ff" />
            <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LISTA */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => String((item as any).id)}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          filteredExercises.length === 0 && { flexGrow: 1 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search" size={42} color="#666" />
            <Text style={styles.emptyTitle}>No hay ejercicios con estos filtros</Text>
            <Text style={styles.emptySubtitle}>
              {showCustomOnly
                ? "No tienes ejercicios Custom todavía. Crea uno con el botón +"
                : "Prueba cambiando músculo/equipo o limpia filtros."}
            </Text>

            <View style={{ height: 12 }} />

            <TouchableOpacity style={styles.emptyBtn} onPress={clearAllFilters}>
              <Text style={styles.emptyBtnText}>Quitar filtros</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* MODAL NUEVO EJERCICIO */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo Ejercicio</Text>
            <TouchableOpacity onPress={handleSaveCustom}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
              {formData.image_uri ? (
                <Image source={{ uri: formData.image_uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#666" />
                  <Text style={styles.imagePlaceholderText}>Seleccionar imagen</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del ejercicio"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(text) => setFormData((p) => ({ ...p, name: text }))}
            />

            <Text style={styles.label}>Músculo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MUSCLE_GROUPS.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.optionChip,
                    formData.muscle_group === muscle && styles.optionChipActive,
                  ]}
                  onPress={() => setFormData((p) => ({ ...p, muscle_group: muscle }))}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.muscle_group === muscle && styles.optionChipTextActive,
                    ]}
                  >
                    {muscle}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Equipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <TouchableOpacity
                  key={eq}
                  style={[styles.optionChip, formData.equipment === eq && styles.optionChipActive]}
                  onPress={() => setFormData((p) => ({ ...p, equipment: eq }))}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.equipment === eq && styles.optionChipTextActive,
                    ]}
                  >
                    {eq}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL DETALLES DEL EJERCICIO */}
      <ExerciseDetailModal
        visible={detailModalVisible}
        exercise={selectedExercise}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedExercise(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },

  header: { flexDirection: "row", padding: 12, alignItems: "center", gap: 8 },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#202020",
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },

  addButton: { padding: 4 },

  copyButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    backgroundColor: "#141414",
  },

  /* ✅ FILTROS */
  filtersWrap: {
    paddingTop: 6,
    paddingBottom: 8,
  },
  filtersRow: {
    marginBottom: 10, // ✅ separa filas (más compatible que gap)
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingRight: 18,
    alignItems: "center",
  },

  filterChip: {
    backgroundColor: "#1a1a1a",
    height: 36, // ✅ alto fijo
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0, // ✅ NO se aplasta
    minWidth: 74, // ✅ evita “pastilla mini”
  },
  filterChipActive: { backgroundColor: "#00d4ff", borderColor: "#00d4ff" },

  filterChipText: {
    color: "#999",
    fontSize: 13,
    fontWeight: "800",
    includeFontPadding: false,
  },
  filterChipTextActive: { color: "#000" },

  clearFiltersBtn: {
    alignSelf: "flex-start",
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    backgroundColor: "#121212",
  },
  clearFiltersText: { color: "#00d4ff", fontWeight: "800" },

  /* ✅ LISTA */
  listContent: { padding: 12 },

  exerciseCard: {
    flex: 1,
    margin: 6,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },

  exerciseImage: { width: "100%", height: 120, backgroundColor: "#333" },

  exerciseImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#141414",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  placeholderText: { color: "#666", fontSize: 12 },

  exerciseInfo: { padding: 12, minHeight: 70 },
  exerciseName: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  exerciseDetails: { color: "#999", fontSize: 12 },

  deleteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#0f0f0f",
    padding: 6,
    borderRadius: 12,
  },

  /* ✅ EMPTY STATE */
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingTop: 30,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#999",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#00d4ff",
  },
  emptyBtnText: { color: "#000", fontWeight: "900" },

  /* ✅ MODAL */
  modal: { flex: 1, backgroundColor: "#0f0f0f", paddingTop: 40 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  modalClose: { color: "#999", fontSize: 16 },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalSave: { color: "#00d4ff", fontSize: 16, fontWeight: "700" },
  modalContent: { padding: 20 },

  imagePickerButton: { marginBottom: 20 },
  previewImage: { width: "100%", height: 200, borderRadius: 10 },

  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
    borderStyle: "dashed",
  },
  imagePlaceholderText: { color: "#666", marginTop: 8, fontSize: 14 },

  label: { color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 16, marginBottom: 12 },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 14,
  },

  optionChip: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  optionChipActive: { backgroundColor: "#00d4ff", borderColor: "#00d4ff" },
  optionChipText: { color: "#999", fontSize: 13, fontWeight: "700" },
  optionChipTextActive: { color: "#000" },
});
