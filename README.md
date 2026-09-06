# Encuesta: Remodelación, Arquitectura y Mantenimiento del Hogar

Proyecto para la materia de Minería de Datos. Contiene:

- `index.html` / `app.js` — formulario de encuesta.
- `resultados.html` / `resultados.js` — panel de resultados en tiempo real (frecuencias y porcentajes).
- `preguntas.js` — catálogo único de preguntas y opciones (lo usan ambas páginas).
- `config.js` — aquí van tus credenciales de Firebase.
- `style.css` — estilos básicos.
- `poblar.js` — script de Node.js para generar 98 registros simulados.

---

## 1. Crear el proyecto en Firebase

1. Entra a [https://console.firebase.google.com](https://console.firebase.google.com) e inicia sesión con tu cuenta de Google.
2. Clic en **"Agregar proyecto"**. Ponle un nombre (ej. `encuesta-hogar`) y termina el asistente (puedes desactivar Google Analytics, no la necesitas).
3. Una vez creado el proyecto, en el menú lateral entra a **Build > Realtime Database**.
4. Clic en **"Crear base de datos"**.
   - Elige la ubicación del servidor (cualquiera cercana, ej. `us-central1`).
   - En "Reglas de seguridad" elige **"Comenzar en modo de prueba"** (esto deja lectura/escritura abiertas por 30 días, ideal para la práctica).
5. Copia la URL que aparece arriba de la base de datos, algo como:
   `https://encuesta-hogar-default-rtdb.firebaseio.com`
   Esa es tu `databaseURL`.

## 2. Obtener las claves de la app web

1. En el menú lateral, clic en el ícono de engrane ⚙️ junto a "Descripción general del proyecto" > **"Configuración del proyecto"**.
2. Baja hasta **"Tus apps"** y clic en el ícono `</>` (Web).
3. Ponle un apodo a la app (ej. `encuesta-web`) y clic en **"Registrar app"**. NO necesitas activar Firebase Hosting.
4. Firebase te mostrará un objeto `firebaseConfig` como este:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "encuesta-hogar.firebaseapp.com",
     databaseURL: "https://encuesta-hogar-default-rtdb.firebaseio.com",
     projectId: "encuesta-hogar",
     storageBucket: "encuesta-hogar.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456",
   };
   ```

5. Copia y pega ESOS valores dentro de `config.js`, reemplazando los valores de ejemplo (`TU_API_KEY_AQUI`, etc).

## 3. Ajustar las reglas de lectura/escritura (para la prueba)

Por defecto, el modo de prueba ya deja todo abierto por 30 días. Si quieres dejarlo abierto manualmente (o si ya expiró el modo de prueba):

1. Ve a **Realtime Database > Reglas**.
2. Reemplaza el contenido por:

   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

3. Clic en **"Publicar"**.

> ⚠️ Estas reglas dejan la base de datos totalmente abierta a internet. Están bien para una práctica escolar de corta duración, pero **no las dejes así en un proyecto real**: cualquiera con la URL podría leer o borrar los datos.

## 4. Probar en local y subir a GitHub Pages

1. Verifica que `config.js` ya tenga tus datos reales.
2. Abre `index.html` con Live Server (o cualquier servidor local) y llena el formulario para probar que se guarda un registro.
3. Abre `resultados.html` y confirma que aparece 1 respuesta con 100% en las opciones elegidas.
4. Sube la carpeta completa a un repositorio de GitHub.
5. En el repositorio: **Settings > Pages > Source**, selecciona la rama `main` y la carpeta raíz (`/`). Guarda.
6. GitHub te dará una URL pública (ej. `https://tu-usuario.github.io/encuesta-hogar/`). Compártela para que la gente conteste.

## 5. Poblar la base de datos con 98 registros simulados

1. Asegúrate de tener [Node.js 18 o superior](https://nodejs.org) instalado (`node -v` para comprobar).
2. Abre `poblar.js` y reemplaza `DATABASE_URL` con la misma URL que pusiste en `config.js`.
3. Desde la terminal, dentro de la carpeta del proyecto, ejecuta:

   ```bash
   node poblar.js
   ```

4. Verás en la consola el progreso registro por registro. Al terminar, abre `resultados.html`: deberías ver 98 respuestas contabilizadas con sus frecuencias y porcentajes.
5. Contesta la encuesta 2 veces más desde `index.html` (tú y alguien más) para llegar a 100 respuestas totales.

---

### Notas sobre el diseño de datos

Cada respuesta se guarda en Realtime Database bajo el nodo `respuestas` con esta forma:

```json
{
  "sexo": "Femenino",
  "edad": 34,
  "p1": "b",
  "p2": "a",
  "p3": "c",
  "p4": "b",
  "p5": "d",
  "p6": "a",
  "abierta1": "Texto libre...",
  "abierta2": "Texto libre...",
  "timestamp": 1737654321000
}
```

Guardar la llave (`a`, `b`, `c`, `d`) en vez del texto completo de la opción hace más simple el conteo de frecuencias y ahorra espacio; el texto de cada opción vive solo en `preguntas.js`.
