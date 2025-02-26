import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const RestablecerContrasenia = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { token } = route.params || {}; // Get token from route params

  const [nuevaContrasenia, setNuevaContrasenia] = useState("");
  const [confirmarContrasenia, setConfirmarContrasenia] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async () => {
    if (nuevaContrasenia !== confirmarContrasenia) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.10.216:4000/restablecer-contrasenia",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, nuevaContrasenia }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Éxito", "Contraseña restablecida exitosamente", [
          { text: "OK", onPress: () => navigation.navigate("InicioSesion") },
        ]);
      } else {
        setMensaje(result.mensaje || "Error al restablecer la contraseña");
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer Contraseña</Text>
      {mensaje ? <Text style={styles.error}>{mensaje}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={nuevaContrasenia}
        onChangeText={setNuevaContrasenia}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmarContrasenia}
        onChangeText={setConfirmarContrasenia}
      />

      <Button title="Restablecer" onPress={handleSubmit} />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default RestablecerContrasenia;
