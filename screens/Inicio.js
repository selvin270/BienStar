import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

const Inicio = ({ navigation }) => {
  return (
    <ImageBackground
      source={require("../assets/images/fondo_inicio.jpg")} // Usa '../' para subir un nivel desde screens/
      style={styles.background}
    >
      <View style={styles.container}>
        {/* <View style={styles.languageContainer}>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>English</Text>
          </TouchableOpacity>
        </View> */}

        <View style={styles.content}>
          <Image
            source={require("../assets/images/logo_color.png")}
            style={styles.logo}
          />
          {/* <Text style={styles.title}>BienStar</Text> */}
          <Text style={styles.subtitle}>
            Bienvenido a nuestra App. {"\n\n"}Nuestro objetivo principal es
            mejorar tu salud pero todo depende de tu esfuerzo.
          </Text>
        </View>

        {/* Botón de inicio */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("InicioSesion")} // Uso correcto del prop navigation
        >
          <Text style={styles.startButtonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // Asegura que la imagen de fondo cubra toda la pantalla
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  languageContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 50,
    justifyContent: "space-between",
    width: "60%",
  },
  languageButton: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: "#4CAF50", // Active button color
  },
  languageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#858585", // Texto más visible sobre fondo
    marginHorizontal: 20,
  },
  startButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderColor: "858585",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#858585",
    borderRadius: 25,
    borderWidth: 2,
    padding: 10,
    borderColor: "858585",
  },
});

export default Inicio;
