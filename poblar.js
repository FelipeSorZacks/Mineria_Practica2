/**
 * poblar.js
 * -----------------------------------------------------------------------
 * Script INDEPENDIENTE (no corre en el navegador) para poblar la base de
 * datos con 98 registros simulados, dejando solo 2 lugares para llegar a
 * 100 respuestas "reales".
 *
 * Requisitos:
 *   - Node.js 18 o superior (usa el fetch global, no necesitas instalar nada).
 *   - Que en config.js ya hayas puesto tu databaseURL real de Firebase.
 *   - Que las reglas de Realtime Database permitan escritura (ver README).
 *
 * Cómo ejecutarlo:
 *   node poblar.js
 *
 * Qué hace:
 *   1. Genera 98 registros con edad, sexo y las 6 respuestas cerradas
 *      elegidas al azar (pero dentro de rangos y catálogos coherentes),
 *      más un par de respuestas abiertas tomadas de una lista de ejemplos.
 *   2. Envía cada registro con POST a la REST API de Realtime Database,
 *      que es exactamente lo mismo que hace push() en el navegador.
 * -----------------------------------------------------------------------
 */

// ---------------------------------------------------------------------
// 1) CONFIGURACIÓN: pega aquí la misma databaseURL que usaste en config.js
// ---------------------------------------------------------------------
const DATABASE_URL = "https://TU_PROYECTO-default-rtdb.firebaseio.com";
const CANTIDAD_A_GENERAR = 98;

// ---------------------------------------------------------------------
// 2) CATÁLOGOS usados para generar datos coherentes (deben coincidir con
//    las llaves "a","b","c","d" definidas en preguntas.js)
// ---------------------------------------------------------------------
const OPCIONES_SEXO = ["Masculino", "Femenino", "Otro / Prefiero no decir"];
const LLAVES_OPCIONES = ["a", "b", "c", "d"];

// Pequeños bancos de frases para las 2 preguntas abiertas, para que las
// respuestas simuladas no se vean todas idénticas ni sean basura aleatoria.
const RESPUESTAS_ABIERTA_1 = [
  "Cambié el piso de la sala por porcelanato, tardó dos semanas.",
  "Remodelé el baño principal, fue la reparación más cara que he hecho.",
  "Pinté toda la fachada y cambié las ventanas por unas de aluminio.",
  "Amplié la cocina y agregué una barra desayunadora.",
  "Reparé una fuga de agua que dañó el techo del cuarto.",
  "Cambié la instalación eléctrica de toda la casa.",
  "Construí un cuarto extra en la azotea.",
  "Renové el jardín y puse una pequeña terraza.",
];

const RESPUESTAS_ABIERTA_2 = [
  "Me gustaría ampliar la cocina para tener más espacio de almacenamiento.",
  "Quiero construir un estudio en el patio trasero.",
  "Planeo cambiar todos los pisos por madera laminada.",
  "Me interesa instalar paneles solares en el techo.",
  "Quisiera remodelar el baño con acabados más modernos.",
  "Me gustaría techar el patio para usarlo como comedor exterior.",
  "Pienso hacer una recámara adicional para cuando crezca la familia.",
  "Quiero mejorar la fachada y el jardín delantero.",
];

// ---------------------------------------------------------------------
// 3) FUNCIONES AUXILIARES DE GENERACIÓN ALEATORIA
// ---------------------------------------------------------------------

// Entero aleatorio entre min y max, ambos incluidos.
function enteroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Elige un elemento al azar de un arreglo.
function elegirAlAzar(arreglo) {
  return arreglo[enteroAleatorio(0, arreglo.length - 1)];
}

// Genera un solo registro coherente.
function generarRegistro() {
  const registro = {
    sexo: elegirAlAzar(OPCIONES_SEXO),
    edad: enteroAleatorio(18, 70), // rango de edad adulta razonable para dueños/inquilinos de casa
    timestamp: Date.now() - enteroAleatorio(0, 1000 * 60 * 60 * 24 * 60), // repartidos en los últimos ~60 días
  };

  // 6 preguntas cerradas: cada una responde con una llave a/b/c/d al azar
  for (let i = 1; i <= 6; i++) {
    registro[`p${i}`] = elegirAlAzar(LLAVES_OPCIONES);
  }

  // 2 preguntas abiertas
  registro.abierta1 = elegirAlAzar(RESPUESTAS_ABIERTA_1);
  registro.abierta2 = elegirAlAzar(RESPUESTAS_ABIERTA_2);

  return registro;
}

// ---------------------------------------------------------------------
// 4) ENVÍO A FIREBASE (REST API)
// ---------------------------------------------------------------------
// POST a "<databaseURL>/respuestas.json" es equivalente a hacer
// db.ref("respuestas").push(registro) desde el navegador: Firebase genera
// un ID único automáticamente para cada registro.
async function guardarRegistro(registro) {
  const respuesta = await fetch(`${DATABASE_URL}/respuestas.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registro),
  });

  if (!respuesta.ok) {
    const textoError = await respuesta.text();
    throw new Error(`Error HTTP ${respuesta.status}: ${textoError}`);
  }

  return respuesta.json();
}

// ---------------------------------------------------------------------
// 5) EJECUCIÓN PRINCIPAL
// ---------------------------------------------------------------------
async function main() {
  if (DATABASE_URL.includes("TU_PROYECTO")) {
    console.error(
      "⚠️  Antes de correr este script, reemplaza DATABASE_URL con la URL real de tu proyecto de Firebase."
    );
    process.exit(1);
  }

  console.log(`Generando y subiendo ${CANTIDAD_A_GENERAR} registros simulados...`);

  let exitosos = 0;
  for (let i = 1; i <= CANTIDAD_A_GENERAR; i++) {
    const registro = generarRegistro();
    try {
      await guardarRegistro(registro);
      exitosos++;
      console.log(`(${i}/${CANTIDAD_A_GENERAR}) OK -> edad ${registro.edad}, sexo ${registro.sexo}`);
    } catch (error) {
      console.error(`(${i}/${CANTIDAD_A_GENERAR}) FALLÓ:`, error.message);
    }
  }

  console.log(`\nListo. ${exitosos} de ${CANTIDAD_A_GENERAR} registros subidos correctamente.`);
  console.log("Solo faltan 2 respuestas reales para llegar a 100. 🎉");
}

main();
