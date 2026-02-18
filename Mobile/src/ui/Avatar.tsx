import React from "react";
import { View, Text } from "react-native";

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({ seed, size = 42, label }: { seed: string; size?: number; label: string }) {
  const h = hash(seed);
  const bg = `hsl(${h % 360}, 70%, 55%)`;
  const initials = label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>{initials || "A"}</Text>
    </View>
  );
}
