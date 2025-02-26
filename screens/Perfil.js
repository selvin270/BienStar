import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker"; // Para manejar la selección de imágenes
import ExpandableMenu from "./ExpandableMenu"; // Import the menu
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const Perfil = () => {
  const navigation = useNavigation(); // ✅ Get the navigation prop manually
  const [usuario, setUsuario] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    edad: "",
    genero: "",
    estatura: "",
    peso: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const id_usuario = await AsyncStorage.getItem("id_usuario"); // Use AsyncStorage instead of localStorage
        if (!id_usuario) {
          console.error("No user ID found in storage.");
          return;
        }
        const response = await axios.get(
          `http://192.168.10.216:4000/usuarios/${id_usuario}`
        );
        setUsuario(response.data);
        setFormData({
          nombre: response.data.nombre,
          apellido: response.data.apellido,
          correo: response.data.correo,
          edad: response.data.edad?.toString() || "", // Convert to string
          genero: response.data.genero,
          estatura: response.data.estatura?.toString() || "", // Convert to string,
          peso: response.data.peso?.toString() || "", // Convert to string,
        });
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
      }
    };

    fetchUsuario();
  }, []);

  // const handleInputChange = (name, value) => {
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   console.log("Datos enviados a la api: ", name, value, prev);
  // };

  const handleInputChange = (name, value) => {
    setFormData((prev) => {
      console.log("Datos enviados a la API: ", name, value, prev); // ✅ Now inside setFormData
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarFile(result.assets[0].uri); // ✅ Get the first asset
      console.log("Imagen seleccionada: ", result.assets[0].uri);
    } else {
      console.log("Selección de imagen cancelada");
    }
  };

  const handleFormSubmit = async () => {
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      if (!id_usuario) {
        Alert.alert("Error", "No user ID found in storage.");
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (avatarFile) {
        const file = {
          uri: avatarFile,
          name: `avatar_${id_usuario}.jpg`, // Unique filename
          type: "image/jpeg",
        };
        formDataToSend.append("avatar", file);
      }

      console.log("Enviando datos: ", formDataToSend);

      const response = await axios.put(
        `http://192.168.10.216:4000/usuarios/${id_usuario}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Respuesta del servidor: ", response.data);

      if (response.data.tipo === "success") {
        Alert.alert("Éxito", response.data.msj);

        setUsuario((prev) => ({
          ...prev,
          ...formData,
          avatar: response.data.avatar || prev.avatar, // ✅ Update avatar
        }));

        setModoEdicion(false);
        setAvatarFile(null);
        setAvatarTimestamp(Date.now()); // ✅ Force image refresh
      } else {
        Alert.alert(
          "Error",
          response.data.msj || "No se pudo actualizar el perfil."
        );
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  if (!usuario) {
    return <Text>Cargando perfil...</Text>;
  }

  const handleCancelEdit = () => {
    setModoEdicion(false);
    setAvatarFile(null); // ✅ Restablece la imagen previa
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      edad: usuario.edad?.toString() || "",
      genero: usuario.genero,
      estatura: usuario.estatura?.toString() || "",
      peso: usuario.peso?.toString() || "",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ExpandableMenu navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: avatarFile // ✅ Muestra la imagen seleccionada si existe
              ? avatarFile
              : usuario.avatar?.startsWith("http")
              ? usuario.avatar
              : `http://192.168.10.216:4000/${usuario.avatar}?t=${avatarTimestamp}`,
          }}
          style={styles.avatar}
        />
      </View>

      {modoEdicion ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={formData.nombre}
            onChangeText={(text) => handleInputChange("nombre", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={formData.apellido}
            onChangeText={(text) => handleInputChange("apellido", text)}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Edad"
              value={formData.edad}
              onChangeText={(text) => handleInputChange("edad", text)}
              keyboardType="numeric"
            />
            <View style={[styles.input, styles.halfInput]}>
              <Picker
                style={styles.input}
                selectedValue={formData.genero}
                onValueChange={(itemValue) =>
                  handleInputChange("genero", itemValue)
                }
              >
                <Picker.Item
                  label="Selecciona tu género"
                  value=""
                  enabled={false}
                />
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Femenino" value="Femenino" />
              </Picker>
            </View>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Estatura"
              value={formData.estatura}
              onChangeText={(text) => handleInputChange("estatura", text)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Peso"
              value={formData.peso}
              onChangeText={(text) => handleInputChange("peso", text)}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={styles.fileButton}
            onPress={handleFileChange}
          >
            <Text>Subir Avatar</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelarButton}
              onPress={handleCancelEdit} // ✅ Llama a la nueva función
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guardarButton} // Apply custom styles for "Guardar"
              onPress={handleFormSubmit} // Call the function to save the activity
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileData}>
          <Text style={styles.texto}>
            <Text style={styles.label}>Nombre:</Text> {usuario.nombre}
          </Text>
          <Text style={styles.texto}>
            <Text style={styles.label}>Apellido:</Text> {usuario.apellido}
          </Text>
          <Text style={styles.texto}>
            <Text style={styles.label}>Correo:</Text> {usuario.correo}
          </Text>
          <Text style={styles.texto}>
            <Text style={styles.label}>Edad:</Text> {usuario.edad}
          </Text>
          <Text style={styles.texto}>
            <Text style={styles.label}>Género:</Text> {usuario.genero}
          </Text>
          <Text style={styles.texto}>
            <Text style={styles.label}>Estatura:</Text> {usuario.estatura}
          </Text>
          <Text style={styles.texto}>
            <Text style={styles.label}>Peso:</Text> {usuario.peso}
          </Text>
          <Text></Text>

          <TouchableOpacity
            style={styles.editarButton} // Apply custom styles for "Guardar"
            onPress={() => setModoEdicion(true)} // Call the function to save the activity
          >
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#007bff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 150,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: "#fff",
  },
  fileButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    color: "#fff",
  },
  texto: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: "center",
    color: "#fff",
  },
  guardar: {
    backgroundColor: "#97c033",
  },
  cancelar: {
    backgroundColor: "#dc3545",
  },
  buttonContainer: {
    flexDirection: "row", // Align buttons horizontally
    justifyContent: "space-between", // Add space between the buttons
    marginTop: 20, // Add some margin at the top
  },
  guardarButton: {
    backgroundColor: "#4CAF50", // Green background for "Guardar"
    padding: 15, // Add padding
    borderRadius: 5, // Rounded corners
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
    flex: 1, // Take up equal space
    marginLeft: 10, // Add some margin between the buttons
  },
  cancelarButton: {
    backgroundColor: "#f44336", // Red background for "Cancelar"
    padding: 15, // Add padding
    borderRadius: 5, // Rounded corners
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
    flex: 1, // Take up equal space

    marginRight: 10, // Add some margin between the buttons
  },
  editarButton: {
    borderWidth: 1,
    borderColor: "#fff",
    padding: 15, // Add padding
    borderRadius: 20, // Rounded corners
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
    flex: 1, // Take up equal space
    marginLeft: 10, // Add some margin between the buttons
  },
  buttonText: {
    color: "#ffffff", // White text color
    fontSize: 16, // Adjust font size
    fontWeight: "bold", // Make the text bold
  },
});

export default Perfil;
