/**
 * ProgramDayEditorScreen - Editar ejercicios del día con sets/reps
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { database } from "../db/database";
import { Exercise, DayItemWithExercise } from "../shared/types";
import { EXERCISE_IMAGES } from "../shared/constants/exercise_images";
import ExerciseDetailModal from "./modals/ExerciseDetailModal";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Helper para obtener la fuente de imagen correcta
function getImageSource(exercise: Exercise) {
  if (exercise.is_custom === 0 && EXERCISE_IMAGES[exercise.id]) {
    return EXERCISE_IMAGES[exercise.id];
  }
  return { uri: exercise.image_uri };
}

export default function ProgramDayEditorScreen({ route, navigation }: any) {
  const { programDayId, dayLabel } = route.params;

  const [dayItems, setDayItems] = useState<DayItemWithExercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());

  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<DayItemWithExercise | null>(null);
  const [configForm, setConfigForm] = useState({
    sets: "3",
    reps_min: "8",
    reps_max: "12",
    rest_seconds: "60",
    notes: "",
  });

  // Estados para el modal de detalles del ejercicio
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);

  useEffect(() => {
    loadDayItems();
    navigation.setOptions({ title: dayLabel });
  }, [programDayId, dayLabel, navigation]);

  const loadDayItems = () => {
    try {
      const items = database.getDayItemsWithExercises(programDayId);
      setDayItems(items);
    } catch (error) {
      console.error("Error loading day items:", error);
    }
  };

  const handleAddExercises = () => {
    try {
      const allExercises = database.getExercises();
      setExercises(allExercises);
      setSelectedExercises(new Set());
      setModalVisible(true);
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    const newSelection = new Set(selectedExercises);
    if (newSelection.has(exerciseId)) newSelection.delete(exerciseId);
    else newSelection.add(exerciseId);
    setSelectedExercises(newSelection);
  };

  const handleConfirmSelection = () => {
    if (selectedExercises.size === 0) {
      Alert.alert("Info", "Selecciona al menos un ejercicio");
      return;
    }

    try {
      const maxOrder = dayItems.length > 0 ? Math.max(...dayItems.map((item) => item.order_index)) : -1;
      let order = maxOrder + 1;

      selectedExercises.forEach((exerciseId) => {
        database.createDayItem(programDayId, exerciseId, order, 3, 8, 12, 60, "");
        order++;
      });

      setModalVisible(false);
      loadDayItems();
    } catch (error) {
      Alert.alert("Error", "No se pudieron agregar los ejercicios");
    }
  };

  const handleConfigureItem = (item: DayItemWithExercise) => {
    setCurrentItem(item);
    setConfigForm({
      sets: String(item.sets),
      reps_min: String(item.reps_min),
      reps_max: String(item.reps_max),
      rest_seconds: String(item.rest_seconds),
      notes: item.notes || "",
    });
    setConfigModalVisible(true);
  };

  const handleSaveConfig = () => {
    if (!currentItem) return;

    let sets = clamp(parseInt(configForm.sets) || 3, 1, 50);
    let repsMin = clamp(parseInt(configForm.reps_min) || 8, 1, 200);
    let repsMax = clamp(parseInt(configForm.reps_max) || 12, 1, 200);
    if (repsMin > repsMax) [repsMin, repsMax] = [repsMax, repsMin];
    let rest = clamp(parseInt(configForm.rest_seconds) || 60, 0, 3600);

    try {
      database.updateDayItem(
        currentItem.id,
        sets,
        repsMin,
        repsMax,
        rest,
        configForm.notes,
        currentItem.order_index
      );
      setConfigModalVisible(false);
      loadDayItems();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la configuración");
    }
  };

  const handleDeleteItem = (itemId: string, exerciseName: string) => {
    Alert.alert("Eliminar", `¿Eliminar "${exerciseName}" del día?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          try {
            database.deleteDayItem(itemId);
            loadDayItems();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const renderDayItem = ({ item }: { item: DayItemWithExercise }) => {
    if (!item.exercise) return null;

    return (
      <View style={styles.itemCard}>
        <Image source={getImageSource(item.exercise)} style={styles.itemImage} resizeMode="cover" />
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.exercise.name}</Text>
          <Text style={styles.itemConfig}>
            {item.sets} sets × {item.reps_min}-{item.reps_max} reps • {item.rest_seconds}s
          </Text>
          {item.notes ? <Text style={styles.itemNotes} numberOfLines={1}>{item.notes}</Text> : null}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => handleConfigureItem(item)} style={styles.actionBtn}>
            <Ionicons name="settings" size={20} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteItem(item.id, item.exercise!.name)} style={styles.actionBtn}>
            <Ionicons name="trash" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderExerciseOption = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExercises.has(item.id);
    return (
      <View style={styles.exerciseOptionWrapper}>
        <TouchableOpacity
          style={[styles.exerciseOption, isSelected && styles.exerciseOptionSelected]}
          onPress={() => toggleExerciseSelection(item.id)}
        >
          <Image source={getImageSource(item)} style={styles.exerciseOptionImage} resizeMode="cover" />
          <View style={styles.exerciseOptionInfo}>
            <Text style={styles.exerciseOptionName}>{item.name}</Text>
            <Text style={styles.exerciseOptionDetails}>
              {item.muscle_group} • {item.equipment}
            </Text>
          </View>
          {isSelected ? <Ionicons name="checkmark-circle" size={24} color="#00d4ff" /> : null}
        </TouchableOpacity>
        
        {/* Botón de información */}
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            setSelectedExerciseForDetail(item);
            setDetailModalVisible(true);
          }}
        >
          <Ionicons name="information-circle-outline" size={22} color="#00d4ff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={handleAddExercises}>
        <Ionicons name="add-circle" size={28} color="#00d4ff" />
        <Text style={styles.addButtonText}>Agregar Ejercicios</Text>
      </TouchableOpacity>

      {dayItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={80} color="#333" />
          <Text style={styles.emptyText}>No hay ejercicios</Text>
          <Text style={styles.emptySubtext}>Agrega ejercicios para este día</Text>
        </View>
      ) : (
        <FlatList data={dayItems} renderItem={renderDayItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContent} />
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Ejercicios</Text>
            <TouchableOpacity onPress={handleConfirmSelection}>
              <Text style={styles.modalSave}>Agregar ({selectedExercises.size})</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={exercises}
            renderItem={renderExerciseOption}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.exercisesListContent}
          />
        </View>
      </Modal>

      <Modal visible={configModalVisible} animationType="slide" transparent onRequestClose={() => setConfigModalVisible(false)}>
        <View style={styles.configModalOverlay}>
          <View style={styles.configModal}>
            <View style={styles.configModalHeader}>
              <Text style={styles.configModalTitle}>Configurar Ejercicio</Text>
              <TouchableOpacity onPress={() => setConfigModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.configForm}>
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.configLabel}>Sets</Text>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    value={configForm.sets}
                    onChangeText={(text) => setConfigForm({ ...configForm, sets: text })}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.configLabel}>Reps Mín</Text>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    value={configForm.reps_min}
                    onChangeText={(text) => setConfigForm({ ...configForm, reps_min: text })}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.configLabel}>Reps Máx</Text>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    value={configForm.reps_max}
                    onChangeText={(text) => setConfigForm({ ...configForm, reps_max: text })}
                  />
                </View>
              </View>

              <View style={styles.formFieldFull}>
                <Text style={styles.configLabel}>Descanso (segundos)</Text>
                <TextInput
                  style={styles.configInput}
                  keyboardType="numeric"
                  value={configForm.rest_seconds}
                  onChangeText={(text) => setConfigForm({ ...configForm, rest_seconds: text })}
                />
              </View>

              <View style={styles.formFieldFull}>
                <Text style={styles.configLabel}>Notas (opcional)</Text>
                <TextInput
                  style={[styles.configInput, styles.configTextArea]}
                  multiline
                  numberOfLines={3}
                  value={configForm.notes}
                  onChangeText={(text) => setConfigForm({ ...configForm, notes: text })}
                  placeholder="Ej: Usar agarre cerrado"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.configSaveButton} onPress={handleSaveConfig}>
              <Text style={styles.configSaveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DETALLES DEL EJERCICIO */}
      <ExerciseDetailModal
        visible={detailModalVisible}
        exercise={selectedExerciseForDetail}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedExerciseForDetail(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  addButton: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  addButtonText: { color: "#00d4ff", fontSize: 16, fontWeight: "600", marginLeft: 12 },
  listContent: { padding: 12 },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
    overflow: "hidden",
  },
  itemImage: { width: 100, height: 100, backgroundColor: "#333" },
  itemContent: { flex: 1, padding: 12 },
  itemName: { color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 6 },
  itemConfig: { color: "#00d4ff", fontSize: 13, marginBottom: 4 },
  itemNotes: { color: "#999", fontSize: 12, fontStyle: "italic" },
  itemActions: { justifyContent: "center", paddingRight: 12, gap: 8 },
  actionBtn: { padding: 8 },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyText: { color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 20 },
  emptySubtext: { color: "#666", fontSize: 14, marginTop: 8 },

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
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  modalSave: { color: "#00d4ff", fontSize: 16, fontWeight: "600" },

  exercisesListContent: { padding: 12 },
  exerciseOptionWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  exerciseOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  exerciseOptionSelected: { borderColor: "#00d4ff", backgroundColor: "#1a2a2a" },
  exerciseOptionImage: { width: 80, height: 80, backgroundColor: "#333" },
  exerciseOptionInfo: { flex: 1, padding: 12 },
  exerciseOptionName: { color: "#fff", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  exerciseOptionDetails: { color: "#999", fontSize: 12 },
  infoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    padding: 4,
    zIndex: 1,
  },

  configModalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.9)", justifyContent: "center", padding: 20 },
  configModal: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 20, maxHeight: "80%" },
  configModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  configModalTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },

  configForm: { marginBottom: 20 },
  formRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  formField: { flex: 1 },
  formFieldFull: { marginBottom: 16 },

  configLabel: { color: "#999", fontSize: 13, marginBottom: 8 },
  configInput: { backgroundColor: "#0f0f0f", color: "#fff", padding: 12, borderRadius: 6, borderWidth: 1, borderColor: "#333", fontSize: 14 },
  configTextArea: { height: 80, textAlignVertical: "top" },

  configSaveButton: { backgroundColor: "#00d4ff", padding: 16, borderRadius: 8, alignItems: "center" },
  configSaveButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
});
