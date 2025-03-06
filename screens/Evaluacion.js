import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Share from "react-native-share";

const Evaluacion = ({ onEvaluacionesCompletadas = () => {} }) => {
  const navigation = useNavigation();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState("");
  const [comentario, setComentario] = useState("");
  const [mostrarFelicitacion, setMostrarFelicitacion] = useState(false);
  const [mostrarFelicitacion2, setMostrarFelicitacion2] = useState(false);
  const [mostrarFelicitacion3, setMostrarFelicitacion3] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [animacion, setAnimacion] = useState(false);
  const [mostrarOpcionesFinales, setMostrarOpcionesFinales] = useState(false); // Nuevo estado

  const fetchEvaluaciones = async () => {
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      const response = await axios.get(
        `http://192.168.10.216:4000/evaluaciones/${id_usuario}`
      );
      setEvaluaciones(response.data);
    } catch (error) {
      console.error("Error al cargar las evaluaciones:", error);
      Alert.alert("Error", "No se pudieron cargar las evaluaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const manejarRespuesta = (respuesta) => {
    setRespuestaSeleccionada(respuesta);
  };

  const enviarRespuesta = async () => {
    if (!respuestaSeleccionada) {
      Alert.alert("Error", "Por favor, selecciona una respuesta.");
      return;
    }

    try {
      const evaluacionActual = evaluaciones[indiceActual];
      await axios.post("http://192.168.10.216:4000/evaluacion", {
        id_actividad: evaluacionActual.id_actividad,
        id_respuesta: respuestaSeleccionada,
        comentario: comentario || null,
        fecha_evaluacion: new Date().toISOString().split("T")[0],
      });

      setRespuestaSeleccionada("");
      setComentario("");
      if (respuestaSeleccionada === 1) {
        setMostrarFelicitacion(true);
        setTimeout(() => {
          setMostrarFelicitacion(false);
          continuarEvaluacion();
        }, 3000);
      }
      if (respuestaSeleccionada === 2) {
        setMostrarFelicitacion2(true);
        setTimeout(() => {
          setMostrarFelicitacion2(false);
          continuarEvaluacion();
        }, 3000);
      }
      if (respuestaSeleccionada === 3) {
        setMostrarFelicitacion3(true);
        setTimeout(() => {
          setMostrarFelicitacion3(false);
          continuarEvaluacion();
        }, 3000);
      } else {
        continuarEvaluacion();
      }
    } catch (error) {
      console.error("Error al enviar la evaluación:", error);
      Alert.alert("Error", "Hubo un error al enviar la evaluación.");
    }
  };

  const continuarEvaluacion = () => {
    setAnimacion(true);
    setTimeout(() => {
      setAnimacion(false);
      if (indiceActual < evaluaciones.length - 1) {
        setIndiceActual(indiceActual + 1);
      } else {
        onEvaluacionesCompletadas();
        setMostrarOpcionesFinales(true); // Mostrar opciones al finalizar
      }
    }, 500);
  };

  const compartirResultados = async () => {
    try {
      const shareOptions = {
        title: "Compartir resultados",
        message: "¡He completado mis evaluaciones! 🎉",
        url: "https://tuaplicacion.com",
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.error("Error al compartir:", error);
    } finally {
      setMostrarOpcionesFinales(false); // Cerrar modal después de compartir
      navigation.navigate("MenuPrincipal"); // Redirigir al menú principal
    }
  };

  const salirAlMenuPrincipal = () => {
    setMostrarOpcionesFinales(false); // Cerrar modal
    navigation.navigate("MenuPrincipal"); // Redirigir al menú principal
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Cargando evaluaciones...</Text>
      </View>
    );
  }

  if (!evaluaciones.length) {
    return (
      <View style={styles.noEvaluacionesContainer}>
        <Text style={styles.noEvaluacionesText}>
          No hay evaluaciones pendientes.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onEvaluacionesCompletadas();
            navigation.navigate("MenuPrincipal");
          }}
        >
          <Text style={styles.buttonText}>Volver al Menú Principal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const evaluacionActual = evaluaciones[indiceActual];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />

      {/* Modal de felicitaciones */}
      <Modal
        visible={mostrarFelicitacion}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 ¡Felicidades! 🎉</Text>
            <Text style={styles.modalText}>Continua así, eres el mejor.</Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mostrarFelicitacion2}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌟 ¡Buen trabajo! 🌟</Text>
            <Text style={styles.modalText}>Lo estás haciendo muy bien.</Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mostrarFelicitacion3}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💪 ¡Tú puedes! 💪</Text>
            <Text style={styles.modalText}>La próxima vez lo lograrás.</Text>
          </View>
        </View>
      </Modal>

      {/* Modal de opciones finales */}
      <Modal
        visible={mostrarOpcionesFinales}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Evaluación completada</Text>
            <Text style={styles.modalText}>
              ¿Deseas compartir tus resultados en redes sociales?
            </Text>
            <TouchableOpacity
              style={styles.compartirButton}
              onPress={compartirResultados}
            >
              <Text style={styles.compartirButtonText}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.salirButton}
              onPress={salirAlMenuPrincipal}
            >
              <Text style={styles.salirButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Evaluación de Actividad</Text>
      <Text style={styles.subtitle}>¿Cómo te fue con esta actividad?</Text>
      <Text style={styles.metaText}>{evaluacionActual.descripcion_meta}</Text>
      <Text style={styles.objetivoText}>
        {evaluacionActual.descripcion_objetivo}
      </Text>

      <View style={styles.opcionesContainer}>
        {[
          { id: 1, label: "Bien" },
          { id: 2, label: "Regular" },
          { id: 3, label: "Mal" },
        ].map((opcion) => (
          <TouchableOpacity
            key={opcion.id}
            style={[
              styles.opcionButton,
              respuestaSeleccionada === opcion.id && styles.opcionSeleccionada,
            ]}
            onPress={() => manejarRespuesta(opcion.id)}
          >
            <Text
              style={[
                styles.opcionText,
                respuestaSeleccionada === opcion.id &&
                  styles.opcionTextSeleccionada,
              ]}
            >
              {opcion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {respuestaSeleccionada && (
        <View style={styles.comentarioContainer}>
          <Text style={styles.comentarioLabel}>Comentario (opcional):</Text>
          <TextInput
            style={styles.comentarioInput}
            value={comentario}
            onChangeText={setComentario}
            placeholder="Escribe tu comentario aquí..."
            multiline
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={enviarRespuesta}
        disabled={!respuestaSeleccionada}
      >
        <Text style={styles.buttonText}>
          {indiceActual < evaluaciones.length - 1 ? "Siguiente" : "Finalizar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#b094c4",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEvaluacionesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEvaluacionesText: {
    fontSize: 18,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 110,
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
    color: "#666",
    marginBottom: 20,
    color: "#fff",
  },
  metaText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  objetivoText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  opcionesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  opcionButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  opcionSeleccionada: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  opcionText: {
    color: "#333",
  },
  opcionTextSeleccionada: {
    color: "#fff",
  },
  comentarioContainer: {
    width: "100%",
    marginBottom: 20,
  },
  comentarioLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
  },
  comentarioInput: {
    width: "100%",
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    color: "#fff",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  modalText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  compartirButton: {
    width: "100%",
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  compartirButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  salirButton: {
    width: "100%",
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  salirButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Evaluacion;
