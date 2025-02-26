import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome"; // Import icons
import DateTimePicker from "@react-native-community/datetimepicker"; // For date and time picker
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExpandableMenu from "./ExpandableMenu"; // Import the menu

const NuevaActividadMental = ({ navigation }) => {
  const [metas, setMetas] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [metaSeleccionada, setMetaSeleccionada] = useState("");
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState("");
  const [metaObjetivoSeleccionado, setMetaObjetivoSeleccionado] = useState("");
  const [horarios, setHorarios] = useState([{ inicio: "", fin: "" }]);
  const [fechaTerminado, setFechaTerminado] = useState("");
  const [loading, setLoading] = useState(false);
  const [diasSemana, setDiasSemana] = useState([]);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [creandoMetaPersonalizada, setCreandoMetaPersonalizada] =
    useState(false);
  const [metaPersonalizada, setMetaPersonalizada] = useState("");
  const [objetivoPersonalizado, setObjetivoPersonalizado] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false); // For date picker
  const [showTimePicker, setShowTimePicker] = useState({
    index: null,
    field: null,
  }); // For time picker

  const idiomaSeleccionado = 1; // Asumiendo que el idioma es español por defecto

  useEffect(() => {
    const fetchMetas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://192.168.10.216:4000/metas/2/${idiomaSeleccionado}`
        );
        setMetas(response.data);
      } catch (error) {
        console.error("Error al obtener las metas:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDiasSemana = async () => {
      try {
        const response = await axios.get(
          `http://192.168.10.216:4000/semana?id_idioma=1`
        );
        setDiasSemana(response.data);
      } catch (error) {
        console.error("Error al obtener días de la semana:", error);
      }
    };

    fetchMetas();
    fetchDiasSemana();
  }, [idiomaSeleccionado]);

  useEffect(() => {
    const fetchObjetivos = async () => {
      if (!metaSeleccionada) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `http://192.168.10.216:4000/objetivos/${metaSeleccionada}/${idiomaSeleccionado}`
        );
        setObjetivos(response.data);
      } catch (error) {
        console.error("Error al obtener los objetivos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchObjetivos();
  }, [metaSeleccionada, idiomaSeleccionado]);

  const agregarHorario = () => {
    setHorarios([...horarios, { inicio: "", fin: "" }]);
  };

  const actualizarHorario = (index, campo, valor) => {
    const nuevosHorarios = horarios.map((h, i) =>
      i === index ? { ...h, [campo]: valor } : h
    );
    setHorarios(nuevosHorarios);
  };

  const toggleDia = (idDia) => {
    if (idDia === 8) {
      setDiasSeleccionados([8]);
    } else {
      const nuevosDiasSeleccionados = diasSeleccionados.includes(idDia)
        ? diasSeleccionados.filter((id) => id !== idDia)
        : [...diasSeleccionados.filter((id) => id !== 8), idDia];
      setDiasSeleccionados(nuevosDiasSeleccionados);
    }
  };

  // Handle date picker change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFechaTerminado(selectedDate.toISOString().split("T")[0]);
    }
  };

  // Handle time picker change
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker({ index: null, field: null });
    if (selectedTime) {
      const { index, field } = showTimePicker;
      const timeString = selectedTime
        .toTimeString()
        .split(" ")[0]
        .substring(0, 5); // Format as HH:MM
      actualizarHorario(index, field, timeString);
    }
  };

  // Render each day of the week with a checkbox
  const renderDia = ({ item }) => (
    <TouchableOpacity
      style={styles.diaContainer}
      onPress={() => toggleDia(item.id_semana)}
    >
      <Icon
        name={
          diasSeleccionados.includes(item.id_semana)
            ? "check-square-o"
            : "square-o"
        }
        size={20}
        color={diasSeleccionados.includes(item.id_semana) ? "#b094c4" : "#000"}
      />
      <Text style={styles.diaText}>{item.descripcion}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchMetaObjetivo = async () => {
      if (!metaSeleccionada || !objetivoSeleccionado) return;
      try {
        const response = await axios.get(
          `http://192.168.10.216:4000/metaobjetivo/${metaSeleccionada}/${objetivoSeleccionado}`
        );
        setMetaObjetivoSeleccionado(response.data.id_meta_objetivo);
      } catch (error) {
        console.error("Error al obtener los meta objetivo:", error);
      }
    };
    fetchMetaObjetivo();
  }, [metaSeleccionada, objetivoSeleccionado]);

  const guardarMetaPersonalizada = async () => {
    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");

      const responseMeta = await axios.post(
        "http://192.168.10.216:4000/meta-personalizada",
        {
          id_usuario,
          descripcion: metaPersonalizada,
        }
      );

      console.log("Respuesta de meta personalizada:", responseMeta.data);

      if (!responseMeta.data.id_meta_personalizada) {
        console.error("No se recibió un ID válido para la meta personalizada.");
        alert("Hubo un error al guardar la meta personalizada.");
        return null;
      }

      const responseObjetivo = await axios.post(
        "http://192.168.10.216:4000/objetivo-personalizado",
        {
          id_usuario,
          descripcion: objetivoPersonalizado,
        }
      );

      console.log(
        "Respuesta de objetivo personalizado:",
        responseObjetivo.data
      );

      if (!responseObjetivo.data.id_objetivo_personalizado) {
        console.error(
          "No se recibió un ID válido para el objetivo personalizado."
        );
        alert("Hubo un error al guardar el objetivo personalizado.");
        return null;
      }

      // Guardar la relación meta-objetivo personalizada
      const metaObjetivoResponse = await axios.post(
        "http://192.168.10.216:4000/meta-objetivo-personalizado",
        {
          id_meta_personalizada: responseMeta.data.id_meta_personalizada,
          id_objetivo_personalizado:
            responseObjetivo.data.id_objetivo_personalizado,
          id_categoria: 2, // Ajusta según la lógica
        }
      );

      console.log(
        "Respuesta de meta-objetivo personalizado:",
        metaObjetivoResponse.data
      );

      if (!metaObjetivoResponse.data.id_meta_objetivo) {
        console.error(
          "No se recibió un ID válido para la relación meta-objetivo."
        );
        alert("Hubo un error al guardar la relación meta-objetivo.");
        return null;
      }

      return metaObjetivoResponse.data.id_meta_objetivo;
    } catch (error) {
      console.error("Error al guardar la meta personalizada:", error);
      alert("Error al guardar la meta personalizada");
      return null;
    }
  };

  const guardarActividad = async () => {
    if (!fechaTerminado) {
      alert("Por favor, selecciona una fecha de término.");
      return;
    }

    try {
      const id_usuario = await AsyncStorage.getItem("id_usuario");
      const fecha_creacion = new Date().toISOString().split("T")[0];

      let id_meta_objetivo = metaObjetivoSeleccionado;

      if (creandoMetaPersonalizada) {
        id_meta_objetivo = await guardarMetaPersonalizada();
        if (!id_meta_objetivo) {
          console.error(
            "id_meta_objetivo es undefined después de guardar la meta personalizada."
          );
          alert("No se pudo establecer la meta-objetivo correctamente.");
          return;
        }
      } else if (!metaSeleccionada || !objetivoSeleccionado) {
        alert("Por favor, selecciona una meta y un objetivo.");
        return;
      }

      const response = await axios.post(
        "http://192.168.10.216:4000/actividad",
        {
          id_meta_objetivo,
          id_usuario,
          fecha_creacion,
          fecha_terminado: fechaTerminado,
          diasSeleccionados,
        }
      );

      if (response.data.id_actividad) {
        for (const horario of horarios) {
          if (horario.inicio && horario.fin) {
            await axios.post("http://192.168.10.216:4000/horario", {
              id_actividad: response.data.id_actividad,
              hora_inicio: horario.inicio,
              hora_fin: horario.fin,
            });
          }
        }
      }

      alert("Actividad guardada con éxito.");
      navigation.navigate("ActividadMental");
    } catch (error) {
      console.error("Error en la solicitud:", error.response?.data || error);
      alert("Hubo un error al guardar la actividad.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ExpandableMenu navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Actividad</Text>
      </View>
      <View style={styles.content}>
        {loading && <Text>Cargando...</Text>}
        <View style={styles.inputGroup}>
          <Text style={styles.textoMeta}>Meta</Text>
          {!creandoMetaPersonalizada ? ( // Only show the Picker if not creating a custom meta
            <View style={styles.picker}>
              <Picker
                selectedValue={metaSeleccionada}
                onValueChange={(itemValue) => {
                  if (itemValue === "personalizada") {
                    setCreandoMetaPersonalizada(true); // Set state to show custom meta fields
                  } else {
                    setMetaSeleccionada(itemValue); // Set the selected meta
                  }
                }}
              >
                <Picker.Item label="Selecciona una meta" value="" />
                {metas.map((meta) => (
                  <Picker.Item
                    key={meta.id_meta}
                    label={meta.descripcion}
                    value={meta.id_meta}
                  />
                ))}
                <Picker.Item
                  label="Crear meta personalizada"
                  value="personalizada"
                />
              </Picker>
            </View>
          ) : null}{" "}
          {/* Hide the Picker when creating a custom meta */}
        </View>

        {creandoMetaPersonalizada ? (
          <>
            <Text>Meta Personalizada</Text>
            <View style={styles.input}>
              <TextInput
                value={metaPersonalizada}
                onChangeText={setMetaPersonalizada}
                placeholder="Describe tu meta"
              />
            </View>
            <Text>Objetivo Personalizado</Text>
            <View style={styles.input}>
              <TextInput
                value={objetivoPersonalizado}
                onChangeText={setObjetivoPersonalizado}
                placeholder="Describe tu objetivo"
              />
            </View>
          </>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.textoObjetivo}>Objetivo</Text>
            <Picker
              selectedValue={objetivoSeleccionado}
              onValueChange={(itemValue) => setObjetivoSeleccionado(itemValue)}
            >
              <Picker.Item label="Selecciona un objetivo" value="" />
              {objetivos.map((objetivo) => (
                <Picker.Item
                  key={objetivo.id_objetivo}
                  label={objetivo.descripcion}
                  value={objetivo.id_objetivo}
                />
              ))}
            </Picker>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.tiempoText}>Días de la Semana</Text>
          <View style={styles.diasSemana}>
            {diasSemana.map((dia) => (
              <TouchableOpacity
                key={dia.id_semana}
                style={styles.diaContainer}
                onPress={() => toggleDia(dia.id_semana)}
              >
                <Icon
                  name={
                    diasSeleccionados.includes(dia.id_semana)
                      ? "check-square-o"
                      : "square-o"
                  }
                  size={20}
                  color={
                    diasSeleccionados.includes(dia.id_semana)
                      ? "#007BFF"
                      : "#000"
                  }
                />
                <Text style={styles.diaText}>{dia.descripcion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.tiempoText}>Horarios</Text>
          {horarios.map((horario, index) => (
            <View key={index} style={styles.horario}>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setShowTimePicker({ index, field: "inicio" })}
              >
                <Icon name="clock-o" size={50} marginLeft={75} color="#000" />
                <Text style={styles.timeText}>
                  {horario.inicio || "Hora de inicio"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setShowTimePicker({ index, field: "fin" })}
              >
                <Icon name="clock-o" size={50} marginRight={75} color="#000" />
                <Text style={styles.timeText}>
                  {horario.fin || "Hora de fin"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.agregarHorario} // Apply the background color here
            onPress={agregarHorario} // Call the function to add another schedule
          >
            <Text style={styles.agregarHorarioText}>
              + Agregar otro horario
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.tiempoText}>Fecha de Término</Text>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon
              name="calendar"
              size={50}
              style={styles.centeredIcon}
              color="#000"
            />
            <Text style={styles.timeText}>
              {fechaTerminado || "Selecciona una fecha"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showTimePicker.index !== null && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelarButton} // Apply custom styles for "Cancelar"
            onPress={() => navigation.navigate("ActividadMental")} // Navigate back
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.guardarButton} // Apply custom styles for "Guardar"
            onPress={guardarActividad} // Call the function to save the activity
          >
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textoMeta: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b094c4",
  },
  textoObjetivo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b094c4",
  },
  header: {
    backgroundColor: "#b094c4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  encabezado: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#b094c4",
  },
  imagen: {
    width: 120,
    height: 50,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 0,
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 0,
  },
  input: {
    padding: 10,
    marginBottom: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  diasSemana: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  diaContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "30%",
    marginBottom: 10,
  },
  diaText: {
    marginLeft: 10,
  },
  horario: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconContainer: {},
  timeText: { textAlign: "center", marginRight: 10 },
  tiempoText: {
    textAlign: "center",
    marginRight: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#b094c4",
  },
  centeredIcon: {
    textAlign: "center",
    marginRight: 10,
  },
  agregarHorario: {
    backgroundColor: "#b094c4", // Background color
    padding: 10, // Add padding for better appearance
    borderRadius: 5, // Optional: Add rounded corners
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
    marginTop: 10, // Add some margin at the top
  },
  agregarHorarioText: {
    color: "#ffffff", // Text color (white for better contrast)
    fontSize: 16, // Adjust font size
    fontWeight: "bold", // Optional: Make the text bold
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
  buttonText: {
    color: "#ffffff", // White text color
    fontSize: 16, // Adjust font size
    fontWeight: "bold", // Make the text bold
  },
});

export default NuevaActividadMental;
