/**
 * app.js
 * -----------------------------------------------------------------------
 * 1. Construye dinámicamente el HTML de las preguntas (a partir de
 *    preguntas.js), para no repetir <fieldset> a mano y evitar errores.
 * 2. Al enviar el formulario, arma un objeto "registro" y lo guarda en
 *    Firebase Realtime Database dentro del nodo "respuestas".
 * -----------------------------------------------------------------------
 */

// Inicializa Firebase con la configuración de config.js
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------------------------------------------------------------------
// 1) CONSTRUCCIÓN DINÁMICA DEL FORMULARIO
// ---------------------------------------------------------------------

// --- Sexo ---
const contenedorSexo = document.getElementById("contenedor-sexo");
OPCIONES_SEXO.forEach((texto, i) => {
  contenedorSexo.innerHTML += `
    <label>
      <input type="radio" name="sexo" value="${texto}" ${i === 0 ? "required" : ""} />
      ${texto}
    </label>
  `;
});

// --- 6 preguntas cerradas, 4 opciones cada una ---
const contenedorCerradas = document.getElementById("contenedor-preguntas-cerradas");
PREGUNTAS_CERRADAS.forEach((pregunta) => {
  const opcionesHTML = Object.entries(pregunta.opciones)
    .map(
      ([clave, texto], i) => `
      <label>
        <input type="radio" name="${pregunta.id}" value="${clave}" ${i === 0 ? "required" : ""} />
        ${texto}
      </label>`
    )
    .join("");

  contenedorCerradas.innerHTML += `
    <fieldset>
      <legend>${pregunta.texto}</legend>
      ${opcionesHTML}
    </fieldset>
  `;
});

// --- 2 preguntas abiertas ---
const contenedorAbiertas = document.getElementById("contenedor-preguntas-abiertas");
PREGUNTAS_ABIERTAS.forEach((pregunta) => {
  contenedorAbiertas.innerHTML += `
    <fieldset>
      <legend>${pregunta.texto}</legend>
      <textarea name="${pregunta.id}" required></textarea>
    </fieldset>
  `;
});

// ---------------------------------------------------------------------
// 2) ENVÍO DEL FORMULARIO
// ---------------------------------------------------------------------

const form = document.getElementById("form-encuesta");
const btnEnviar = document.getElementById("btn-enviar");
const mensajeEstado = document.getElementById("mensaje-estado");

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const datos = new FormData(form);

  // Arma el registro que se guardará en la base de datos.
  const registro = {
    sexo: datos.get("sexo"),
    edad: Number(datos.get("edad")),
    timestamp: Date.now(), // útil para ordenar u observar la evolución de la muestra
  };

  // Agrega las 6 respuestas cerradas (guardamos la LLAVE: "a", "b", "c" o "d")
  PREGUNTAS_CERRADAS.forEach((pregunta) => {
    registro[pregunta.id] = datos.get(pregunta.id);
  });

  // Agrega las 2 respuestas abiertas (texto libre)
  PREGUNTAS_ABIERTAS.forEach((pregunta) => {
    registro[pregunta.id] = datos.get(pregunta.id);
  });

  btnEnviar.disabled = true;
  mensajeEstado.textContent = "Enviando...";
  mensajeEstado.className = "";

  // push() genera un ID único automáticamente dentro de "respuestas"
  db.ref("respuestas")
    .push(registro)
    .then(() => {
      mensajeEstado.textContent = "¡Gracias! Tu respuesta fue registrada.";
      mensajeEstado.className = "ok";
      form.reset();
      btnEnviar.disabled = false;
    })
    .catch((error) => {
      console.error("Error al guardar en Firebase:", error);
      mensajeEstado.textContent = "Ocurrió un error al enviar. Intenta de nuevo.";
      mensajeEstado.className = "error";
      btnEnviar.disabled = false;
    });
});
