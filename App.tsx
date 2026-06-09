import "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer, Theme } from "@react-navigation/native";
import React, { useState } from "react";
import CustomDrawer from "./src/components/CustomDrawer";
import PokedexScreen from "./src/screens/PokedexScreen";

const Drawer = createDrawerNavigator<any>();

const darkTheme: Theme = {
  dark: true,
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "800" },
  },
  colors: {
    primary: "#c41e3a",
    background: "#121212",
    card: "#1e1e1e",
    text: "#fff",
    border: "#333",
    notification: "#c41e3a",
  },
};

const lightTheme: Theme = {
  dark: false,
  fonts: darkTheme.fonts,
  colors: {
    primary: "#c41e3a",
    background: "#f5f5f5",
    card: "#ffffff",
    text: "#1c1c1c",
    border: "#e0e0e0",
    notification: "#c41e3a",
  },
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const alternarTema = () => setIsDarkMode(!isDarkMode);
  const temaAtual = isDarkMode ? darkTheme : lightTheme;

  return (
    <NavigationContainer theme={temaAtual}>
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawer
            {...props}
            isDarkMode={isDarkMode}
            onToggleTheme={alternarTema}
          />
        )}
        screenOptions={{
          sceneStyle: {
            backgroundColor: temaAtual.colors.background,
          },
          headerStyle: {
            backgroundColor: temaAtual.colors.card,
          },
          headerTintColor: temaAtual.colors.text,
          headerTitleStyle: {
            color: temaAtual.colors.text,
          },
          drawerStyle: {
            backgroundColor: temaAtual.colors.card,
            width: 280,
          },
          drawerLabelStyle: {
            color: temaAtual.colors.text,
          },
        }}
      >
        <Drawer.Screen component={PokedexScreen} name="Pokédex" />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
