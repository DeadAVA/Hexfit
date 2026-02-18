/**
 * ProgramEditorScreen - Vista semanal del programa (Lun-Sab)
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { database } from "../db/database";
import { Program, ProgramDay } from "../shared/types";
import { DAYS_OF_WEEK, getDayLabel } from "../shared/types";

export default function ProgramEditorScreen({ route, navigation }: any) {
  const { programId } = route.params;
  const [program, setProgram] = useState<Program | null>(null);
  const [programDays, setProgramDays] = useState<ProgramDay[]>([]);

  useEffect(() => {
    loadProgram();
  }, [programId]);

  const loadProgram = () => {
    try {
      const prog = database.getProgramById(programId);
      const days = database.getProgramDays(programId);
      setProgram(prog);
      setProgramDays(days);
    } catch (error) {
      console.error("Error loading program:", error);
    }
  };

  const handleDayPress = (dayOfWeek: number) => {
    // Buscar o crear día
    let day = programDays.find((d) => d.day_of_week === dayOfWeek);
    if (!day) {
      day = database.createProgramDay(programId, dayOfWeek);
      loadProgram();
    }
    navigation.navigate("ProgramDayEditor", {
      programDayId: day.id,
      dayLabel: getDayLabel(dayOfWeek),
    });
  };

  const getDayItemsCount = (dayOfWeek: number) => {
    const day = programDays.find((d) => d.day_of_week === dayOfWeek);
    if (!day) return 0;
    const items = database.getDayItems(day.id);
    return items.length;
  };

  const renderDay = (dayOfWeek: number) => {
    const count = getDayItemsCount(dayOfWeek);
    const isConfigured = count > 0;

    return (
      <TouchableOpacity
        key={dayOfWeek}
        style={[styles.dayCard, isConfigured && styles.dayCardActive]}
        onPress={() => handleDayPress(dayOfWeek)}
      >
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>{getDayLabel(dayOfWeek)}</Text>
          {isConfigured && (
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>{count}</Text>
            </View>
          )}
        </View>
        <Text style={styles.daySubtext}>
          {isConfigured ? `${count} ejercicio${count > 1 ? "s" : ""}` : "Vacío"}
        </Text>
        <Ionicons
          name={isConfigured ? "checkmark-circle" : "add-circle-outline"}
          size={24}
          color={isConfigured ? "#00d4ff" : "#666"}
          style={styles.dayIcon}
        />
      </TouchableOpacity>
    );
  };

  if (!program) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Programa no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.programTitle}>{program.name}</Text>
        {program.notes && (
          <Text style={styles.programNotes}>{program.notes}</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Días de la Semana</Text>
        <Text style={styles.sectionSubtext}>
          Toca un día para agregar ejercicios
        </Text>

        <View style={styles.daysGrid}>
          {DAYS_OF_WEEK.map((day) => renderDay(day.value))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#1a1a1a",
  },
  programTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  programNotes: {
    color: "#999",
    fontSize: 13,
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionSubtext: {
    color: "#666",
    fontSize: 13,
    marginBottom: 20,
  },
  daysGrid: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayCardActive: {
    borderColor: "#00d4ff",
    backgroundColor: "#1a2a2a",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dayLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dayBadge: {
    backgroundColor: "#00d4ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dayBadgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
  daySubtext: {
    color: "#999",
    fontSize: 13,
    flex: 1,
    textAlign: "right",
    marginRight: 12,
  },
  dayIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});
