import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { database } from "../db/database";
import Avatar from "../components/Avatar";
import AthleteFormModal from "./modals/AthleteFormModal";

type Sex = "M" | "F" | "X";
type Athlete = {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  avatar_seed: string;
  birth_date?: string;
  height?: string;
  weight?: string;
};

export default function AthletesScreen() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);

  const load = () => setAthletes(database.getAthletes() as any);

  useEffect(() => {
    load();
  }, []);

  const openEdit = (a: Athlete) => {
    setEditing(a);
    setEditOpen(true);
  };

  const remove = (a: Athlete) => {
    Alert.alert("Eliminar", `¿Eliminar atleta "${a.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          database.deleteAthlete(a.id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#0f0f0f" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>
          Atletas
        </Text>

        <Pressable
          onPress={() => setCreateOpen(true)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: "#00d4ff",
          }}
        >
          <Text style={{ color: "#000", fontWeight: "900" }}>+ Alta</Text>
        </Pressable>
      </View>

      <FlatList
        data={athletes}
        keyExtractor={(x) => x.id}
        style={{ marginTop: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openEdit(item)}
            onLongPress={() => remove(item)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: "#222",
            }}
          >
            <Avatar seed={item.avatar_seed} name={item.name} size={44} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: "800", color: "#fff" }}>
                {item.name}
              </Text>
              <Text style={{ color: "#999" }}>
                {item.age} años · {item.sex}
              </Text>
            </View>

            <Text style={{ color: "#666", fontSize: 12 }}>
              (hold = borrar)
            </Text>
          </Pressable>
        )}
      />

      {/* Crear */}
      <AthleteFormModal
        visible={createOpen}
        title="Nuevo Atleta"
        onClose={() => setCreateOpen(false)}
        onSave={(data) => {
          database.createAthlete(
            data.name,
            data.age,
            data.sex,
            data.birthDate,
            data.height,
            data.weight
          );
          setCreateOpen(false);
          load();
        }}
      />

      {/* Editar */}
      <AthleteFormModal
        visible={editOpen}
        title="Editar Atleta"
        initial={
          editing
            ? {
                name: editing.name,
                age: editing.age,
                sex: editing.sex,
                birthDate: editing.birth_date,
                height: editing.height,
                weight: editing.weight,
              }
            : undefined
        }
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSave={(data) => {
          if (!editing) return;
          database.updateAthlete(
            editing.id,
            data.name,
            data.age,
            data.sex,
            data.birthDate,
            data.height,
            data.weight
          );
          setEditOpen(false);
          setEditing(null);
          load();
        }}
      />
    </View>
  );
}
