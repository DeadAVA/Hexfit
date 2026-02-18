import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { database } from "../db/database";
import { Program, Athlete } from "../shared/types";
import Avatar from "../components/Avatar";
import { exportProgramToPDF } from "../utils/pdf_export";

export default function ProgramsScreen({ navigation }: any) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    athlete_id: "",
    name: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
    const unsubscribe = navigation?.addListener?.("focus", () => loadData());
    return unsubscribe;
  }, [navigation]);

  const loadData = () => {
    try {
      setPrograms(database.getPrograms());
      setAthletes(database.getAthletes());
    } catch (e) {
      console.error("Error loading:", e);
    }
  };

  const handleCreateProgram = () => {
    if (athletes.length === 0) return Alert.alert("Info", "Primero crea un atleta");
    setFormData({ athlete_id: athletes[0].id, name: "", notes: "" });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return Alert.alert("Error", "El nombre es requerido");

    try {
      const program = database.createProgram(
        formData.athlete_id,
        formData.name.trim(),
        formData.notes?.trim()
      );
      setModalVisible(false);
      loadData();
      navigation.navigate("ProgramEditor", { programId: program.id });
    } catch {
      Alert.alert("Error", "No se pudo crear el programa");
    }
  };

  const handleDeleteProgram = (id: string, name: string) => {
    Alert.alert("Eliminar", `¿Eliminar programa "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          database.deleteProgram(id);
          loadData();
        },
      },
    ]);
  };

  const handleExportToPDF = async (program: Program) => {
    try {
      setExportingId(program.id);
      await exportProgramToPDF(program.id);
      Alert.alert("Éxito", "Programa exportado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo exportar el programa a PDF");
      console.error(error);
    } finally {
      setExportingId(null);
    }
  };

  const athleteById = useMemo(() => {
    const m = new Map<string, Athlete>();
    athletes.forEach((a) => m.set(a.id, a));
    return m;
  }, [athletes]);

  const renderProgram = ({ item }: { item: Program }) => {
    const athlete = athleteById.get(item.athlete_id);
    const isExporting = exportingId === item.id;
    
    return (
      <TouchableOpacity
        style={styles.programCard}
        onPress={() => navigation.navigate("ProgramEditor", { programId: item.id })}
        disabled={isExporting}
      >
        <View style={styles.programHeader}>
          {athlete && <Avatar seed={athlete.avatar_seed} name={athlete.name} size={40} />}
          <View style={styles.programInfo}>
            <Text style={styles.programName}>{item.name}</Text>
            <Text style={styles.programAthlete}>{athlete?.name || "Atleta desconocido"}</Text>
            {!!item.notes && (
              <Text style={styles.programNotes} numberOfLines={2}>
                {item.notes}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {isExporting ? (
            <ActivityIndicator size="small" color="#00d4ff" style={styles.actionBtn} />
          ) : (
            <>
              <TouchableOpacity 
                onPress={() => handleExportToPDF(item)} 
                style={styles.actionBtn}
              >
                <Ionicons name="download-outline" size={20} color="#00d4ff" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteProgram(item.id, item.name)} 
                style={styles.actionBtn}
              >
                <Ionicons name="trash" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateProgram}>
        <Ionicons name="add-circle" size={28} color="#00d4ff" />
        <Text style={styles.createButtonText}>Crear Programa</Text>
      </TouchableOpacity>

      {programs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#333" />
          <Text style={styles.emptyText}>No hay programas todavía</Text>
          <Text style={styles.emptySubtext}>Crea uno para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={programs}
          renderItem={renderProgram}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* MODAL NUEVO PROGRAMA */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo Programa</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Crear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Atleta</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {athletes.map((a) => {
                const active = formData.athlete_id === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => setFormData((s) => ({ ...s, athlete_id: a.id }))}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 10,
                      borderRadius: 12,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: active ? "#00d4ff" : "#333",
                      backgroundColor: active ? "#00d4ff" : "#1a1a1a",
                    }}
                  >
                    <Avatar seed={a.avatar_seed} name={a.name} size={34} />
                    <Text style={{ marginLeft: 10, fontWeight: "800", color: active ? "#000" : "#fff" }}>
                      {a.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>Nombre del Programa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Push/Pull"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(t) => setFormData((s) => ({ ...s, name: t }))}
            />

            <Text style={styles.label}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={(t) => setFormData((s) => ({ ...s, notes: t }))}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  createButton: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  createButtonText: { color: "#00d4ff", fontSize: 16, fontWeight: "600", marginLeft: 12 },
  listContent: { padding: 12 },
  programCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  programHeader: { flexDirection: "row", alignItems: "center", flex: 1 },
  programInfo: { marginLeft: 12, flex: 1 },
  programName: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  programAthlete: { color: "#00d4ff", fontSize: 13, marginBottom: 4 },
  programNotes: { color: "#999", fontSize: 12 },
  actionsContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  modalContent: { padding: 20 },
  label: { color: "#fff", fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 14,
  },
  textArea: { height: 100, textAlignVertical: "top" },
});
