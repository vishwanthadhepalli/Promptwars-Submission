import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  // Secure AI Proxy
  app.post("/api/ai/analyze", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s limit

    try {
      const { prompt, schema } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.length < 10) {
        clearTimeout(timeoutId);
        console.error("Critical: GEMINI_API_KEY is not set or is invalid.");
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is misconfigured. Please set a valid API key in the 'Settings' menu.",
          tip: "Visit https://aistudio.google.com/app/apikey to get a key."
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      // Pass the signal to signal potential cancellation if the SDK supports it 
      // Note: @google/generative-ai doesn't natively take an AbortSignal in generateContent yet
      // so we use a Promise.race to enforce the timeout on the server side
      
      const aiPromise = model.generateContent(prompt);
      const result = await Promise.race([
        aiPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('AbortError')), 15000))
      ]) as any;

      clearTimeout(timeoutId);
      const responseText = result.response.text();
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("AI Proxy Error:", error);
      
      if (error.message === 'AbortError') {
        return res.status(504).json({ error: "AI Timeout: The request took too long." });
      }

      // Specific detection for invalid API keys
      if (error?.message?.includes("API key not valid") || error?.status === 400) {
        return res.status(401).json({ 
          error: "Invalid Gemini API Key.",
          details: "The API key was rejected. Check your Secrets in the Settings menu."
        });
      }

      res.status(500).json({ error: error.message || "Failed to process AI request" });
    }
  });

  // --- Web App Serving ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
