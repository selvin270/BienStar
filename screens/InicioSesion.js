import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const InicioSesion = ({ navigation }) => {
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");

  const handleLogin = async () => {
    if (!usuario || !contrasenia) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await fetch("http://192.168.10.216:4000/inicio-sesion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: usuario, contrasenia }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("id_usuario", data.id_usuario.toString()); // Save id_usuario
        const evaluacionesResponse = await fetch(
          `http://192.168.10.216:4000/evaluaciones/pendientes/${data.id_usuario}?idioma=1`
        );
        const evaluacionesData = await evaluacionesResponse.json();
        console.log("Evaluaciones pendientes?: ", evaluacionesData.pendientes);
        if (evaluacionesData.pendientes) {
          navigation.navigate("Evaluacion");
        } else {
          navigation.navigate("MenuPrincipal", { token: data.token });
        }
        console.log("Usuario almacenado con ID:", data.id_usuario);
        console.log("Éxito", "Inicio de sesión exitoso.");
        // Redirige a la siguiente pantalla
      } else {
        Alert.alert("Error", data.mensaje || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y título */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        {/* <Text style={styles.title}>BienStar</Text> */}
      </View>

      {/* Campos de usuario y contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor="#fff"
        value={usuario}
        onChangeText={setUsuario}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#fff"
        secureTextEntry
        value={contrasenia}
        onChangeText={setContrasenia}
      />

      {/* Botón de inicio de sesión */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate("RecuperarContrasenia")}
        >
          <Text style={styles.linkText}>Olvidé mi contraseña</Text>
        </TouchableOpacity>
      </View>

      {/* Crear cuenta */}
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => navigation.navigate("NuevaCuenta")}
      >
        <Text style={styles.botonRedondo}>Crear Nueva Cuenta</Text>
      </TouchableOpacity>

      {/* Regresar */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate("Inicio")}
      >
        <Text style={styles.linkText}>{"\n\n"}Regresar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b094c4",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: "#fff",
  },
  actionContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#b094c4",
    fontWeight: "bold",
  },
  linkText: {
    color: "#fff",
    textDecorationLine: "underline",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 10,
  },
  socialButtonText: {
    color: "#555",
    fontWeight: "bold",
  },
  createAccountButton: {
    marginTop: 20,
  },
  createAccountText: {
    color: "#fff",
    fontWeight: "bold",
  },
  botonRedondo: {
    fontSize: 15,
    fontWeight: "regular",
    color: "#fff",
    borderRadius: 25,
    borderWidth: 2,
    padding: 10,
    borderColor: "#fff",
  },
});

export default InicioSesion;
