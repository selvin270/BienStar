import { connect } from "../database";
import axios from "axios";

// URL base de la API de Google Translate gratuita
const GOOGLE_TRANSLATE_API_URL =
  "https://translate.googleapis.com/translate_a/single";

// Función para traducir texto usando Google Translate
const traducirTexto = async (texto, idiomaDestino) => {
  try {
    const response = await axios.get(GOOGLE_TRANSLATE_API_URL, {
      params: {
        client: "gtx",
        sl: "auto", // Detecta automáticamente el idioma original
        tl: idiomaDestino, // Idioma de destino
        dt: "t",
        q: texto, // Texto a traducir
      },
    });
    return response.data[0][0][0];
  } catch (error) {
    console.error("Error al traducir texto:", error);
    return texto; // Retorna el original si hay error
  }
};

// Traducción de días de la semana
const traducirDias = async (dias, idiomaDestino) => {
  try {
    // Si el idioma de destino es 1 (español), no traducir
    if (idiomaDestino === 1) {
      return dias; // Retorna los días originales sin traducir
    }

    // Separa los días en un array si están en formato concatenado
    const diasArray = dias.split("\n");

    // Si el idioma de destino es 2 (inglés), traducir
    if (idiomaDestino === 2) {
      const diasTraducidos = await Promise.all(
        diasArray.map(async (dia) => {
          return await traducirTexto(dia, idiomaDestino);
        })
      );

      // Vuelve a unir los días traducidos en el mismo formato
      return diasTraducidos.join("\n");
    }

    // Si el idioma de destino no es 1 ni 2, retornar los días originales
    return dias;
  } catch (error) {
    console.error("Error al traducir los días de la semana:", error);
    return dias; // Retorna los días originales si hay error
  }
};

// Obtener actividades y traducir las metas y objetivos
export const getActividades = async (req, res) => {
  try {
    const connection = await connect();
    const { id_usuario, id_categoria, id_idioma } = req.params;

    // Consulta SQL para obtener actividades con metas y objetivos personalizados
    const [rows] = await connection.query(
      `
      SELECT 
        a.id_actividad,
        a.id_usuario,
        a.fecha_creacion,
        a.fecha_terminado,
        mo.id_categoria,
        c.descripcion AS categoria_descripcion,
        COALESCE(m.descripcion, mp.descripcion) AS meta_descripcion,
        COALESCE(o.descripcion, op.descripcion) AS objetivo_descripcion,
        GROUP_CONCAT(DISTINCT CONCAT(h.hora_inicio, ' - ', h.hora_fin) ORDER BY h.id_horario ASC SEPARATOR '\n') AS horarios,
        GROUP_CONCAT(DISTINCT s.descripcion ORDER BY s.id_semana ASC) AS dias_semana, -- Agrega los días seleccionados
        MAX(e.fecha_evaluacion) AS fecha_evaluacion,
        MAX(r.descripcion) AS evaluacion_respuesta,
        MAX(e.comentario) AS evaluacion_comentario
      FROM actividad a
      LEFT JOIN meta_objetivo mo ON a.id_meta_objetivo = mo.id_meta_objetivo
      LEFT JOIN categoria c ON mo.id_categoria = c.id_categoria
      LEFT JOIN meta m ON mo.id_meta = m.id_meta
      LEFT JOIN meta_personalizada mp ON mo.id_meta_personalizada = mp.id_meta_personalizada
      LEFT JOIN objetivo o ON mo.id_objetivo = o.id_objetivo
      LEFT JOIN objetivo_personalizado op ON mo.id_objetivo_personalizado = op.id_objetivo_personalizado
      LEFT JOIN horario h ON a.id_actividad = h.id_actividad
      LEFT JOIN actividad_semana asw ON a.id_actividad = asw.id_actividad
      LEFT JOIN semana s ON asw.id_semana = s.id_semana
      LEFT JOIN evaluacion e ON a.id_actividad = e.id_actividad
      LEFT JOIN respuesta r ON e.id_respuesta = r.id_respuesta
      WHERE a.id_usuario = ? AND mo.id_categoria = ?
      GROUP BY a.id_actividad
      ORDER BY a.fecha_creacion DESC;
      `,
      [id_usuario, id_categoria]
    );

    console.log("Datos recibidos en getActividades:", {
      id_usuario,
      id_categoria,
    });

    if (rows.length === 0) {
      return res.status(404).json({
        tipo: "error",
        msj: `No se encontraron actividades para el usuario con id_usuario=${id_usuario}, id_categoria=${id_categoria}.`,
      });
    }

    // Traducción de metas y objetivos
    const idiomaDestino = id_idioma === "2" ? "en" : "es"; // Mapea el id_idioma
    const actividadesTraducidas = await Promise.all(
      rows.map(async (actividad) => {
        const metaTraducida = await traducirTexto(
          actividad.meta_descripcion,
          idiomaDestino
        );
        const objetivoTraducido = await traducirTexto(
          actividad.objetivo_descripcion,
          idiomaDestino
        );
        const diasTraducidos = await traducirDias(
          actividad.dias_semana,
          idiomaDestino
        );

        return {
          ...actividad,
          meta_descripcion: metaTraducida,
          objetivo_descripcion: objetivoTraducido,
          dias_semana: diasTraducidos,
        };
      })
    );

    res.json(actividadesTraducidas);
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    res.status(500).json({
      tipo: "error",
      msj: "Error interno del servidor",
    });
  }
};

export const getActividad = async (req, res) => {
  try {
    const connection = await connect();
    const { id_actividad } = req.params;

    const [rows] = await connection.query(
      `
      SELECT 
        a.id_actividad,
        a.id_meta_objetivo,
        a.id_usuario,
        a.fecha_creacion,
        a.fecha_terminado,
        mo.id_categoria,
        m.descripcion AS meta_descripcion,
        m.id_meta,
        o.descripcion AS objetivo_descripcion,
        mo.id_objetivo,
        mp.descripcion AS meta_personalizada,
        op.descripcion AS objetivo_personalizado,
        GROUP_CONCAT(DISTINCT s.id_semana) AS dias_semana
      FROM actividad a
      LEFT JOIN meta_objetivo mo ON a.id_meta_objetivo = mo.id_meta_objetivo
      LEFT JOIN meta m ON mo.id_meta = m.id_meta
      LEFT JOIN objetivo o ON mo.id_objetivo = o.id_objetivo
      LEFT JOIN meta_personalizada mp ON mo.id_meta_personalizada = mp.id_meta_personalizada
      LEFT JOIN objetivo_personalizado op ON mo.id_objetivo_personalizado = op.id_objetivo_personalizado
      LEFT JOIN actividad_semana asw ON a.id_actividad = asw.id_actividad
      LEFT JOIN semana s ON asw.id_semana = s.id_semana
      WHERE a.id_actividad = ?;
      `,
      //[req.params.id_actividad]
      [id_actividad]
    );

    console.log("Datos recibidos en getActividades:", {
      id_actividad,
    });

    if (rows.length === 0) {
      return res.status(404).json({
        tipo: "error",
        msj: "Actividad no encontrada.",
      });
    }

    const actividad = rows[0];

    const [horarios] = await connection.query(
      `
      SELECT 
        id_horario,
        hora_inicio,
        hora_fin
      FROM horario
      WHERE id_actividad = ?;
      `,
      [req.params.id_actividad]
    );

    actividad.horarios = horarios;
    actividad.esMetaPersonalizada = !!actividad.meta_personalizada; // Añadir campo para saber si es personalizada
    res.json(actividad);
  } catch (error) {
    console.error("Error al obtener actividad:", error);
    res.status(500).json({
      tipo: "error",
      msj: "Error interno del servidor.",
    });
  }
};

//crear una actividad
export const saveActividad = async (req, res) => {
  try {
    const connection = await connect();

    // Validar los datos recibidos
    const {
      id_meta_objetivo,
      id_usuario,
      fecha_creacion,
      fecha_terminado,
      diasSeleccionados,
    } = req.body;

    console.log("Datos recibidos en saveActividad:", {
      id_meta_objetivo,
      id_usuario,
      fecha_creacion,
      fecha_terminado,
      diasSeleccionados,
    });

    if (
      !id_meta_objetivo ||
      !id_usuario ||
      !fecha_creacion ||
      !fecha_terminado ||
      !diasSeleccionados
    ) {
      return res.status(400).json({
        tipo: "error",
        msj: "Todos los campos obligatorios deben estar presentes: id_meta_objetivo, id_usuario, fecha_creacion, diasSeleccionados, y fecha_terminado.",
      });
    }

    const [results] = await connection.query(
      `INSERT INTO actividad (id_meta_objetivo, id_usuario, fecha_creacion, fecha_terminado) VALUES (?, ?, ?, ?)`,
      [id_meta_objetivo, id_usuario, fecha_creacion, fecha_terminado]
    );

    const id_actividad = results.insertId;

    // Insertar días en la tabla actividad_semana
    for (const id_dia of diasSeleccionados) {
      await connection.query(
        `INSERT INTO actividad_semana (id_actividad, id_semana) VALUES (?, ?)`,
        [id_actividad, id_dia]
      );
    }

    res.status(201).json({
      tipo: "success",
      msj: "Actividad creada exitosamente",
      id_actividad: results.insertId,
    });
  } catch (error) {
    console.error("Error al guardar la actividad:", error);
    res.status(500).json({
      tipo: "error",
      msj: "Error interno del servidor al guardar la actividad",
    });
  }
};

//borrar una actividad
export const deleteActividad = async (req, res) => {
  try {
    const connection = await connect();
    const { id_actividad } = req.params;
    const [result] = await connection.query(
      "DELETE FROM actividad WHERE id_actividad = ?",
      [id_actividad]
    );

    console.log("Datos recibidos en deleteActividad:", {
      id_actividad,
    });

    // Verifica si se eliminó alguna fila
    if (result.affectedRows === 0) {
      return res.status(404).json({
        tipo: "error",
        msj: "Actividad no encontrada o ya eliminada.",
      });
    }

    res.json({
      tipo: "success",
      msj: "Actividad eliminada exitosamente.",
      id_actividad: req.params.id_actividad,
    });
  } catch (error) {
    console.error("Error al borrar la actividad:", error);
    res.status(500).json({
      tipo: "error",
      msj: "Error al borrar la actividad.",
    });
  }
};

const formatDateForMySQL = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

//actualizar una actividad
export const updateActividad = async (req, res) => {
  try {
    const connection = await connect();

    const {
      id_meta_objetivo,
      metaPersonalizada,
      objetivoPersonalizado,
      fecha_terminado,
      diasSeleccionados,
    } = req.body;
    const { id_actividad } = req.params;

    console.log("Datos recibidos personalizados en updateActividad:", {
      id_meta_objetivo,
      metaPersonalizada,
      objetivoPersonalizado,
      fecha_terminado,
      diasSeleccionados,
    });

    if (!Array.isArray(diasSeleccionados) || diasSeleccionados.length === 0) {
      console.error("Error: días seleccionados no son válidos.");
      return res.status(400).json({
        tipo: "error",
        msj: "Los días seleccionados deben ser un array y no pueden estar vacíos.",
      });
    }

    // Formatear la fecha al formato de MySQL
    const fechaTerminadoFormateada = formatDateForMySQL(fecha_terminado);

    // Actualizar la actividad
    if (metaPersonalizada && objetivoPersonalizado) {
      // Actualizar meta y objetivo personalizados
      await connection.query(
        `
        UPDATE meta_personalizada mp
        JOIN meta_objetivo mo ON mp.id_meta_personalizada = mo.id_meta_personalizada
        SET mp.descripcion = ?
        WHERE mo.id_meta_objetivo = (
          SELECT id_meta_objetivo FROM actividad WHERE id_actividad = ?
        );
        `,
        [metaPersonalizada, id_actividad]
      );

      await connection.query(
        `
        UPDATE objetivo_personalizado op
        JOIN meta_objetivo mo ON op.id_objetivo_personalizado = mo.id_objetivo_personalizado
        SET op.descripcion = ?
        WHERE mo.id_meta_objetivo = (
          SELECT id_meta_objetivo FROM actividad WHERE id_actividad = ?
        );
        `,
        [objetivoPersonalizado, id_actividad]
      );
    } else {
      // Validar que id_meta_objetivo esté definido
      if (!id_meta_objetivo) {
        return res.status(400).json({
          tipo: "error",
          msj: "El campo id_meta_objetivo es obligatorio para actividades no personalizadas.",
        });
      }

      // Actualizar con meta y objetivo predeterminados
      await connection.query(
        `
        UPDATE actividad 
        SET id_meta_objetivo = ?, 
            fecha_terminado = ? 
        WHERE id_actividad = ?;
        `,
        [id_meta_objetivo, fechaTerminadoFormateada, id_actividad]
      );
    }

    console.log("Datos recibidos predeterminados en updateActividad:", {
      id_meta_objetivo,
      fecha_terminado: fechaTerminadoFormateada,
      id_actividad,
    });

    // Eliminar días actuales asociados a la actividad
    await connection.query(
      `DELETE FROM actividad_semana WHERE id_actividad = ?`,
      [id_actividad]
    );

    // Insertar los nuevos días seleccionados
    const diasValidos = diasSeleccionados.filter((id) =>
      Number.isInteger(parseInt(id))
    );

    if (diasValidos.length > 0) {
      const valores = diasValidos.map((id_dia) => [id_actividad, id_dia]);
      await connection.query(
        `INSERT INTO actividad_semana (id_actividad, id_semana) VALUES ?`,
        [valores]
      );
    }

    res.json({
      tipo: "success",
      msj: "Actividad actualizada exitosamente",
      id_actividad,
      diasSeleccionados,
    });
  } catch (error) {
    console.error("Error al actualizar la actividad:", error);
    res.status(500).json({
      tipo: "error",
      msj: "Error interno del servidor",
    });
  }
};

export const getDiasSemana = async (req, res) => {
  try {
    const { id_idioma } = req.query; // Obtén el idioma desde los parámetros de consulta

    const connection = await connect();
    const [rows] = await connection.query(`SELECT * FROM semana`);

    // Si el idioma es 1 (español), no traducir
    if (id_idioma === "1") {
      return res.json(rows); // Retorna los días originales sin traducir
    }

    // Si el idioma es 2 (inglés), traducir
    if (id_idioma === "2") {
      const diasTraducidos = await Promise.all(
        rows.map(async (dia) => ({
          ...dia,
          descripcion: await traducirTexto(dia.descripcion, "en"), // Traduce al inglés
        }))
      );
      return res.json(diasTraducidos);
    }

    // Si el idioma no es 1 ni 2, retornar los días originales
    return res.json(rows);
  } catch (error) {
    console.error("Error al obtener días de la semana:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// export const getDiasSemana = async (req, res) => {
//   try {
//     const { id_idioma } = req.query; // Obtén el idioma como parámetro de consulta
//     const connection = await connect();

//     // Mapa de traducciones estático
//     const traducciones = {
//       en: {
//         Lunes: "Monday",
//         Martes: "Tuesday",
//         Miércoles: "Wednesday",
//         Jueves: "Thursday",
//         Viernes: "Friday",
//         Sábado: "Saturday",
//         Domingo: "Sunday",
//         "Todos los días": "All Days",
//       },
//       es: {
//         Monday: "Lunes",
//         Tuesday: "Martes",
//         Wednesday: "Miércoles",
//         Thursday: "Jueves",
//         Friday: "Viernes",
//         Saturday: "Sábado",
//         Sunday: "Domingo",
//         "All Days": "Todos los días",
//       },
//     };

//     const idiomaDestino = id_idioma === "2" ? "en" : "es"; // Determina el idioma (1 = español, 2 = inglés)

//     const [rows] = await connection.query(`SELECT * FROM semana`);

//     // Traduce las descripciones
//     const diasTraducidos = rows.map((dia) => ({
//       ...dia,
//       descripcion:
//         traducciones[idiomaDestino][dia.descripcion] || dia.descripcion,
//     }));

//     res.json(diasTraducidos);
//   } catch (error) {
//     console.error("Error al obtener días de la semana:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

// Controlador para guardar una meta personalizada
export const saveMetaPersonalizada = async (req, res) => {
  try {
    const connection = await connect();
    const { id_usuario, descripcion } = req.body;

    console.log("Datos recibidos en saveMetaPersonalizada:", {
      id_usuario,
      descripcion,
    });

    const [results] = await connection.query(
      `INSERT INTO meta_personalizada (id_usuario, descripcion) VALUES (?, ?)`,
      [id_usuario, descripcion]
    );

    res.status(201).json({
      tipo: "success",
      msj: "Meta personalizada creada exitosamente",
      id_meta_personalizada: results.insertId,
    });
  } catch (error) {
    console.error("Error al guardar la meta personalizada:", error);
    res.status(500).json({
      tipo: "error",
      msj: "Error interno del servidor al guardar la meta personalizada",
    });
  }
};

// Controlador para guardar un objetivo personalizado
export const saveObjetivoPersonalizado = async (req, res) => {
  try {
    const connection = await connect();
    const { id_usuario, descripcion } = req.body;

    console.log("Datos recibidos en saveObjetivoPersonalizado:", {
      id_usuario,
      descripcion,
    });

    const [results] = await connection.query(
      `INSERT INTO objetivo_personalizado (id_usuario, descripcion) VALUES (?, ?)`,
      [id_usuario, descripcion]
    );

    res.status(201).json({
      tipo: "success",
      msj: "Objetivo personalizado creado exitosamente",
      id_objetivo_personalizado: results.insertId,
    });
  } catch (error) {
    console.error("Error al guardar el objetivo personalizado:", error);
    res.status(500).json({
      tipo: "error",
      msj: "Error interno del servidor al guardar el objetivo personalizado",
    });
  }
};

// Controlador para guardar la relación meta-objetivo personalizada
export const saveMetaObjetivoPersonalizado = async (req, res) => {
  try {
    const connection = await connect();
    const { id_categoria, id_meta_personalizada, id_objetivo_personalizado } =
      req.body;

    console.log("Datos recibidos en saveMetaObjetivoPersonalizado:", {
      id_categoria,
      id_meta_personalizada,
      id_objetivo_personalizado,
    });

    const [results] = await connection.query(
      `INSERT INTO meta_objetivo (id_categoria, id_meta_personalizada, id_objetivo_personalizado) VALUES (?, ?, ?)`,
      [id_categoria, id_meta_personalizada, id_objetivo_personalizado]
    );

    res.status(201).json({
      tipo: "success",
      msj: "Meta-Objetivo personalizado creado exitosamente",
      id_meta_objetivo: results.insertId,
    });
  } catch (error) {
    console.error(
      "Error al guardar la relación meta-objetivo personalizada:",
      error
    );
    res.status(500).json({
      tipo: "error",
      msj: "Error interno del servidor al guardar la relación meta-objetivo personalizada",
    });
  }
};
