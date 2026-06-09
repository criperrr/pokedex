import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
export default function AutocompleteInput({
  value,
  onChangeText,
  suggestions,
  placeholder,
  inputStyle,
  textColor,
  borderColor,
  bgColor,
  cardColor,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtradas, setFiltradas] = useState([]);
  const onType = (text) => {
    onChangeText(text);
    if (text.length >= 1) {
      const lower = text.toLowerCase();
      const matches = suggestions.filter((s) => s.startsWith(lower));
      setFiltradas(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  const onSelect = (name) => {
    onChangeText(name);
    setShowSuggestions(false);
  };
  return (
    <View
      style={{
        flex: 1,
        height: 45,
        position: "relative",
        zIndex: 1000,
        elevation: 1000,
      }}
    >
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: bgColor,
            color: textColor,
            borderColor: borderColor,
          },
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={(textColor ?? "#fff") + "60"}
        value={value}
        onChangeText={onType}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showSuggestions && (
        <View
          style={[
            styles.suggestionList,
            {
              backgroundColor: cardColor,
              borderColor: borderColor,
            },
          ]}
        >
          {filtradas.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [
                styles.suggestionItem,
                {
                  borderBottomColor: borderColor,
                },
                pressed && {
                  opacity: 0.6,
                },
              ]}
              onPress={() => onSelect(item)}
            >
              <Text
                style={[
                  styles.suggestionText,
                  {
                    color: textColor,
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  suggestionList: {
    position: "absolute",
    top: 47,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 999,
    maxHeight: 220,
    overflow: "scroll",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
