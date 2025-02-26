import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExpandableMenu = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    try {
      // Eliminar el token o los datos del usuario
      await AsyncStorage.removeItem("id_usuario");
      await AsyncStorage.removeItem("token");

      // Redirigir a la pantalla de inicio de sesión
      navigation.navigate("Inicio");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleMenu = () => {
    setExpanded(!expanded);
    Animated.timing(animationValue, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    if (expanded) {
      setExpanded(false);
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const menuHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500], // Adjust height when expanded
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Icon name="bars" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={expanded}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.menu, { height: menuHeight }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("MenuPrincipal");
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("Perfil");
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Mi Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("MisEvaluaciones");
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Mis Evaluaciones</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("PoliticasPrivacidad");
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Políticas de Privacidad</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("ActividadFisica");
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Actividad Física</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("ActividadMental");
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Actividad Mental</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("ActividadNutricional");
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Actividad Nutricional</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleLogout();
              closeMenu();
            }}
          >
            <Text style={styles.menuText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 15,
    left: 20,
    zIndex: 10,
  },
  menuButton: {
    padding: 10,
    borderRadius: 5,
  },
  menu: {
    backgroundColor: "#333",
    overflow: "hidden",
    borderRadius: 5,
    marginTop: 5,
    position: "absolute",
    top: 50, // Adjust this value to position the menu correctly
    left: 0,
    right: 0,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
});

export default ExpandableMenu;
