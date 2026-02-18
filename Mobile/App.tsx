/**
 * App.tsx - Entry point para React Native (Expo)
 * Inicializa la base de datos y la navegación
 * + Smooth transitions: enableScreens + gesture handler root
 */

import "react-native-gesture-handler"; // ✅ siempre arriba de todo
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { enableScreens } from "react-native-screens";

import { database } from "./src/db/database";
import RootNavigator from "./src/navigation/RootNavigator";

// ✅ Hace stacks/tabs más fluidos (nativo)
enableScreens(true);

export default function App() {
  useEffect(() => {
    try {
      // Si tu database requiere init explícito, hazlo aquí.
      // database.init?.();
      console.log("✓ Database initialized");
    } catch (error) {
      console.error("✗ Database initialization failed:", error);
    }
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <RootNavigator />
    </>
  );
}
