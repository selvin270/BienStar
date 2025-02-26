import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const NuevaCuenta = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasenia: "",
    edad: "",
    genero: "",
    estatura: "",
    peso: "",
  });
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const [avatar, setAvatar] = useState(null);

  // Solicitar permisos al iniciar la aplicación
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Se necesitan permisos para acceder a la galería."
        );
      }
    })();
  }, []);

  // Manejar el cambio en los inputs
  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Función para abrir la galería
  const handleImagePick = async () => {
    console.log("Botón de subir imagen presionado");

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log("Resultado de la imagen:", result);

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      } else {
        console.log("Selección de imagen cancelada");
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
    }
  };

  // Enviar los datos al servidor
  const handleCreateAccount = async () => {
    console.log("Enviando formulario...");

    // Validate password and confirm password
    if (formData.contrasenia !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    if (avatar) {
      const filename = avatar.split("/").pop();
      const ext = filename.split(".").pop();

      form.append("avatar", {
        uri: avatar,
        name: `avatar.${ext}`,
        type: `image/${ext}`,
      });
    }

    try {
      const response = await fetch("http://192.168.10.216:4000/crear-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: form,
      });

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (result.tipo === "success") {
        await AsyncStorage.setItem("id_usuario", result.id_usuario.toString()); // Save id_usuario
        console.log("Usuario almacenado con ID:", result.id_usuario);
        Alert.alert("Éxito", result.msj);
        navigation.navigate("MenuPrincipal");
      } else {
        Alert.alert("Error", result.msj);
      }
    } catch (error) {
      console.error("Error al crear cuenta:", error);
      Alert.alert("Error", "Ocurrió un error al crear la cuenta.");
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Ingresa los siguientes datos</Text>

          {/* 📌 SOLO EL CORREO OCUPA UNA FILA */}
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu correo electrónico"
            keyboardType="email-address"
            onChangeText={(value) => handleInputChange("correo", value)}
          />

          {/* 📌 DOS COLUMNAS PARA NOMBRE Y APELLIDO */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Nombre"
              onChangeText={(value) => handleInputChange("nombre", value)}
            />

            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Apellido (opcional)"
              onChangeText={(value) => handleInputChange("apellido", value)}
            />
          </View>

          {/* 📌 DOS COLUMNAS PARA CONTRASEÑAS */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Contraseña"
              secureTextEntry
              onChangeText={(value) => handleInputChange("contrasenia", value)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Confirmar Contraseña"
              secureTextEntry
              onChangeText={(value) => setConfirmPassword(value)}
            />
          </View>

          {/* 📌 DOS COLUMNAS PARA EDAD Y GÉNERO */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Edad (opcional)"
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("edad", value)}
            />
            <View style={[styles.input, styles.halfInput]}>
              <Picker
                selectedValue={formData.genero}
                onValueChange={(itemValue) =>
                  handleInputChange("genero", itemValue)
                }
              >
                <Picker.Item
                  style={styles.input2}
                  label="Género (opcional)"
                  value=""
                  enabled={false}
                />
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Femenino" value="Femenino" />
              </Picker>
            </View>
          </View>

          {/* 📌 DOS COLUMNAS PARA ESTATURA Y PESO */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Estatura en cm (opcional)"
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("estatura", value)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Peso en libras (opcional)"
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("peso", value)}
            />
          </View>

          {/* 📌 FOTO EN UNA SOLA FILA */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImagePick}
          >
            <Text style={styles.uploadButtonText}>
              {avatar ? "Foto seleccionada" : "Subir Foto (opcional)"}
            </Text>
          </TouchableOpacity>

          {avatar && (
            <Image source={{ uri: avatar }} style={styles.previewImage} />
          )}

          {/* 📌 BOTONES */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Regresar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
            >
              <Text style={styles.createAccountText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.politicasprivacidad}>
            <TouchableOpacity
              onPress={() => navigation.navigate("PoliticasPrivacidad")}
            >
              <Text style={styles.linkText}>Políticas de Privacidad</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007bff",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  input2: {
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfInput: {
    flex: 1,
    marginRight: 5, // Espacio entre los inputs
  },
  uploadButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  linkText: {
    color: "#fff",
    textDecorationLine: "underline",
  },
  createAccountButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  createAccountText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  politicasprivacidad: {
    marginTop: 20,
  },
  requiredAsterisk: {
    color: "red",
    marginRight: 20,
  },
});

export default NuevaCuenta;
