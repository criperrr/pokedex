import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
// a div de cadeia de evolução de forma mais ou menos generica

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function formatName(s) {
  return s.split("-").map(capitalize).join(" ");
}
export default function EvolutionChainBanner({
  paths,
  currentId,
  accentColor,
  onPress,
}) {
  const { colors } = useTheme();
  if (paths.length === 0) return null;
  const mainPath =
    paths.find((p) => p.some((s) => s.id === currentId)) ?? paths[0];
  const spriteUrl = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  return (
    <View
      style={[
        styles.evoBanner,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.evoBannerInner}
      >
        {mainPath.map((stage, i) => {
          const isCurrent = stage.id === currentId;
          return (
            <React.Fragment key={stage.id}>
              {i > 0 && (
                <Text
                  style={[
                    styles.evoBannerArrow,
                    {
                      color: accentColor,
                    },
                  ]}
                >
                  ▶
                </Text>
              )}
              <TouchableOpacity
                onPress={() => onPress(stage.id)}
                activeOpacity={isCurrent ? 1 : 0.7}
                style={[
                  styles.evoBannerItem,
                  isCurrent && {
                    backgroundColor: accentColor + "22",
                    borderColor: accentColor,
                  },
                ]}
              >
                <Image
                  source={{
                    uri: spriteUrl(stage.id),
                  }}
                  style={styles.evoBannerSprite}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.evoBannerName,
                    {
                      color: isCurrent ? accentColor : colors.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {formatName(stage.name)}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  evoBanner: {
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
  },
  evoBannerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  evoBannerItem: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  evoBannerSprite: {
    width: 52,
    height: 52,
  },
  evoBannerName: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },
  evoBannerArrow: {
    fontSize: 14,
    fontWeight: "900",
    marginHorizontal: 2,
  },
  // Seta de evolução (não usada no banner, mas disponível para extensão futura)
  evoArrowContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
  },
  evoArrowLine: {
    width: 2,
    height: 30,
    transform: [
      {
        rotate: "90deg",
      },
    ],
  },
  evoArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -4,
  },
  evoConditionBubble: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 4,
    alignItems: "center",
  },
  evoConditionText: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
