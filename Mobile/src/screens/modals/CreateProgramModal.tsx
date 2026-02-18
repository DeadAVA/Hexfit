import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

/**
 * Modal: Crear Programa
 * Params opcionales:
 * - athleteId: number|string
 * - athleteName: string
 */
export default function CreateProgramModal() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [programName, setProgramName] = useState("");
  const [notes, setNotes] = useState("");

  // Si vienes desde "selecciona atleta", puedes pasar params.
  const [athleteName, setAthleteName] = useState(route.params?.athleteName ?? "");
  const [athleteId, setAthleteId] = useState(route.params?.athleteId ?? null);

  const canSave = useMemo(() => programName.trim().length >= 2, [programName]);

  const onClose = () => navigation.goBack();

  const onSave = async () => {
    if (!canSave) {
      Alert.alert("Falta información", "Pon un nombre válido para el programa.");
      return;
    }

    const payload = {
      name: programName.trim(),
      notes: notes.trim() || null,
      athleteId: athleteId ?? null, // si aún no lo manejas, queda null
      athleteName: athleteName.trim() || null,
      createdAt: new Date().toISOString(),
    };

    try {
      // TODO: Guardar en DB
      // const newProgramId = await db.programs.create(payload)

      // Opcional: luego navegar al editor con el ID del programa:
      // navigation.replace("ProgramEditor", { programId: newProgramId });

      onClose();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el programa.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#00000088" }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            backgroundColor: "#111",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 18,
            maxHeight: "85%",
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Crear Programa</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: "#00d4ff", fontSize: 16, fontWeight: "600" }}>Cerrar</Text>
            </Pressable>
          </View>

          <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 12 }}>
            {/* Programa */}
            <Text style={{ color: "#bbb", marginBottom: 6 }}>Nombre del programa *</Text>
            <TextInput
              value={programName}
              onChangeText={setProgramName}
              placeholder="Ej: Hipertrofia 6 semanas"
              placeholderTextColor="#666"
              style={{
                backgroundColor: "#1a1a1a",
                color: "#fff",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#333",
                marginBottom: 12,
              }}
            />

            {/* Atleta (temporal) */}
            <Text style={{ color: "#bbb", marginBottom: 6 }}>Atleta (opcional por ahora)</Text>
            <TextInput
              value={athleteName}
              onChangeText={(t) => {
                setAthleteName(t);
                setAthleteId(null); // si lo editas manual, resetea id
              }}
              placeholder="Ej: Alan Villalobos"
              placeholderTextColor="#666"
              style={{
                backgroundColor: "#1a1a1a",
                color: "#fff",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#333",
                marginBottom: 12,
              }}
            />

            {/* Notas */}
            <Text style={{ color: "#bbb", marginBottom: 6 }}>Notas</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Objetivo, recomendaciones, etc."
              placeholderTextColor="#666"
              multiline
              style={{
                backgroundColor: "#1a1a1a",
                color: "#fff",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#333",
                minHeight: 90,
                textAlignVertical: "top",
                marginBottom: 12,
              }}
            />
          </ScrollView>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#222",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#333",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={onSave}
              disabled={!canSave}
              style={{
                flex: 1,
                backgroundColor: canSave ? "#00d4ff" : "#0a3b44",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#001218", fontWeight: "800" }}>Crear</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
