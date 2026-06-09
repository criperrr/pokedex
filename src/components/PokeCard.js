import React from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";

// essa é a simplesmente a div que tem o sprite e o nome, o quadrado arredondado pra mostrar a miniatura clicável

export default function PokeCard({ id, name, onPress }) {
  const { colors } = useTheme();
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: pressed ? colors.primary : colors.border,
          transform: [
            {
              scale: pressed ? 0.96 : 1,
            },
          ],
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: imageUrl,
          }}
          style={styles.image}
        />
      </View>

      <Text
        style={[
          styles.name,
          {
            color: colors.text,
          },
        ]}
        numberOfLines={1}
      >
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </Text>

      <Text
        style={[
          styles.id,
          {
            color: colors.text,
          },
        ]}
      >
        #{id.toString().padStart(3, "0")}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  id: {
    fontSize: 12,
    opacity: 0.7,
  },
});
