// ../screens/modals/EditAthleteModal.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function EditAthleteModal() {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flex: 1, backgroundColor: "#111", padding: 16, justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Editar Atleta</Text>
      <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
        <Text style={{ color: "#00d4ff", fontWeight: "700" }}>Cerrar</Text>
      </Pressable>
    </View>
  );
}
