import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import ExpandableMenu from "./ExpandableMenu"; // Import the menu

const MenuPrincipal = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ExpandableMenu navigation={navigation} />

      <Text style={styles.title}>
        Elije el área de tu vida que deseas mejorar
      </Text>

      {/* Opción Física */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate("ActividadFisica")}
      >
        <Image
          source={require("../assets/images/mancuerna.png")}
          style={styles.icon}
        />
        <Text style={styles.optionText}>Físico</Text>
      </TouchableOpacity>

      {/* Opción Mental */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate("ActividadMental")}
      >
        <Image
          source={require("../assets/images/loto.png")}
          style={styles.icon}
        />
        <Text style={styles.optionText}>Mental</Text>
      </TouchableOpacity>

      {/* Opción Nutricional */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate("ActividadNutricional")}
      >
        <Image
          source={require("../assets/images/manzana.png")}
          style={styles.icon}
        />
        <Text style={styles.optionText}>Nutricional</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8BC34A", // Color de fondo verde
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  menuButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  menuIcon: {
    fontSize: 30,
    color: "#333",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  option: {
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
    tintColor: "#fff",
    resizeMode: "contain", // Asegura que la imagen no se deforme
    tintColor: "#fff", // Cambia los iconos a blanco
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MenuPrincipal;
