/**
 * SettingsScreen - Backup y configuración
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { backupService } from "../utils/backup/backup_service";

export default function SettingsScreen() {
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const files = await backupService.listBackups();
      setBackups(files);
    } catch (error) {
      console.error("Error loading backups:", error);
      setBackups([]);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backupPath = await backupService.createBackup("MOBILE");

      Alert.alert("Éxito", "Backup creado correctamente", [
        {
          text: "Compartir",
          onPress: async () => {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(backupPath);
            } else {
              Alert.alert("Info", "Compartir no disponible en este dispositivo");
            }
          },
        },
        { text: "OK" },
      ]);

      await loadBackups();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el backup");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickJsonFile = async (): Promise<string | null> => {
    const res: any = await DocumentPicker.getDocumentAsync({
      type: ["application/json"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    // Nuevas versiones -> res.assets[0].uri
    if (res?.assets?.length) return res.assets[0].uri;

    // Versiones viejas -> res.type === "success" y res.uri
    if (res?.type === "success" && res?.uri) return res.uri;

    return null;
  };

  const handleRestoreBackup = async () => {
    try {
      const uri = await pickJsonFile();
      if (!uri) return;

      Alert.alert(
        "Restaurar Backup",
        "Esto reemplazará todos los datos actuales. ¿Continuar?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Restaurar",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                await backupService.restoreBackup(uri);
                Alert.alert("Éxito", "Backup restaurado. Por favor reinicia la app.");
              } catch (error) {
                Alert.alert("Error", "No se pudo restaurar el backup");
                console.error(error);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBackup = (filename: string) => {
    Alert.alert("Eliminar", `¿Eliminar backup "${filename}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await backupService.deleteBackup(filename);
            await loadBackups();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const handleShareBackup = async (filename: string) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Info", "Compartir no disponible en este dispositivo");
        return;
      }
      const backupPath = `${backupService.BACKUP_DIR}${filename}`;
      await Sharing.shareAsync(backupPath);
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir");
    }
  };

  const parseDateFromFilename = (filename: string) => {
    // hexfit_SOURCE_1700000000000.json
    const parts = filename.split("_");
    const tsPart = parts[2]?.replace(".json", "");
    const ts = Number(tsPart);
    if (!Number.isFinite(ts)) return "";
    return new Date(ts).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });
  };

  const renderBackup = ({ item }: { item: string }) => (
    <View style={styles.backupCard}>
      <View style={styles.backupInfo}>
        <Ionicons name="archive" size={24} color="#00d4ff" />
        <View style={styles.backupDetails}>
          <Text style={styles.backupName}>{item}</Text>
          <Text style={styles.backupDate}>{parseDateFromFilename(item)}</Text>
        </View>
      </View>
      <View style={styles.backupActions}>
        <TouchableOpacity onPress={() => handleShareBackup(item)} style={styles.actionBtn}>
          <Ionicons name="share-social" size={20} color="#00d4ff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBackup(item)} style={styles.actionBtn}>
          <Ionicons name="trash" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup y Restauración</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateBackup} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Crear Backup</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleRestoreBackup} disabled={loading}>
          <Ionicons name="cloud-download" size={24} color="#00d4ff" />
          <Text style={styles.secondaryButtonText}>Restaurar Backup</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backups Locales</Text>
        {backups.length === 0 ? (
          <Text style={styles.emptyText}>No hay backups disponibles</Text>
        ) : (
          <FlatList data={backups} renderItem={renderBackup} keyExtractor={(item) => item} style={styles.backupsList} />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Hexfit v1.0.0</Text>
        <Text style={styles.footerSubtext}>Offline-first workout routine builder</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#333" },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 16 },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#00d4ff",
    padding: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  primaryButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00d4ff",
    gap: 12,
  },
  secondaryButtonText: { color: "#00d4ff", fontSize: 16, fontWeight: "600" },
  backupsList: { maxHeight: 300 },
  backupCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  backupInfo: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  backupDetails: { flex: 1 },
  backupName: { color: "#fff", fontSize: 13, fontWeight: "500" },
  backupDate: { color: "#999", fontSize: 11, marginTop: 2 },
  backupActions: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 8 },
  emptyText: { color: "#666", fontSize: 14, textAlign: "center", paddingVertical: 20 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, alignItems: "center" },
  footerText: { color: "#666", fontSize: 12, fontWeight: "600" },
  footerSubtext: { color: "#444", fontSize: 10, marginTop: 4 },
});
