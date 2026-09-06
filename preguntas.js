/**
 * preguntas.js
 * -----------------------------------------------------------------------
 * Catálogo ÚNICO de preguntas cerradas (6) y abiertas (2) de la encuesta.
 * Tanto index.html (formulario) como resultados.html (conteo) importan
 * este archivo para que las claves de opciones (a, b, c, d) y los textos
 * coincidan siempre. Si necesitas cambiar una pregunta, cámbiala SOLO aquí.
 * -----------------------------------------------------------------------
 */

// Cada pregunta cerrada tiene: un id único (se usa como nombre del campo
// radio y como llave dentro del registro que se guarda en Firebase) y
// exactamente 4 opciones con su propia llave (a-d) y texto visible.
const PREGUNTAS_CERRADAS = [
  {
    id: "p1",
    texto: "1. ¿Cuándo fue la última vez que pintaste tu casa?",
    opciones: {
      a: "Hace menos de 1 año",
      b: "Entre 1 y 3 años",
      c: "Entre 3 y 5 años",
      d: "Hace más de 5 años o nunca",
    },
  },
  {
    id: "p2",
    texto: "2. ¿Qué tipo de remodelación has hecho recientemente?",
    opciones: {
      a: "Cocina",
      b: "Baño",
      c: "Sala o recámaras",
      d: "Ninguna remodelación",
    },
  },
  {
    id: "p3",
    texto: "3. ¿Qué área de tu casa te gustaría ampliar o mejorar?",
    opciones: {
      a: "Cocina",
      b: "Patio o jardín",
      c: "Recámaras",
      d: "Sala o comedor",
    },
  },
  {
    id: "p4",
    texto: "4. ¿Qué material prefieres para los pisos?",
    opciones: {
      a: "Cerámica",
      b: "Madera o laminado",
      c: "Vinil",
      d: "Concreto pulido",
    },
  },
  {
    id: "p5",
    texto: "5. Para reparaciones del hogar, ¿contratas profesionales o lo haces tú mismo?",
    opciones: {
      a: "Siempre contrato profesionales",
      b: "Generalmente lo hago yo mismo (DIY)",
      c: "Depende de la complejidad del trabajo",
      d: "Pido ayuda a familiares o amigos",
    },
  },
  {
    id: "p6",
    texto: "6. ¿Qué presupuesto anual sueles destinar a mejoras del hogar?",
    opciones: {
      a: "Menos de $5,000 MXN",
      b: "Entre $5,000 y $15,000 MXN",
      c: "Entre $15,000 y $30,000 MXN",
      d: "Más de $30,000 MXN",
    },
  },
];

// Preguntas abiertas (texto libre, se guardan tal cual el usuario las escribe).
const PREGUNTAS_ABIERTAS = [
  {
    id: "abierta1",
    texto: "7. Describe la remodelación o reparación más significativa que has hecho en tu hogar.",
  },
  {
    id: "abierta2",
    texto: "8. ¿Qué idea o proyecto de remodelación te gustaría realizar en el futuro y por qué?",
  },
];

// Opciones para el dato "Sexo" (radio buttons).
const OPCIONES_SEXO = ["Masculino", "Femenino", "Otro / Prefiero no decir"];
