# ROLO – Registra. Aprende. Progresa.

Bitácora de entrenamiento de Jiu-Jitsu Brasileño: registro de sesiones, biblioteca de técnicas,
progreso hacia el siguiente cinturón y panel de validación para profesores.

**Stack:** React 19 + Vite + Tailwind 4 · Firebase Auth + Firestore · Express / Netlify Functions · Gemini (análisis opcional).

## Cómo funciona
- **Login real** con correo/contraseña y Google (Firebase Auth), registro y recuperación de contraseña.
- **Todo se guarda en Firestore** por usuario: perfil, sesiones (`users/{uid}/sessions`) y validaciones (`validations`).
- **Roles:** todos nacen como `alumno`. Un profesor ve el panel de validación y la lista de alumnos.
- **Progreso real:** 40 % sesiones registradas en el cinturón actual + 60 % checklist técnico validado por un profesor.
- **API protegida** (`/api/*`): exige el ID token de Firebase, lee los datos en el servidor, limita el uso y solo envía números agregados a la IA.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa los valores
npm run dev                  # http://localhost:3000
```

### 1. Firebase
1. En la consola de Firebase → **Authentication → Sign-in method**: habilita *Correo/contraseña* y *Google*.
2. **Authentication → Settings → Authorized domains**: añade `rolobjj.netlify.app` (y tu dominio propio, si lo hay). Sin esto el login falla en producción.
3. Publica las reglas y los índices:
   ```bash
   npm i -g firebase-tools
   firebase deploy --only firestore
   ```
   (`firebase.json` ya apunta a la base de datos `ai-studio-rolobjjtracker-…`.)
4. **Hacer profesor a alguien:** crea su cuenta en la app y, en Firestore → `users/{uid}`, cambia el campo `role` a `profesor`. Los clientes no pueden cambiar su propio rol (lo impiden las reglas).

> La `apiKey` de `firebase-applet-config.json` es pública por diseño. Lo que protege los datos son `firestore.rules` y los dominios autorizados.

### 2. Variables de entorno del servidor (Netlify → Site settings → Environment variables)
| Variable | Para qué |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | JSON de una cuenta de servicio (Firebase → Configuración → Cuentas de servicio). Permite a la API leer Firestore. |
| `GEMINI_API_KEY` | Análisis con IA (opcional; sin ella la API responde 503). |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Alertas al profesor (opcional). |
| `GOOGLE_MAPS_PLATFORM_KEY` | Solo si usas mapas de Google; restríngela por dominio. |

### 3. Despliegue
- **Netlify** (`netlify.toml` incluido): compila con `npm run build:web` y sirve `/api/*` con `netlify/functions/api.mts`.
- **Cloud Run / Render / Railway:** `npm run build && npm start` (Express sirve `dist/` y `/api`).

## Seguridad
- `/api/analyze-performance` y `/api/alert-logs` requieren sesión; las alertas solo las ven los profesores.
- El cliente no envía datos al prompt: el servidor calcula las estadísticas desde Firestore.
- El mensaje a Telegram se construye en el servidor (tipo fijo + motivo saneado y recortado), con una alerta máxima por alumno y día.
- Límite de 5 análisis por hora y usuario (por instancia; en serverless es un freno básico, no una garantía).

## Estructura
```
src/context.tsx        Auth + datos en tiempo real (Firestore)
src/lib/progress.ts    Cálculo de progreso, rachas y estadísticas
src/data/techniques.ts Biblioteca de técnicas (nivel, tipo, visibilidad por cinturón)
server/api.ts          Lógica de la API (compartida por Express y Netlify)
firestore.rules        Reglas de seguridad
```

## Pendiente / ideas
- Mover la lista de academias a Firestore (hoy es de ejemplo) y descargar el mapa del globo en vez de pedirlo a unpkg.
- Editar/borrar sesiones, exportar historial, notificaciones.
- Política de privacidad y términos revisados legalmente (hay un borrador en el login).
- Imagen Open Graph para las vistas previas al compartir el enlace.
