import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ExpandableMenu from "./ExpandableMenu";
import { useNavigation } from "@react-navigation/native";

const PoliticasPrivacidad = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <ExpandableMenu navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.title}>Políticas de Privacidad</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.col12}>
          <Text style={styles.texto}>
            BienStar recopila tu información para mejorar tu experiencia con
            nuestra aplicación, pero nunca es mostrada al público o utilizada
            para otros fines.
            {"\n\n"}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Styles using React Native's StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 0,
    color: "#fff",
  },
  container: {
    flex: 1,
    padding: 16, // Equivalent to container class in CSS
    backgroundColor: "#fff", // Set background color
  },
  row: {
    flexDirection: "row", // Equivalent to row class in CSS
  },
  col12: {
    flex: 1, // Equivalent to col-12 class in CSS
  },
  texto: {
    fontSize: 16, // Set font size
    lineHeight: 24, // Set line height
    color: "#333", // Set text color
    textAlign: "justify", // Justify text
    marginTop: 20,
  },
});

export default PoliticasPrivacidad;
