import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Inicio from "./screens/Inicio"; // Pantalla inicial
import InicioSesion from "./screens/InicioSesion"; // Pantalla de inicio de sesión
import NuevaCuenta from "./screens/NuevaCuenta"; // Pantalla de nueva cuenta
import MenuPrincipal from "./screens/MenuPrincipal"; // Pantalla de menu principal
import ActividadFisica from "./screens/ActividadFisica";
import ActividadMental from "./screens/ActividadMental";
import ActividadNutricional from "./screens/ActividadNutricional";
import NuevaActividadFisica from "./screens/NuevaActividadFisica";
import NuevaActividadMental from "./screens/NuevaActividadMental";
import NuevaActividadNutricional from "./screens/NuevaActividadNutricional";
import EditarActividadFisica from "./screens/EditarActividadFisica";
import EditarActividadMental from "./screens/EditarActividadMental";
import EditarActividadNutricional from "./screens/EditarActividadNutricional";
import Perfil from "./screens/Perfil";
import RecuperarContrasenia from "./screens/RecuperarContrasenia";
import Evaluacion from "./screens/Evaluacion";
import PoliticasPrivacidad from "./screens/PoliticasPrivacidad";
import MisEvaluaciones from "./screens/MisEvaluaciones";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen
          name="Inicio"
          component={Inicio}
          options={{ headerShown: false }} // Oculta el encabezado por defecto
        />
        <Stack.Screen
          name="InicioSesion"
          component={InicioSesion}
          options={{ title: "Iniciar Sesión" }} // Título personalizado
        />
        <Stack.Screen
          name="NuevaCuenta"
          component={NuevaCuenta}
          options={{ title: "Nueva Cuenta" }}
        />
        <Stack.Screen
          name="MenuPrincipal"
          component={MenuPrincipal}
          options={{ title: "Menu Principal" }}
        />
        <Stack.Screen
          name="ActividadFisica"
          component={ActividadFisica}
          options={{ title: "Actividad Fisica" }}
        />
        <Stack.Screen
          name="ActividadMental"
          component={ActividadMental}
          options={{ title: "Actividad Mental" }}
        />
        <Stack.Screen
          name="ActividadNutricional"
          component={ActividadNutricional}
          options={{ title: "Actividad Nutricional" }}
        />
        <Stack.Screen
          name="NuevaActividadFisica"
          component={NuevaActividadFisica}
          options={{ title: "Nueva Actividad Fisica" }}
        />
        <Stack.Screen
          name="NuevaActividadMental"
          component={NuevaActividadMental}
          options={{ title: "Nueva Actividad Mental" }}
        />
        <Stack.Screen
          name="NuevaActividadNutricional"
          component={NuevaActividadNutricional}
          options={{ title: "Nueva Actividad Nutricional" }}
        />
        <Stack.Screen
          name="EditarActividadFisica"
          component={EditarActividadFisica}
          options={{ title: "Editar Actividad Fisica" }}
        />
        <Stack.Screen
          name="EditarActividadMental"
          component={EditarActividadMental}
          options={{ title: "Editar Actividad Mental" }}
        />
        <Stack.Screen
          name="EditarActividadNutricional"
          component={EditarActividadNutricional}
          options={{ title: "Editar Actividad Nutricional" }}
        />
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{ title: "Perfil" }}
        />
        <Stack.Screen
          name="RecuperarContrasenia"
          component={RecuperarContrasenia}
          options={{ title: "RecuperarContrasenia" }}
        />
        <Stack.Screen
          name="Evaluacion"
          component={Evaluacion}
          options={{ title: "Evaluacion" }}
        />
        <Stack.Screen
          name="PoliticasPrivacidad"
          component={PoliticasPrivacidad}
          options={{ title: "PoliticasPrivacidad" }}
        />
        <Stack.Screen
          name="MisEvaluaciones"
          component={MisEvaluaciones}
          options={{ title: "MisEvaluaciones" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
