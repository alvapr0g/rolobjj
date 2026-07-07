import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Telegram API helper
  const sendTelegramMessage = async (message: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
      console.warn("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en las variables de entorno.");
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("Error al enviar mensaje a Telegram:", error);
      return false;
    }
  };

  // In-memory alert logs
  interface AlertLog {
    id: string;
    date: string;
    studentName: string;
    message: string;
  }
  let alertLogs: AlertLog[] = [];

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/alert-logs", (req, res) => {
    res.json(alertLogs);
  });

  app.post("/api/test-telegram-alert", async (req, res) => {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (!token || !chatId) {
         return res.status(500).json({ error: "Faltan secretos de Telegram en el entorno." });
      }

      const studentName = req.body.studentName || "Juan Pérez";
      const mensaje = `Alerta: El estudiante ${studentName} bajó su asistencia un 30% esta semana.`;
      const success = await sendTelegramMessage(mensaje);
      if (success) {
        alertLogs.unshift({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          studentName,
          message: mensaje
        });
        res.json({ analysis: "Alerta de prueba enviada exitosamente.", alertSent: true });
      } else {
        res.status(500).json({ error: "Fallo al enviar la alerta a Telegram (la API devolvió error)." });
      }
    } catch (error: any) {
      console.error("Error en test de Telegram:", error);
      res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
  });

  app.post("/api/analyze-performance", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Falta GEMINI_API_KEY en las variables de entorno." });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { studentData } = req.body;

      const enviarAlertaTelegram: FunctionDeclaration = {
        name: "enviar_alerta_telegram",
        description: "Envía una notificación push a Telegram cuando se detecta un cambio crítico en el rendimiento de un estudiante.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            mensaje: {
              type: Type.STRING,
              description: "El texto detallado del rendimiento del alumno (ej: 'Alerta: El estudiante Juan Pérez bajó su asistencia un 30% esta semana')."
            }
          },
          required: ["mensaje"]
        }
      };

      const prompt = `Analiza los siguientes datos de rendimiento del estudiante de Jiu-Jitsu. 
Si notas que su rendimiento ha bajado significativamente, no está entrenando o está sobreentrenando, utiliza la herramienta enviar_alerta_telegram para notificar.
Si todo está normal o progresando bien, simplemente responde con un breve análisis positivo y no llames a la herramienta.

Datos del estudiante:
${JSON.stringify(studentData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un analista de rendimiento deportivo especializado en Brazilian Jiu-Jitsu. Tu objetivo es monitorear el progreso de los estudiantes.",
          tools: [{ functionDeclarations: [enviarAlertaTelegram] }],
        },
      });

      let alertSent = false;
      let aiResponseText = response.text || "";

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === "enviar_alerta_telegram") {
            const mensaje = call.args.mensaje as string;
            const success = await sendTelegramMessage(mensaje);
            if (success) {
              alertLogs.unshift({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                studentName: studentData.name,
                message: mensaje
              });
              alertSent = true;
            }
          }
        }
      }

      res.json({ analysis: aiResponseText, alertSent });

    } catch (error: any) {
      console.error("Error analizando rendimiento:", error);
      res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // In express 4 we use *
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
