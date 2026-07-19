import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, language } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const isEnglish = language === "en";
      const systemPrompt = `You are FinSim AI, an expert Financial Advisor. 
      You help users understand their personal finances.
      Use this context to give personalized advice:
      ${JSON.stringify(context, null, 2)}
      
      Keep answers concise, professional, and practical.
      IMPORTANT: You MUST reply in the language the user preferred. The user's preferred language is ${isEnglish ? 'English' : 'Spanish'}. Write all your advice and answers in ${isEnglish ? 'English' : 'Spanish'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: message,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate AI response." });
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
