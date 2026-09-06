/**
 * resultados.js
 * -----------------------------------------------------------------------
 * Se suscribe con .on("value", ...) al nodo "respuestas" de Firebase, así
 * que cada vez que llega un nuevo registro (por ejemplo, alguien envía el
 * formulario o corre poblar.js) esta página recalcula todo automáticamente,
 * sin necesidad de recargar.
 *
 * Para cada pregunta cerrada se calcula:
 *   - Frecuencia absoluta: cuántas personas eligieron cada opción.
 *   - Porcentaje: conteo / total de respuestas * 100.
 * Como cada persona elige EXACTAMENTE una opción por pregunta, la suma de
 * los 4 porcentajes de una misma pregunta nunca puede superar el 100%
 * (a lo mucho da 100% si nadie dejó la pregunta sin responder).
 * -----------------------------------------------------------------------
 */

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const contenedorResultados = document.getElementById("contenedor-resultados");
const resumenNumerico = document.getElementById("resumen-numerico");

db.ref("respuestas").on("value", (snapshot) => {
  const datosCrudos = snapshot.val() || {};
  // Firebase entrega un objeto { idGenerado1: {...}, idGenerado2: {...} };
  // lo convertimos a un arreglo para poder usar map/filter/reduce.
  const registros = Object.values(datosCrudos);

  renderizarResumenNumerico(registros);
  renderizarPreguntasCerradas(registros);
});

// ---------------------------------------------------------------------
// Resumen numérico: total de respuestas + estadísticas de edad
// ---------------------------------------------------------------------
function renderizarResumenNumerico(registros) {
  const total = registros.length;
  const edades = registros
    .map((r) => Number(r.edad))
    .filter((n) => !isNaN(n));

  const promedio = edades.length ? promedioDe(edades) : 0;
  const mediana = edades.length ? medianaDe(edades) : 0;
  const desviacion = edades.length ? desviacionEstandarDe(edades) : 0;

  resumenNumerico.innerHTML = `
    <div><span>${total}</span><small>Total de respuestas</small></div>
    <div><span>${promedio.toFixed(1)}</span><small>Edad promedio</small></div>
    <div><span>${mediana.toFixed(1)}</span><small>Edad mediana</small></div>
    <div><span>${desviacion.toFixed(1)}</span><small>Desv. estándar edad</small></div>
  `;
}

function promedioDe(numeros) {
  return numeros.reduce((suma, n) => suma + n, 0) / numeros.length;
}

function medianaDe(numeros) {
  const ordenados = [...numeros].sort((a, b) => a - b);
  const mitad = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 !== 0
    ? ordenados[mitad]
    : (ordenados[mitad - 1] + ordenados[mitad]) / 2;
}

function desviacionEstandarDe(numeros) {
  const media = promedioDe(numeros);
  const sumaCuadrados = numeros.reduce((suma, n) => suma + (n - media) ** 2, 0);
  return Math.sqrt(sumaCuadrados / numeros.length);
}

// ---------------------------------------------------------------------
// Tabla de frecuencia + porcentaje por cada pregunta cerrada
// ---------------------------------------------------------------------
function renderizarPreguntasCerradas(registros) {
  const total = registros.length;

  if (total === 0) {
    contenedorResultados.innerHTML = "<p>Aún no hay respuestas registradas.</p>";
    return;
  }

  let html = "";

  PREGUNTAS_CERRADAS.forEach((pregunta) => {
    // Inicializa el conteo en 0 para las 4 opciones (a, b, c, d)
    const conteos = { a: 0, b: 0, c: 0, d: 0 };

    registros.forEach((registro) => {
      const respuesta = registro[pregunta.id];
      if (conteos.hasOwnProperty(respuesta)) {
        conteos[respuesta]++;
      }
    });

    const filas = Object.entries(pregunta.opciones)
      .map(([clave, texto]) => {
        const conteo = conteos[clave];
        // Porcentaje respecto al total de respuestas: al ser una sola
        // opción por persona, la suma de las 4 filas nunca pasa de 100%.
        const porcentaje = ((conteo / total) * 100).toFixed(1);
        return `
          <tr>
            <td>${texto}</td>
            <td class="numero">${conteo}</td>
            <td class="numero">${porcentaje}%</td>
          </tr>
        `;
      })
      .join("");

    html += `
      <div class="bloque-pregunta">
        <h3>${pregunta.texto}</h3>
        <table>
          <thead>
            <tr><th>Opción</th><th>Frecuencia</th><th>Porcentaje</th></tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    `;
  });

  contenedorResultados.innerHTML = html;
}
