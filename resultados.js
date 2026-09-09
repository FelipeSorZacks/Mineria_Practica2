
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const contenedorResultados = document.getElementById("contenedor-resultados");
const resumenNumerico = document.getElementById("resumen-numerico");

db.ref("respuestas").on("value", (snapshot) => {
  const datosCrudos = snapshot.val() || {};
  const registros = Object.values(datosCrudos);

  renderizarResumenNumerico(registros);
  renderizarDatosBasicos(registros);
  renderizarPreguntasCerradas(registros);
  renderizarRespuestasAbiertas(registros);
});

// Colores fijos para las 4 opciones (a, b, c, d) de cada pregunta,
// así se mantienen consistentes entre gráfica y gráfica.
const COLORES_OPCIONES = {
  a: "#2c6e49",
  b: "#4c956c",
  c: "#a5b592",
  d: "#d68c45",
};

// Guarda la instancia de cada gráfica de Chart.js para poder destruirla
// antes de volver a dibujarla (si no, Chart.js lanza un error de "canvas
// ya en uso" cada vez que Firebase entrega datos nuevos).
const graficasPorPregunta = {};
const graficasDatosBasicos = {};

// Rangos usados para agrupar la edad en la gráfica de barras.
const RANGOS_EDAD = [
  { etiqueta: "18-25", min: 18, max: 25 },
  { etiqueta: "26-35", min: 26, max: 35 },
  { etiqueta: "36-45", min: 36, max: 45 },
  { etiqueta: "46-55", min: 46, max: 55 },
  { etiqueta: "56-65", min: 56, max: 65 },
  { etiqueta: "66+", min: 66, max: Infinity },
];

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

// ---------------------------------------------------------------------
// Datos básicos: distribución de sexo (pastel) y de edad (barras)
// ---------------------------------------------------------------------
function renderizarDatosBasicos(registros) {
  const contenedor = document.getElementById("contenedor-datos-basicos");

  if (registros.length === 0) {
    contenedor.innerHTML = "";
    return;
  }

  contenedor.innerHTML = `
    <div class="bloque-pregunta">
      <h3>Distribución por sexo</h3>
      <div class="contenedor-grafica">
        <canvas id="grafica-sexo"></canvas>
      </div>
    </div>
    <div class="bloque-pregunta">
      <h3>Distribución por edad</h3>
      <div class="contenedor-grafica contenedor-grafica-ancha">
        <canvas id="grafica-edad"></canvas>
      </div>
    </div>
  `;

  dibujarGraficaSexo(registros);
  dibujarGraficaEdad(registros);
}

function dibujarGraficaSexo(registros) {
  const canvas = document.getElementById("grafica-sexo");
  if (!canvas) return;

  const conteos = {};
  OPCIONES_SEXO.forEach((opcion) => (conteos[opcion] = 0));
  registros.forEach((registro) => {
    if (conteos.hasOwnProperty(registro.sexo)) {
      conteos[registro.sexo]++;
    }
  });

  if (graficasDatosBasicos.sexo) {
    graficasDatosBasicos.sexo.destroy();
  }

  graficasDatosBasicos.sexo = new Chart(canvas, {
    type: "pie",
    data: {
      labels: OPCIONES_SEXO,
      datasets: [
        {
          data: OPCIONES_SEXO.map((opcion) => conteos[opcion]),
          backgroundColor: ["#2c6e49", "#d68c45", "#a5b592"],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 14, font: { size: 11 } },
        },
      },
    },
  });
}

function dibujarGraficaEdad(registros) {
  const canvas = document.getElementById("grafica-edad");
  if (!canvas) return;

  const edades = registros.map((r) => Number(r.edad)).filter((n) => !isNaN(n));

  const conteosPorRango = RANGOS_EDAD.map((rango) => {
    return edades.filter((edad) => edad >= rango.min && edad <= rango.max).length;
  });

  if (graficasDatosBasicos.edad) {
    graficasDatosBasicos.edad.destroy();
  }

  graficasDatosBasicos.edad = new Chart(canvas, {
    type: "bar",
    data: {
      labels: RANGOS_EDAD.map((r) => r.etiqueta),
      datasets: [
        {
          label: "Personas",
          data: conteosPorRango,
          backgroundColor: "#4c956c",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });
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
        <div class="fila-pregunta">
          <div class="contenedor-grafica">
            <canvas id="grafica-${pregunta.id}"></canvas>
          </div>
          <table>
            <thead>
              <tr><th>Opción</th><th>Frecuencia</th><th>Porcentaje</th></tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      </div>
    `;
  });

  contenedorResultados.innerHTML = html;

  // Una vez que los <canvas> ya existen en el DOM, dibuja cada gráfica.
  PREGUNTAS_CERRADAS.forEach((pregunta) => {
    const conteos = { a: 0, b: 0, c: 0, d: 0 };
    registros.forEach((registro) => {
      const respuesta = registro[pregunta.id];
      if (conteos.hasOwnProperty(respuesta)) {
        conteos[respuesta]++;
      }
    });
    dibujarGraficaPastel(pregunta, conteos);
  });
}

// Dibuja (o vuelve a dibujar) la gráfica de pastel de una pregunta cerrada.
function dibujarGraficaPastel(pregunta, conteos) {
  const canvas = document.getElementById(`grafica-${pregunta.id}`);
  if (!canvas) return;

  // Si ya existía una gráfica en este canvas (de una actualización
  // anterior de Firebase), se destruye antes de crear la nueva.
  if (graficasPorPregunta[pregunta.id]) {
    graficasPorPregunta[pregunta.id].destroy();
  }

  const etiquetas = Object.entries(pregunta.opciones).map(([, texto]) => texto);
  const valores = Object.keys(pregunta.opciones).map((clave) => conteos[clave]);
  const colores = Object.keys(pregunta.opciones).map((clave) => COLORES_OPCIONES[clave]);

  graficasPorPregunta[pregunta.id] = new Chart(canvas, {
    type: "pie",
    data: {
      labels: etiquetas,
      datasets: [
        {
          data: valores,
          backgroundColor: colores,
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 14, font: { size: 11 } },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------
// Respuestas finales: listado completo de las 2 preguntas abiertas
// ---------------------------------------------------------------------
function renderizarRespuestasAbiertas(registros) {
  const contenedorAbiertas = document.getElementById("contenedor-abiertas");

  if (registros.length === 0) {
    contenedorAbiertas.innerHTML = "<p>Aún no hay respuestas registradas.</p>";
    return;
  }

  let html = "";

  PREGUNTAS_ABIERTAS.forEach((pregunta) => {
    const respuestas = registros
      .map((registro) => registro[pregunta.id])
      .filter((texto) => texto && texto.trim() !== "");

    const items = respuestas
      .map((texto) => `<li>${escaparHTML(texto)}</li>`)
      .join("");

    html += `
      <div class="bloque-abierta">
        <h3>${pregunta.texto}</h3>
        <ul class="lista-respuestas">${items}</ul>
      </div>
    `;
  });

  contenedorAbiertas.innerHTML = html;
}

// Evita que texto libre con < o > rompa el HTML al insertarlo.
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}
