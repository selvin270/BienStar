import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExpandableMenu from "./ExpandableMenu";

const ActividadMental = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [actividades, setActividades] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(true);
  const actividadesPorPagina = 5;

  const fetchUserId = async () => {
    try {
      const idUsuario = await AsyncStorage.getItem("id_usuario");

      if (!idUsuario) {
        console.log("Error", "No se encontró el ID del usuario.");
        return;
      }

      console.log("ID Usuario obtenido:", idUsuario);
      obtenerActividades(idUsuario);
    } catch (error) {
      console.error("Error al obtener id_usuario:", error);
    }
  };

  const obtenerActividades = async (idUsuario) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.10.216:4000/actividad/${idUsuario}/2/1`
      );
      const data = await response.json();

      if (data.tipo === "error") {
        console.log("Error", data.msj);
      } else {
        setActividades(data);
      }
    } catch (error) {
      console.error("Error al obtener actividades:", error);
      console.log("Error", "No se pudieron cargar las actividades.");
    }
    setLoading(false);
  };

  // Recargar actividades cuando la pantalla recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      fetchUserId();
    }, [])
  );

  // Capturar el parámetro shouldRefresh
  useEffect(() => {
    if (route.params?.shouldRefresh) {
      fetchUserId();
    }
  }, [route.params?.shouldRefresh]);

  const deleteActividad = async (id_actividad) => {
    try {
      const response = await axios.delete(
        `http://192.168.10.216:4000/actividad/${id_actividad}`
      );
      if (response.status === 200) {
        console.log("Actividad eliminada exitosamente");
        setActividades((prevActividades) =>
          prevActividades.filter(
            (actividad) => actividad.id_actividad !== id_actividad
          )
        );
      } else {
        console.error("Error al eliminar la actividad");
      }
    } catch (error) {
      console.error("Error al eliminar la actividad:", error);
    }
  };

  const formatSimpleDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <ExpandableMenu navigation={navigation} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("NuevaActividadMental")}
        >
          <Text style={styles.addButtonText}>+ Añadir Objetivo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Actividades Físicas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#b094c4" />
      ) : actividades.length === 0 ? (
        <Text style={styles.noDataText}>No hay actividades registradas.</Text>
      ) : (
        <FlatList
          data={actividades.slice(
            pagina * actividadesPorPagina,
            (pagina + 1) * actividadesPorPagina
          )}
          keyExtractor={(item) => item.id_actividad.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowContainer}>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.cardTitle}>{item.meta_descripcion}</Text>
                  <Text style={styles.cardText}>
                    Objetivo: {item.objetivo_descripcion}
                  </Text>
                  <Text style={styles.cardText}>Días: {item.dias_semana}</Text>
                  <Text style={styles.cardText}>Horario: {item.horarios}</Text>
                  <Text style={styles.cardText}>
                    Fecha Fin: {formatSimpleDate(item.fecha_terminado)}
                  </Text>
                </View>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "orange",
                      padding: 10,
                      marginRight: 10,
                      borderRadius: 5,
                    }}
                    onPress={() =>
                      navigation.navigate("EditarActividadMental", {
                        id_actividad: item.id_actividad,
                      })
                    }
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Editar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "red",
                      padding: 10,
                      borderRadius: 5,
                    }}
                    onPress={() => deleteActividad(item.id_actividad)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Borrar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={pagina === 0}
          onPress={() => setPagina(pagina - 1)}
          style={[styles.pageButton, pagina === 0 && styles.disabledButton]}
        >
          <Text style={styles.pageButtonText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={(pagina + 1) * actividadesPorPagina >= actividades.length}
          onPress={() => setPagina(pagina + 1)}
          style={[
            styles.pageButton,
            (pagina + 1) * actividadesPorPagina >= actividades.length &&
              styles.disabledButton,
          ]}
        >
          <Text style={styles.pageButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  descriptionContainer: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#b094c4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
    color: "#777",
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardText: {
    fontSize: 14,
    color: "#555",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  pageButton: {
    backgroundColor: "#b094c4",
    padding: 10,
    borderRadius: 5,
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default ActividadMental;
