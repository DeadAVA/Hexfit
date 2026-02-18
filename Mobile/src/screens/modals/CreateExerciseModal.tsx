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
import { useNavigation } from "@react-navigation/native";

/**
 * Modal: Crear Ejercicio
 * - Nombre
 * - Grupo muscular (opcional)
 * - Descripción (opcional)
 * - URL/Path de imagen (opcional, para tu catálogo)
 */
export default function CreateExerciseModal() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState("");

  const canSave = useMemo(() => name.trim().length >= 2, [name]);

  const onClose = () => navigation.goBack();

  const onSave = async () => {
    if (!canSave) {
      Alert.alert("Falta información", "Pon un nombre válido para el ejercicio.");
      return;
    }

    const payload = {
      name: name.trim(),
      muscle: muscle.trim() || null,
      description: description.trim() || null,
      imageUri: imageUri.trim() || null,
      createdAt: new Date().toISOString(),
    };

    try {
      // TODO: aquí conectas tu DB
      // await db.exercises.create(payload)
      // o tu función addExercise(payload)

      // Si quieres avisar a la pantalla anterior, puedes pasar params:
      // navigation.navigate({ name: "ExercisesList", params: { created: true }, merge: true });

      onClose();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el ejercicio.");
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
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Nuevo Ejercicio</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: "#00d4ff", fontSize: 16, fontWeight: "600" }}>Cerrar</Text>
            </Pressable>
          </View>

          <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 12 }}>
            {/* Nombre */}
            <Text style={{ color: "#bbb", marginBottom: 6 }}>Nombre *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej: Press banca"
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

            {/* Grupo */}
            <Text style={{ color: "#bbb", marginBottom: 6 }}>Grupo muscular</Text>
            <TextInput
              value={muscle}
              onChangeText={setMuscle}
              placeholder="Ej: Pecho"
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

            {/* Descripción */}
            <Text style={{ color: "#bbb", marginBottom: 6 }}>Descripción</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tips de técnica, etc."
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

            {/* Imagen */}
            <Text style={{ color: "#bbb", marginBottom: 6 }}>Imagen (URL o path)</Text>
            <TextInput
              value={imageUri}
              onChangeText={setImageUri}
              placeholder="Ej: https://... o assets/..."
              placeholderTextColor="#666"
              style={{
                backgroundColor: "#1a1a1a",
                color: "#fff",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#333",
                marginBottom: 18,
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
              <Text style={{ color: "#001218", fontWeight: "800" }}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
