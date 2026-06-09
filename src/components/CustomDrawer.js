import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
//é so uma mudança nas cores do Drawer padrão pra conseguir colocar os temas escuro e claro, junto com o botao

export default function CustomDrawer(props) {
  const { isDarkMode, onToggleTheme, ...rest } = props;
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <DrawerContentScrollView {...rest}>
        <DrawerItemList {...rest} />
      </DrawerContentScrollView>

      <View
        style={[
          styles.footerContainer,
          {
            borderTopColor: isDarkMode ? "#333" : "#e0e0e0",
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.switchButton,
            {
              backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
            },
          ]}
          onPress={onToggleTheme}
        >
          <Text
            style={{
              color: isDarkMode ? "#fff" : "#1c1c1c",
              fontWeight: "600",
            }}
          >
            {isDarkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
  },
  switchButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
