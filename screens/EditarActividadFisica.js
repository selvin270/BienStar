import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import ExpandableMenu from "./ExpandableMenu";

const EditarActividadFisica = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id_actividad } = route.params;

  const [metas, setMetas] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [metaSeleccionada, setMetaSeleccionada] = useState("");
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState("");
  const [metaObjetivoSeleccionado, setMetaObjetivoSeleccionado] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [horariosEliminados, setHorariosEliminados] = useState([]);
  const [fechaTerminado, setFechaTerminado] = useState("");
  const [loading, setLoading] = useState(false);
  const [diasSemana, setDiasSemana] = useState([]);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [esMetaPersonalizada, setEsMetaPersonalizada] = useState(false);
  const [metaPersonalizada, setMetaPersonalizada] = useState("");
  const [objetivoPersonalizado, setObjetivoPersonalizado] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({
    index: null,
    field: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Id de actividad obtenida: ", id_actividad);
        const actividadResponse = await axios.get(
          `http://192.168.10.216:4000/actividad/${id_actividad}`
        );
        const actividad = actividadResponse.data;

        setFechaTerminado(actividad.fecha_terminado);
        setMetaSeleccionada(actividad.id_meta || "");
        setObjetivoSeleccionado(actividad.id_objetivo || "");
        setDiasSeleccionados(
          Array.isArray(actividad.dias_semana)
            ? actividad.dias_semana
            : actividad.dias_semana
            ? actividad.dias_semana.split(",").map(Number)
            : []
        );

        if (actividad.esMetaPersonalizada) {
          setEsMetaPersonalizada(true);
          setMetaPersonalizada(actividad.meta_personalizada || "");
          setObjetivoPersonalizado(actividad.objetivo_personalizado || "");
        } else {
          setEsMetaPersonalizada(false);
        }

        const metasResponse = await axios.get(
          `http://192.168.10.216:4000/metas/1/1`
        );
        setMetas(metasResponse.data);

        if (actividad.id_meta) {
          const objetivosResponse = await axios.get(
            `http://192.168.10.216:4000/objetivos/${actividad.id_meta}/1`
          );
          setObjetivos(objetivosResponse.data);
        }

        setHorarios(
          actividad.horarios.map((h) => ({
            id_horario: h.id_horario,
            inicio: h.hora_inicio,
            fin: h.hora_fin,
          }))
        );

        const diasResponse = await axios.get(
          `http://192.168.10.216:4000/semana?id_idioma=1`
        );
        setDiasSemana(diasResponse.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_actividad, navigation]);

  useEffect(() => {
    const fetchObjetivos = async () => {
      if (!metaSeleccionada) return;
      try {
        const response = await axios.get(
          `http://192.168.10.216:4000/objetivos/${metaSeleccionada}/1`
        );
        setObjetivos(response.data);
      } catch (error) {
        console.error("Error al cargar los objetivos:", error);
      }
    };

    fetchObjetivos();
  }, [metaSeleccionada]);

  useEffect(() => {
    const fetchMetaObjetivo = async () => {
      if (!metaSeleccionada || !objetivoSeleccionado) return;
      try {
        const response = await axios.get(
          `http://192.168.10.216:4000/metaobjetivo/${metaSeleccionada}/${objetivoSeleccionado}`
        );
        setMetaObjetivoSeleccionado(response.data.id_meta_objetivo);
      } catch (error) {
        console.error("Error al cargar meta-objetivo:", error);
      }
    };

    fetchMetaObjetivo();
  }, [metaSeleccionada, objetivoSeleccionado]);

  const agregarHorario = () => {
    setHorarios([...horarios, { inicio: "", fin: "" }]);
  };

  const actualizarHorario = (index, campo, valor) => {
    const nuevosHorarios = horarios.map((h, i) =>
      i === index ? { ...h, [campo]: valor } : h
    );
    setHorarios(nuevosHorarios);
  };

  const eliminarHorario = (index) => {
    const horario = horarios[index];
    if (horario.id_horario) {
      setHorariosEliminados([...horariosEliminados, horario.id_horario]);
    }
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const toggleDia = (idDia) => {
    if (idDia === 8) {
      setDiasSeleccionados(diasSeleccionados.includes(8) ? [] : [8]);
    } else {
      const nuevosDiasSeleccionados = diasSeleccionados.includes(idDia)
        ? diasSeleccionados.filter((id) => id !== idDia)
        : [...diasSeleccionados.filter((id) => id !== 8), idDia];
      setDiasSeleccionados(nuevosDiasSeleccionados);
    }
  };

  const formatDateForMySQL = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  const actualizarActividad = async () => {
    try {
      const fechaTerminadoFormateada = formatDateForMySQL(fechaTerminado);

      if (!Array.isArray(diasSeleccionados) || diasSeleccionados.length === 0) {
        Alert.alert("Error", "Debe seleccionar al menos un día.");
        return;
      }

      let datos;
      if (esMetaPersonalizada) {
        datos = {
          metaPersonalizada,
          objetivoPersonalizado,
          fecha_terminado: fechaTerminadoFormateada,
          diasSeleccionados,
        };
      } else {
        if (!metaObjetivoSeleccionado) {
          Alert.alert(
            "Error",
            "Debe seleccionar una meta y un objetivo válidos."
          );
          return;
        }

        datos = {
          id_meta_objetivo: metaObjetivoSeleccionado,
          fecha_terminado: fechaTerminadoFormateada,
          diasSeleccionados,
        };
      }

      await axios.put(
        `http://192.168.10.216:4000/actividad/${id_actividad}`,
        datos
      );

      for (const id_horario of horariosEliminados) {
        await axios.delete(`http://192.168.10.216:4000/horario/${id_horario}`);
      }

      for (const horario of horarios) {
        if (horario.id_horario) {
          await axios.put(
            `http://192.168.10.216:4000/horario/${horario.id_horario}`,
            {
              hora_inicio: horario.inicio,
              hora_fin: horario.fin,
            }
          );
        } else if (horario.inicio && horario.fin) {
          await axios.post("http://192.168.10.216:4000/horario", {
            id_actividad,
            hora_inicio: horario.inicio,
            hora_fin: horario.fin,
          });
        }
      }

      Alert.alert("Éxito", "Actividad actualizada correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar la actividad:", error);
      Alert.alert("Error", "No se pudo actualizar la actividad.");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFechaTerminado(selectedDate.toISOString().split("T")[0]);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker({ index: null, field: null });
    if (selectedTime) {
      const { index, field } = showTimePicker;
      const timeString = selectedTime
        .toTimeString()
        .split(" ")[0]
        .substring(0, 5);
      actualizarHorario(index, field, timeString);
    }
  };

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
        color={diasSeleccionados.includes(item.id_semana) ? "#007BFF" : "#000"}
      />
      <Text style={styles.diaText}>{item.descripcion}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ExpandableMenu navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.title}>Editar Actividad</Text>
      </View>
      <FlatList
        data={[]} // Empty data since we are using ListHeaderComponent and ListFooterComponent
        ListHeaderComponent={
          <>
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <>
                {esMetaPersonalizada ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.textoMeta}>Meta Personalizada</Text>
                      <TextInput
                        style={styles.input}
                        value={metaPersonalizada}
                        onChangeText={setMetaPersonalizada}
                        placeholder="Describe tu meta"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.textoObjetivo}>
                        Objetivo Personalizado
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={objetivoPersonalizado}
                        onChangeText={setObjetivoPersonalizado}
                        placeholder="Describe tu objetivo"
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.textoMeta}>Meta</Text>
                      <Picker
                        selectedValue={metaSeleccionada}
                        onValueChange={(itemValue) =>
                          setMetaSeleccionada(itemValue)
                        }
                      >
                        <Picker.Item label="Selecciona una meta" value="" />
                        {metas.map((meta) => (
                          <Picker.Item
                            key={meta.id_meta}
                            label={meta.descripcion}
                            value={meta.id_meta}
                          />
                        ))}
                      </Picker>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.textoObjetivo}>Objetivo</Text>
                      <Picker
                        selectedValue={objetivoSeleccionado}
                        onValueChange={(itemValue) =>
                          setObjetivoSeleccionado(itemValue)
                        }
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
                  </>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.tiempoText}>Días de la Semana</Text>
                  <FlatList
                    data={diasSemana}
                    renderItem={renderDia}
                    keyExtractor={(item) => item.id_semana.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.diasSemana}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.tiempoText}>Horarios</Text>
                  {horarios.map((horario, index) => (
                    <View key={index} style={styles.horario}>
                      <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() =>
                          setShowTimePicker({ index, field: "inicio" })
                        }
                      >
                        <Icon
                          name="clock-o"
                          size={50}
                          //marginLeft={75}
                          color="#000"
                        />
                        <Text style={styles.timeText}>
                          {horario.inicio || "Hora de inicio"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() =>
                          setShowTimePicker({ index, field: "fin" })
                        }
                      >
                        <Icon
                          name="clock-o"
                          size={50}
                          //marginRight={75}
                          color="#000"
                        />
                        <Text style={styles.timeText}>
                          {horario.fin || "Hora de fin"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.agregarHorario}
                    onPress={agregarHorario}
                  >
                    <Text style={styles.agregarHorarioText}>
                      Agregar otro horario
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
                      {fechaTerminado
                        ? new Date(fechaTerminado).toLocaleDateString()
                        : "Selecciona una fecha"}
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
              </>
            )}
          </>
        }
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelarButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.guardarButton}
              onPress={actualizarActividad}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        }
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
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
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 10,
  },
  tiempoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  agregarHorario: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  agregarHorarioText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  guardarButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,

    marginLeft: 10,
  },
  cancelarButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  textoMeta: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  textoObjetivo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  centeredIcon: {
    textAlign: "center",
    marginRight: 10,
  },
});

export default EditarActividadFisica;
