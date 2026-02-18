/**
 * Navegación principal con tabs (Atletas, Programas, Ejercicios, Ajustes)
 * + Transiciones más suaves (SIN props que rompen types):
 *   - Fade al cambiar de tab usando Animated + useFocusEffect
 *   - Stacks con animación nativa "slide_from_right"
 *   - Tema oscuro para evitar flash blanco
 */

import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { NavigationContainer, DefaultTheme, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import AthletesScreen from "../screens/AthletesScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import ProgramsScreen from "../screens/ProgramsScreen";
import SettingsScreen from "../screens/SettingsScreen";

// Modals
import EditAthleteModal from "../screens/modals/EditAthleteModal";
import CreateExerciseModal from "../screens/modals/CreateExerciseModal";
import CreateProgramModal from "../screens/modals/CreateProgramModal";
import ProgramEditorScreen from "../screens/ProgramEditorScreen";
import ProgramDayEditorScreen from "../screens/ProgramDayEditorScreen";

const Tab = createBottomTabNavigator();

const AthletesStack = createNativeStackNavigator();
const ProgramsStack = createNativeStackNavigator();
const ExercisesStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

/** ✅ Tema oscuro para evitar “flash” blanco */
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0f0f0f",
    card: "#1a1a1a",
    text: "#fff",
    border: "#333",
    primary: "#00d4ff",
    notification: "#00d4ff",
  },
};

/** ✅ Wrapper para animar suave cada tab */
function FadeScreen({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useFocusEffect(
    React.useCallback(() => {
      // reset
      opacity.setValue(0);
      translateY.setValue(6);

      const anim = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

      anim.start();

      return () => {
        // al salir, no hacemos fade-out para que se sienta rápido
      };
    }, [opacity, translateY])
  );

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

/** ✅ Opciones base para stacks (transición nativa smooth) */
const stackScreenOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: "#1a1a1a" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },

  // ✅ Animación nativa (más suave que interpolator manual)
  animation: "slide_from_right" as const,

  // Gestos agradables
  gestureEnabled: true,
  gestureDirection: "horizontal" as const,

  // Fondo consistente (evita parpadeo)
  contentStyle: { backgroundColor: "#0f0f0f" },
};

// Athletes Stack
function AthletesStackNavigator() {
  return (
    <FadeScreen>
      <AthletesStack.Navigator screenOptions={stackScreenOptions}>
        <AthletesStack.Screen
          name="AthletesList"
          component={AthletesScreen}
          options={{ title: "Atletas" }}
        />
        <AthletesStack.Group
          screenOptions={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        >
          <AthletesStack.Screen
            name="EditAthleteModal"
            component={EditAthleteModal}
            options={{ title: "Editar Atleta" }}
          />
        </AthletesStack.Group>
      </AthletesStack.Navigator>
    </FadeScreen>
  );
}

// Programs Stack
function ProgramsStackNavigator() {
  return (
    <FadeScreen>
      <ProgramsStack.Navigator screenOptions={stackScreenOptions}>
        <ProgramsStack.Screen
          name="ProgramsList"
          component={ProgramsScreen}
          options={{ title: "Programas" }}
        />

        <ProgramsStack.Group
          screenOptions={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        >
          <ProgramsStack.Screen
            name="CreateProgramModal"
            component={CreateProgramModal}
            options={{ title: "Crear Programa" }}
          />
        </ProgramsStack.Group>

        <ProgramsStack.Screen
          name="ProgramEditor"
          component={ProgramEditorScreen}
          options={{ title: "Editar Programa" }}
        />

        <ProgramsStack.Screen
          name="ProgramDayEditor"
          component={ProgramDayEditorScreen}
          options={{ title: "Editar Día" }}
        />
      </ProgramsStack.Navigator>
    </FadeScreen>
  );
}

// Exercises Stack
function ExercisesStackNavigator() {
  return (
    <FadeScreen>
      <ExercisesStack.Navigator screenOptions={stackScreenOptions}>
        <ExercisesStack.Screen
          name="ExercisesList"
          component={ExercisesScreen}
          options={{ title: "Ejercicios" }}
        />

        <ExercisesStack.Group
          screenOptions={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        >
          <ExercisesStack.Screen
            name="CreateExerciseModal"
            component={CreateExerciseModal}
            options={{ title: "Nuevo Ejercicio" }}
          />
        </ExercisesStack.Group>
      </ExercisesStack.Navigator>
    </FadeScreen>
  );
}

// Settings Stack
function SettingsStackNavigator() {
  return (
    <FadeScreen>
      <SettingsStack.Navigator screenOptions={stackScreenOptions}>
        <SettingsStack.Screen
          name="SettingsList"
          component={SettingsScreen}
          options={{ title: "Ajustes" }}
        />
      </SettingsStack.Navigator>
    </FadeScreen>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#1a1a1a",
          borderTopColor: "#333",
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#00d4ff",
        tabBarInactiveTintColor: "#666",
        tabBarHideOnKeyboard: false,
      }}
    >
      <Tab.Screen
        name="AthletesTab"
        component={AthletesStackNavigator}
        options={{
          tabBarLabel: "Atletas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ProgramsTab"
        component={ProgramsStackNavigator}
        options={{
          tabBarLabel: "Programas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ExercisesTab"
        component={ExercisesStackNavigator}
        options={{
          tabBarLabel: "Ejercicios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
}
