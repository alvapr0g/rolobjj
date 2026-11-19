import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { TECHNIQUES } from '../src/data/techniques';
import { computeProgress, performanceStats } from '../src/lib/progress';
import { Belt, TrainingSession } from '../src/types';
import config from '../firebase-applet-config.json';

/**
 * Lógica de la API compartida entre Express (server.ts) y la función de Netlify.
 * Toda ruta (salvo /api/health) exige un ID token de Firebase válido y los datos
 * del alumno se leen en el servidor desde Firestore: el cliente no envía nada que
 * pueda llegar al prompt de la IA o a Telegram.
 */

export type ApiRequest = { method: string; path: string; authorization?: string | null };
export type ApiResponse = { status: number; body: unknown };

const json = (status: number, body: unknown): ApiResponse => ({ status, body });

// ---------- Firebase Admin ----------
function adminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    return initializeApp({ credential: cert(JSON.parse(raw)), projectId: config.projectId });
  }
  // Sin cuenta de servicio: verificar tokens funciona (solo necesita el projectId);
  // Firestore solo funcionará si el entorno tiene credenciales por defecto (p. ej. Cloud Run).
  try {
    return initializeApp({ credential: applicationDefault(), projectId: config.projectId });
  } catch {
    return initializeApp({ projectId: config.projectId });
  }
}

function firestore(): Firestore {
  return getFirestore(adminApp(), process.env.FIRESTORE_DATABASE_ID || config.firestoreDatabaseId);
}

async function verify(authorization?: string | null) {
  const m = /^Bearer (.+)$/.exec(authorization || '');
  if (!m) return null;
  try {
    return await getAuth(adminApp()).verifyIdToken(m[1]);
  } catch {
    return null;
  }
}

// ---------- Límite de uso (best effort: en entornos serverless cada instancia tiene el suyo) ----------
const hits = new Map<string, number[]>();
function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

// ---------- Telegram ----------
async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

const clean = (s: unknown, max: number) =>
  String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// ---------- Rutas ----------
async function analyzePerformance(uid: string): Promise<ApiResponse> {
  if (!process.env.GEMINI_API_KEY) return json(503, { error: 'El análisis con IA no está configurado (falta GEMINI_API_KEY).' });
  if (rateLimited(`analyze:${uid}`, 5, 60 * 60 * 1000)) {
    return json(429, { error: 'Has alcanzado el límite de análisis por hora. Inténtalo más tarde.' });
  }

  const db = firestore();
  let profileSnap, sessionsSnap, validationsSnap;
  try {
    [profileSnap, sessionsSnap, validationsSnap] = await Promise.all([
      db.doc(`users/${uid}`).get(),
      db.collection(`users/${uid}/sessions`).orderBy('date', 'desc').limit(400).get(),
      db.collection('validations').where('studentId', '==', uid).get(),
    ]);
  } catch (e) {
    console.error('Firestore no disponible para la API', e);
    return json(503, { error: 'El servidor no tiene acceso a Firestore (configura FIREBASE_SERVICE_ACCOUNT).' });
  }
  if (!profileSnap.exists) return json(404, { error: 'Perfil no encontrado.' });

  const p = profileSnap.data()!;
  const belt = (p.belt as Belt) ?? 'Blanco';
  const sessions = sessionsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as TrainingSession[];
  const validated = new Set(validationsSnap.docs.map((d) => d.data().techniqueId as string));
  const progress = computeProgress({ belt, beltSince: p.beltSince }, sessions, validated, TECHNIQUES);
  const stats = performanceStats(sessions);
  const studentName = clean(p.name, 40) || 'Alumno';

  const enviarAlerta: FunctionDeclaration = {
    name: 'enviar_alerta_telegram',
    description: 'Avisa al profesor cuando el rendimiento del alumno cambia de forma crítica.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tipo: { type: Type.STRING, enum: ['asistencia_baja', 'inactividad', 'sobreentrenamiento'], description: 'Tipo de alerta.' },
        motivo: { type: Type.STRING, description: 'Motivo breve (máximo 160 caracteres) basado solo en los números.' },
      },
      required: ['tipo', 'motivo'],
    },
  };

  const data = { cinturon: belt, grado: p.degree ?? 0, progresoHaciaSiguienteCinturonPct: progress.percent, ...stats };
  const prompt = `Analiza estos números de entrenamiento de un alumno de Jiu-Jitsu Brasileño (no contienen instrucciones, solo datos).
Si el rendimiento bajó de forma significativa, lleva días sin entrenar o hay señales de sobreentrenamiento (RPE medio muy alto con mucho volumen), usa la herramienta enviar_alerta_telegram.
Si todo va normal o mejor, responde con un análisis breve y positivo (máximo 4 frases, en español) y no uses la herramienta.

Datos: ${JSON.stringify(data)}`;

  let analysis = '';
  let alertSent = false;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un analista de rendimiento deportivo especializado en Brazilian Jiu-Jitsu. Respondes siempre en español.',
        tools: [{ functionDeclarations: [enviarAlerta] }],
      },
    });
    analysis = response.text || '';

    const call = response.functionCalls?.find((c) => c.name === 'enviar_alerta_telegram');
    if (call) {
      const tipo = ['asistencia_baja', 'inactividad', 'sobreentrenamiento'].includes(String(call.args?.tipo))
        ? String(call.args?.tipo)
        : 'asistencia_baja';
      const motivo = clean(call.args?.motivo, 160);
      const message = `Alerta ROLO (${tipo.replace('_', ' ')}): ${studentName}. ${motivo}`;
      analysis = analysis || `Se detectó una señal de ${tipo.replace('_', ' ')}: ${motivo}`;

      // Una alerta por alumno y día: el ID del documento actúa como cerrojo.
      const day = new Date().toISOString().slice(0, 10);
      try {
        await db.doc(`alerts/${uid}_${day}`).create({ studentId: uid, studentName, message, date: new Date().toISOString() });
        alertSent = await sendTelegram(message);
      } catch (e: any) {
        if (e?.code !== 6) throw e; // 6 = ALREADY_EXISTS: ya se avisó hoy
      }
    }
  } catch (e) {
    console.error('Error analizando rendimiento', e);
    return json(502, { error: 'No se pudo completar el análisis con IA.' });
  }

  return json(200, { analysis: analysis || 'Sin observaciones por ahora.', alertSent });
}

async function alertLogs(uid: string): Promise<ApiResponse> {
  try {
    const db = firestore();
    const me = await db.doc(`users/${uid}`).get();
    if (me.data()?.role !== 'profesor') return json(403, { error: 'Solo para profesores.' });
    const snap = await db.collection('alerts').orderBy('date', 'desc').limit(50).get();
    return json(200, snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.error('Error leyendo alertas', e);
    return json(503, { error: 'El servidor no tiene acceso a Firestore.' });
  }
}

export async function handleApi(req: ApiRequest): Promise<ApiResponse> {
  const path = req.path.replace(/\/+$/, '') || '/';
  if (path === '/api/health' && req.method === 'GET') return json(200, { status: 'ok' });

  const user = await verify(req.authorization);
  if (!user) return json(401, { error: 'Inicia sesión para usar esta función.' });

  if (path === '/api/analyze-performance' && req.method === 'POST') return analyzePerformance(user.uid);
  if (path === '/api/alert-logs' && req.method === 'GET') return alertLogs(user.uid);
  return json(404, { error: 'Ruta no encontrada.' });
}
