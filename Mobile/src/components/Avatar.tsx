import React from "react";
import { View, Text, StyleSheet } from "react-native";

type AvatarProps = {
  seed: string;
  /** Puedes pasar name o label (porque en tu AthletesScreen usas label) */
  name?: string;
  label?: string;
  size?: number;
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

function getColorFromSeed(seed: string): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B88B",
    "#82E0AA",
    "#F1948A",
    "#AED6F1",
    "#F5B7B1",
    "#A9DFBF",
    "#D7BCCB",
  ];

  const hash = hashCode(seed || "seed");
  const index = Math.abs(hash % colors.length);
  return colors[index];
}

export default function Avatar({ seed, name, label, size = 50 }: AvatarProps) {
  const text = (name ?? label ?? "").trim();
  const backgroundColor = getColorFromSeed(seed);

  const initials =
    text.length === 0
      ? "?"
      : text
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: Math.max(12, size / 2.5) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#fff",
    fontWeight: "700",
  },
});
