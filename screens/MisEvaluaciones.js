import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExpandableMenu from "./ExpandableMenu"; // Import the menu

const MisEvaluaciones = ({ navigation }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const evaluacionesPorPagina = 5;

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      try {
        const id_usuario = await AsyncStorage.getItem("id_usuario");

        const response = await axios.get(
          `http://192.168.10.216:4000/evaluaciones-historial/${id_usuario}/1`,
          {
            params: {
              pagina: paginaActual,
              limite: evaluacionesPorPagina,
            },
          }
        );
        setEvaluaciones(response.data.evaluaciones);
        setTotalPaginas(response.data.totalPaginas);
      } catch (error) {
        console.error("Error al cargar las evaluaciones. ", error);
      }
    };

    fetchEvaluaciones();
  }, [paginaActual]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.evaluationItem}>
      <Text style={styles.title}>{item.des_meta}</Text>
      <Text style={styles.subtitle}>{item.des_objetivo}</Text>
      <Text style={styles.response}>
        {"Respuesta"}: {item.respuesta}
      </Text>
      <Text style={styles.comment}>
        {"Comentario"}: {item.comentario}
      </Text>
      <Text style={styles.date}>
        {"Fecha inicio"}:{" "}
        {new Date(item.fecha_creacion).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        })}{" "}
        - {"Fecha fin"}:{" "}
        {new Date(item.fecha_terminado).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ExpandableMenu navigation={navigation} />
      <Text style={styles.header}>Mis Evaluaciones</Text>
      <FlatList
        data={evaluaciones}
        keyExtractor={(item) => item.id_evaluacion.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          style={[styles.button, paginaActual === 1 && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>&lt;</Text>
        </TouchableOpacity>
        {Array.from({ length: totalPaginas }, (_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => cambiarPagina(index + 1)}
            style={[
              styles.button,
              paginaActual === index + 1 && styles.activeButton,
            ]}
          >
            <Text style={styles.buttonText}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          style={[
            styles.button,
            paginaActual === totalPaginas && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>&gt;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#97c033",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 16,
  },
  evaluationItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginVertical: 4,
  },
  response: {
    fontSize: 16,
    marginVertical: 2,
  },
  comment: {
    fontSize: 16,
    marginVertical: 2,
  },
  date: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  button: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: "#007bff",
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  activeButton: {
    backgroundColor: "#0056b3",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
});

export default MisEvaluaciones;
