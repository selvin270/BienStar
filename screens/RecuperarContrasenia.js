import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Para la navegación

const RecuperarContrasenia = () => {
  const navigation = useNavigation();
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async () => {
    setMensaje("");

    try {
      const response = await fetch(
        "http://192.168.10.216:4000/recuperar-contrasenia",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMensaje("Se ha enviado un enlace de recuperación a tu correo.");
      } else {
        setMensaje(
          result.mensaje || "Error al enviar el enlace de recuperación."
        );
      }
    } catch (error) {
      console.error("Error al enviar el correo de recuperación:", error);
      setMensaje("Error de conexión con el servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.subtitle}>
        Ingresa tu correo electrónico para recibir un enlace de recuperación.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        onChangeText={setCorreo}
        value={correo}
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enviar Enlace</Text>
      </TouchableOpacity>

      {mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}

      <TouchableOpacity onPress={() => navigation.navigate("InicioSesion")}>
        <Text style={styles.link}>Volver al Inicio de Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#b094c4",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: "#fff",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  mensaje: {
    marginTop: 20,
    color: "#333",
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    color: "#fff",
    textDecorationLine: "underline",
  },
});

export default RecuperarContrasenia;
