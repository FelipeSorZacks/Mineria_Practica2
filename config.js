/**
 * config.js
 * -----------------------------------------------------------------------
 * PEGA AQUÍ los datos de tu proyecto de Firebase.
 * Los obtienes en: Firebase Console > Configuración del proyecto (ícono de
 * engrane) > "Tus apps" > app web > "Configuración del SDK".
 *
 * Es el ÚNICO archivo que necesitas editar para conectar el proyecto a tu
 * propia base de datos. index.html, resultados.html y poblar.js dependen
 * de databaseURL para funcionar.
 * -----------------------------------------------------------------------
 */

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com", // OJO: es el que usa poblar.js también
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx",
};
