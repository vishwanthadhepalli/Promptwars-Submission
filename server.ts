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
    try {
      const { prompt, schema } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.length < 10) {
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

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      
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
