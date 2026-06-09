import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { TYPE_COLORS } from "../constants/typeColors";
export default function ImageGallery({ images, pokemon }) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(0);
  const mainType = pokemon.types[0]?.type.name ?? "normal";
  const accentColor = TYPE_COLORS[mainType] ?? colors.primary;
  if (images.length === 0) return null;
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: 0,
          overflow: "hidden",
        },
      ]}
    >
      {/* Imagem principal */}
      <View
        style={[
          styles.mainImageContainer,
          {
            backgroundColor: accentColor + "18",
          },
        ]}
      >
        <Image
          source={{
            uri: images[selected].uri,
          }}
          style={styles.mainImage}
          resizeMode="contain"
        />
        {/* Badge com o nome da variação */}
        <View
          style={[
            styles.imageLabelBadge,
            {
              backgroundColor: colors.background + "cc",
            },
          ]}
        >
          <Text
            style={[
              styles.imageLabelText,
              {
                color: colors.text,
              },
            ]}
          >
            {images[selected].label}
          </Text>
        </View>
        {/* Contador */}
        {images.length > 1 && (
          <View
            style={[
              styles.imageCounterBadge,
              {
                backgroundColor: colors.background + "cc",
              },
            ]}
          >
            <Text
              style={[
                styles.imageLabelText,
                {
                  color: colors.text,
                },
              ]}
            >
              {selected + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>

      {/* Miniaturas */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border + "40",
          }}
        >
          {images.map((img, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelected(i)}
              style={[
                styles.thumb,
                {
                  borderColor: i === selected ? accentColor : colors.border,
                  backgroundColor:
                    i === selected ? accentColor + "22" : "transparent",
                },
              ]}
            >
              <Image
                source={{
                  uri: img.uri,
                }}
                style={styles.thumbImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  mainImageContainer: {
    width: "100%",
    height: 340,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imageLabelBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageCounterBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageLabelText: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.9,
  },
  thumbRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImage: {
    width: 54,
    height: 54,
  },
});
