import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPE_COLORS } from "../constants/typeColors";

// é uma div simples pra ficar diferente a corzinha pra cada coisa, ai fica bonitinho
// e as cores ficam combinando com a tematica geral do pokemon, e da tela

export default function TypeBadge({ typeName }) {
  const color = TYPE_COLORS[typeName] ?? "#888";
  return (
    <View
      style={[
        styles.typeBadge,
        {
          backgroundColor: color,
        },
      ]}
    >
      <Text style={styles.typeBadgeText}>{typeName.toUpperCase()}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },
});
